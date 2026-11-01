from fastapi import APIRouter,Depends,HTTPException
from fastapi.responses import StreamingResponse
from openpyxl import Workbook,load_workbook
import io,re
from app.db import db
from app.security import guard
router=APIRouter()
def faculty_scope(c,cid,uid,dept=None,year:int=None,section=None):
 faculty=c.execute("select dept,year,section from users where id=? and role='faculty'",(uid,)).fetchone()
 if not c.execute('select 1 from faculty_courses where faculty_id=? and course_id=?',(uid,cid)).fetchone():raise HTTPException(403,'Forbidden')
 scope=["e.course_id=?","exists (select 1 from student_faculties sf where sf.student_id=s.id and sf.faculty_id=?)"]
 params=[cid,uid]
 for col,val in (("dept",dept),("year",year),("section",section)):
  if val is not None:scope.append(f"s.{col}=?");params.append(val)
 if not c.execute("select 1 from users s join enrollments e on e.student_id=s.id where "+' and '.join(scope)+" limit 1",params).fetchone():raise HTTPException(403,'Filter is outside your mapped scope')
 return faculty
def data(cid,uid,dept=None,year:int=None,section=None):
 c=db();faculty=faculty_scope(c,cid,uid,dept,year,section)
 clauses=["e.course_id=?","(exists (select 1 from student_faculties sf where sf.student_id=s.id and sf.faculty_id=?) or (not exists (select 1 from student_faculties sf where sf.student_id=s.id) and s.dept=? and s.year=? and s.section=?))"]
 params=[cid,uid,faculty['dept'],faculty['year'],faculty['section']]
 for col,val in (('dept',dept),('year',year),('section',section)):
  if val is not None:clauses.append(f's.{col}=?');params.append(val)
 rows=c.execute("select s.reg_no,s.name,s.dept,s.year,s.section,coalesce(sum(case when p.difficulty='easy' and a.problem_id is not null then 1 else 0 end),0) easy,coalesce(sum(case when p.difficulty='medium' and a.problem_id is not null then 1 else 0 end),0) medium,coalesce(sum(case when p.difficulty='hard' and a.problem_id is not null then 1 else 0 end),0) hard from users s join enrollments e on e.student_id=s.id left join course_problems cp on cp.course_id=e.course_id left join problems p on p.id=cp.problem_id left join (select distinct student_id,problem_id,course_id from submissions where status='ACCEPTED') a on a.student_id=s.id and a.problem_id=p.id and a.course_id=e.course_id where "+' and '.join(clauses)+" group by s.id order by s.reg_no",params).fetchall();course=c.execute('select code from courses where id=?',(cid,)).fetchone();c.close()
 if not course:raise HTTPException(404,'Course not found')
 out=[dict(x) for x in rows]
 for x in out:x['total']=x['easy']+x['medium']+x['hard']
 return course['code'],out
def filter_value(value):return str(value) if value is not None else 'all'
@router.get('/faculty/courses')
def courses(u=Depends(guard('faculty'))):
 c=db();r=c.execute('select c.* from courses c join faculty_courses f on f.course_id=c.id where f.faculty_id=?',(u['id'],)).fetchall();c.close();return [dict(x) for x in r]
@router.get('/faculty/courses/{cid}/filters')
def filters(cid:int,u=Depends(guard('faculty'))):
 _,rows=data(cid,u['id']);return {'dept':sorted({str(x['dept']) for x in rows}),'year':sorted({x['year'] for x in rows}),'section':sorted({str(x['section']) for x in rows})}
@router.get('/faculty/courses/{cid}/dashboard')
def dashboard(cid:int,dept:str=None,year:int=None,section:str=None,u=Depends(guard('faculty'))):
 code,rows=data(cid,u['id'],dept,year,section);average=sum(i['total'] for i in rows)/len(rows) if rows else 0;return {'students':rows,'average':average,'average_solved':average}
@router.get('/faculty/courses/{cid}/report')
def report(cid:int,dept:str=None,year:int=None,section:str=None,u=Depends(guard('faculty'))):
 code,rows=data(cid,u['id'],dept,year,section);w=Workbook();s=w.active;s.append(['Reg No','Student Name','Dept','Year','Section','Easy Solved','Medium Solved','Hard Solved','Total Solved'])
 for i in rows:s.append([i['reg_no'],i['name'],i['dept'],i['year'],i['section'],i['easy'],i['medium'],i['hard'],i['total']])
 b=io.BytesIO();w.save(b);b.seek(0)
 filename='course-'+re.sub(r'[^A-Za-z0-9_-]','_',str(code))+'-'+filter_value(dept)+'-'+filter_value(section)+'.xlsx'
 return StreamingResponse(b,media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',headers={'Content-Disposition':f'attachment; filename={filename}'})
