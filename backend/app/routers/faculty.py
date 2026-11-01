from fastapi import APIRouter,Depends,HTTPException
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
import io
from app.db import db
from app.security import guard
router=APIRouter()
def data(cid,uid):
 c=db()
 if not c.execute('select 1 from faculty_courses where faculty_id=? and course_id=?',(uid,cid)).fetchone(): c.close(); raise HTTPException(403,'Forbidden')
 rows=c.execute("select s.reg_no,s.name,coalesce(sum(case when p.difficulty='easy' and a.problem_id is not null then 1 else 0 end),0) easy,coalesce(sum(case when p.difficulty='medium' and a.problem_id is not null then 1 else 0 end),0) medium,coalesce(sum(case when p.difficulty='hard' and a.problem_id is not null then 1 else 0 end),0) hard from users s join enrollments e on e.student_id=s.id left join course_problems cp on cp.course_id=e.course_id left join problems p on p.id=cp.problem_id left join (select distinct student_id,problem_id,course_id from submissions where status='ACCEPTED') a on a.student_id=s.id and a.problem_id=p.id and a.course_id=e.course_id where e.course_id=? and (exists (select 1 from student_faculties sf where sf.student_id=s.id and sf.faculty_id=?) or (not exists (select 1 from student_faculties sf where sf.student_id=s.id) and s.dept=(select dept from users where id=?) and s.year=(select year from users where id=?) and s.section=(select section from users where id=?))) group by s.id order by s.reg_no",(cid,uid,uid,uid,uid)).fetchall();c.close();out=[dict(x) for x in rows]
 for x in out:x['total']=x['easy']+x['medium']+x['hard']
 return out
@router.get('/faculty/courses')
def courses(u=Depends(guard('faculty'))):
 c=db();r=c.execute('select c.* from courses c join faculty_courses f on f.course_id=c.id where f.faculty_id=?',(u['id'],)).fetchall();c.close();return [dict(x) for x in r]
@router.get('/faculty/courses/{cid}/dashboard')
def dashboard(cid:int,u=Depends(guard('faculty'))):
 x=data(cid,u['id']);a=sum(i['total'] for i in x)/len(x) if x else 0;return {'students':x,'average':a,'average_solved':a}
@router.get('/faculty/courses/{cid}/report')
def report(cid:int,u=Depends(guard('faculty'))):
 x=data(cid,u['id']);w=Workbook();s=w.active;s.append(['Reg No','Student Name','Easy Solved','Medium Solved','Hard Solved','Total Solved'])
 for i in x:s.append([i['reg_no'],i['name'],i['easy'],i['medium'],i['hard'],i['total']])
 b=io.BytesIO();w.save(b);b.seek(0);return StreamingResponse(b,media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',headers={'Content-Disposition':'attachment; filename=course-report.xlsx'})
