"""End-to-end smoke checks for a freshly seeded AlgoArcher server."""
import os, sys, time
from pathlib import Path
import requests
from openpyxl import load_workbook

BASE = os.getenv('SMOKE_BASE_URL', 'http://127.0.0.1:8010')
ROOT = Path(__file__).resolve().parents[1]
results = []

def check(name, fn):
    try:
        fn(); results.append((name, 'PASS', ''))
    except Exception as exc:
        results.append((name, 'FAIL', str(exc)))

def expect(condition, reason):
    if not condition: raise AssertionError(reason)

def login(email, password):
    r = requests.post(BASE + '/auth/login', json={'email': email, 'password': password}, timeout=10)
    expect(r.status_code == 200, f'login HTTP {r.status_code}: {r.text}')
    data = r.json(); return data, {'Authorization': 'Bearer ' + data['access_token']}

def json_get(path, headers):
    r = requests.get(BASE + path, headers=headers, timeout=10)
    expect(r.status_code == 200, f'{path} HTTP {r.status_code}: {r.text}')
    return r.json()

def main():
    admin, ah = login('admin@college.edu', 'Admin@123')
    faculty, fh = login('faculty1@college.edu', 'F001')
    student, sh = login('alice@college.edu', 'S001')
    course_id = None

    def student_courses():
        nonlocal course_id
        data = json_get('/student/courses', sh)
        expect(len(data) >= 1, 'no enrolled courses')
        course_id = data[0]['id']
    check('student courses', student_courses)

    def problem_list():
        expect(course_id is not None, 'course id unavailable')
        data = json_get(f'/courses/{course_id}/problems', sh)
        expect(data and all('solved' in p for p in data), 'problems missing solved flag')
    check('student problem list and solved flag', problem_list)

    correct = 'n=int(input())\na=list(map(int,input().split()))\nprint(sum(a))'
    wrong = 'print(0)'
    def accepted_submit():
        time.sleep(3.1)
        r = requests.post(BASE + '/problems/1/submit', headers=sh, json={'source_code': correct, 'course_id': course_id}, timeout=30)
        expect(r.status_code == 200, f'correct submit HTTP {r.status_code}: {r.text}')
        data = r.json(); expect(data.get('verdict') == 'ACCEPTED', f'verdict={data.get("verdict")}')
        expect(not any(k in data for k in ('tests','hidden','expected','input')), 'hidden test data exposed')
    check('correct Sum of Array submit', accepted_submit)

    def wrong_submit():
        time.sleep(3.1)
        r = requests.post(BASE + '/problems/1/submit', headers=sh, json={'source_code': wrong, 'course_id': course_id}, timeout=30)
        expect(r.status_code == 200, f'wrong submit HTTP {r.status_code}: {r.text}')
        expect(r.json().get('verdict') == 'WRONG_ANSWER', f'verdict={r.json().get("verdict")}')
    check('wrong Sum of Array submit', wrong_submit)

    def persistence():
        data = json_get(f'/courses/{course_id}/problems', sh)
        p = next(x for x in data if x['id'] == 1); expect(p['solved'] in (1, True), 'problem not solved after accepted then wrong')
    check('solved persists after later wrong submit', persistence)

    def student_views():
        lb = json_get(f'/courses/{course_id}/leaderboard', sh)
        expect(all(k in lb for k in ('rows','total','my_rank')), 'leaderboard missing rows/total/my_rank')
        dash = json_get('/student/dashboard', sh); expect('courses' in dash, 'dashboard missing courses')
        heat = json_get('/student/heatmap', sh); expect(isinstance(heat, list), 'heatmap is not a list')
    check('student leaderboard/dashboard/heatmap', student_views)

    def faculty_views():
        cs = json_get('/faculty/courses', fh); expect(cs, 'faculty has no courses')
        cid = cs[0]['id']
        d = json_get(f'/faculty/courses/{cid}/dashboard', fh); expect(d.get('students') is not None, 'missing students')
        expect(all(k in d['students'][0] for k in ('easy','medium','hard','total')), 'faculty counts missing')
        filtered = requests.get(BASE+f'/faculty/courses/{cid}/dashboard?section=B', headers=fh, timeout=20)
        expect(filtered.status_code == 200, f'filtered dashboard HTTP {filtered.status_code}: {filtered.text}')
        fd = filtered.json(); expect(len(fd.get('students', [])) < len(d['students']), 'section filter did not narrow results')
        expect(fd['students'] and all(str(x.get('section')) == 'B' for x in fd['students']), 'filtered dashboard contains non-B students')
        r = requests.get(BASE+f'/faculty/courses/{cid}/report', headers=fh, timeout=20); expect(r.status_code == 200, f'report HTTP {r.status_code}')
        wb = load_workbook(__import__('io').BytesIO(r.content), read_only=True); headers=tuple(next(wb.active.iter_rows(values_only=True)))
        expect(headers[:2] == ('Reg No','Student Name'), f'bad xlsx headers {headers}')
        fr = requests.get(BASE+f'/faculty/courses/{cid}/report?section=B', headers=fh, timeout=20)
        expect(fr.status_code == 200, f'filtered report HTTP {fr.status_code}: {fr.text}')
        fwb = load_workbook(__import__('io').BytesIO(fr.content), read_only=True); rows=list(fwb.active.iter_rows(min_row=2, values_only=True))
        expect(rows and all(str(row[4]) == 'B' for row in rows), 'filtered report contains non-B students')
        outside = requests.get(BASE+f'/faculty/courses/{cid}/dashboard?dept=AIDS', headers=fh, timeout=20)
        expect(outside.status_code == 403, f'out-of-scope filter returned {outside.status_code}')
    check('faculty courses/dashboard/report', faculty_views)

    def admin_views():
        q='?year=2&dept=CSE&section=A&faculty_id=1&page=1'
        d=json_get('/admin/dashboard'+q, ah); expect(len(d.get('students',[]))<=20,'page exceeds 20'); expect('top_10' in d,'missing top_10 list')
        expect(all(x.get('year')==2 or str(x.get('year'))=='2' for x in d.get('students',[])), 'year filter failed')
    check('admin filters/pagination/top-10', admin_views)

    def uploads():
        for filename,endpoint in [('sample_students.xlsx','/admin/upload/students'),('sample_faculty.xlsx','/admin/upload/faculty')]:
            path=ROOT/filename; expect(path.exists(), f'missing {filename}')
            vals=[]
            for _ in range(2):
                with path.open('rb') as f:r=requests.post(BASE+endpoint,headers=ah,files={'file':(filename,f,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')},timeout=20)
                expect(r.status_code==200,f'{endpoint} HTTP {r.status_code}: {r.text}');vals.append(r.json())
            expect(vals[1].get('created')==0 and not vals[1].get('failed'),f'{filename} second upload {vals[1]}')
        bad=ROOT/'sample_students_bad.xlsx';expect(bad.exists(),'missing bad-email workbook')
        with bad.open('rb') as f:r=requests.post(BASE+'/admin/upload/students',headers=ah,files={'file':('sample_students_bad.xlsx',f,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')},timeout=20)
        expect(r.status_code==200 and r.json().get('failed'),f'bad email not reported: {r.text}')
        expect(any('email' in x['reason'] for x in r.json()['failed']),'failure reason does not mention email')
    check('admin student/faculty uploads and duplicate protection', uploads)

    def guards():
        for path in ('/admin/dashboard','/faculty/courses'):
            r=requests.get(BASE+path,headers=sh);expect(r.status_code==403,f'student {path} returned {r.status_code}')
        expect(requests.get(BASE+'/admin/dashboard',headers=fh).status_code==403,'faculty admin guard failed')
        expect(requests.get(BASE+'/student/courses').status_code==401,'unauthenticated guard failed')
    check('role guards', guards)

    def invalid_action():
        time.sleep(3.1);r=requests.post(BASE+'/problems/1/anything',headers=sh,json={'source_code':correct, 'course_id':course_id});expect(r.status_code==404,f'HTTP {r.status_code}')
    check('invalid problem action returns 404', invalid_action)

    print('check | result | reason')
    print('--------------------------')
    for name,status,reason in results: print(f'{name} | {status} | {reason}')
    failed=sum(status=='FAIL' for _,status,_ in results)
    print(f'\nSummary: {len(results)-failed} passed, {failed} failed')
    return 1 if failed else 0

if __name__ == '__main__': sys.exit(main())
