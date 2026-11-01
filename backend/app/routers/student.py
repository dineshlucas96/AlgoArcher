import json,datetime
from fastapi import APIRouter,Depends
from app.db import db
from app.security import guard,current
router=APIRouter()
@router.get('/student/courses')
def courses(u=Depends(guard('student'))):
 c=db();r=c.execute('select c.*,count(cp.problem_id) total from courses c join enrollments e on e.course_id=c.id left join course_problems cp on cp.course_id=c.id where e.student_id=? group by c.id',(u['id'],)).fetchall();c.close();return [dict(x) for x in r]
@router.get('/courses/{cid}/problems')
def course_problems(cid:int,u=Depends(current)):
 c=db();r=c.execute("select p.*,case when a.problem_id is not null then 1 else 0 end solved from problems p join course_problems cp on cp.problem_id=p.id left join (select distinct student_id,problem_id,course_id from submissions where status='ACCEPTED') a on a.student_id=? and a.problem_id=p.id and a.course_id=cp.course_id where cp.course_id=? order by p.id",(u['id'],cid)).fetchall();c.close();return [dict(x) for x in r]
@router.get('/courses/{cid}/leaderboard')
def leaderboard(cid:int,u=Depends(current)):
 c=db();rows=c.execute("select u.id,u.name,u.reg_no,count(distinct case when a.problem_id is not null then a.problem_id end) solved,coalesce(sum(case when a.problem_id is not null then p.points else 0 end),0) points,rank() over(order by count(distinct case when a.problem_id is not null then a.problem_id end) desc,coalesce(sum(case when a.problem_id is not null then p.points else 0 end),0) desc) rank from users u join enrollments e on e.student_id=u.id left join course_problems cp on cp.course_id=e.course_id left join problems p on p.id=cp.problem_id left join (select distinct student_id,problem_id,course_id from submissions where status='ACCEPTED') a on a.student_id=u.id and a.problem_id=p.id and a.course_id=e.course_id where e.course_id=? group by u.id order by rank,u.reg_no",(cid,)).fetchall();c.close();data=[dict(x) for x in rows];me=next((x for x in data if x['id']==u['id']),None);return {'rows':[{'rank':int(x['rank']),'name':x['name'],'reg_no':x['reg_no'],'solved':x['solved'],'points':x['points'],'current':x['id']==u['id']} for x in data],'my_rank':int(me['rank']) if me else None,'your_rank':int(me['rank']) if me else None,'total':len(data)}
@router.get('/student/dashboard')
def dashboard(u=Depends(guard('student'))):
 c=db();rows=c.execute("select c.id,c.code,c.name,count(cp.problem_id) total,count(distinct case when a.problem_id is not null then a.problem_id end) solved,sum(case when p.difficulty='easy' and a.problem_id is not null then 1 else 0 end) easy,sum(case when p.difficulty='medium' and a.problem_id is not null then 1 else 0 end) medium,sum(case when p.difficulty='hard' and a.problem_id is not null then 1 else 0 end) hard from courses c join enrollments e on e.course_id=c.id left join course_problems cp on cp.course_id=c.id left join problems p on p.id=cp.problem_id left join (select distinct student_id,problem_id,course_id from submissions where status='ACCEPTED') a on a.student_id=e.student_id and a.problem_id=p.id and a.course_id=c.id where e.student_id=? group by c.id",(u['id'],)).fetchall();dates=c.execute("select distinct date(first_at) day from (select problem_id,course_id,min(created_at) first_at from submissions where student_id=? and status='ACCEPTED' group by problem_id,course_id)",(u['id'],)).fetchall();c.close();days={x['day'] for x in dates};today=datetime.date.today();streak=0
 for i in range(365):
  if (today-datetime.timedelta(days=i)).isoformat() in days:streak+=1
  elif i>0:break
 return {'courses':[dict(x) for x in rows],'streak':streak}
@router.get('/student/heatmap')
def heatmap(u=Depends(guard('student'))):
 c=db();r=c.execute("select date(first_at) date,count(*) count from (select problem_id,min(created_at) first_at from submissions where student_id=? and status='ACCEPTED' group by problem_id) group by date(first_at) order by date(first_at) desc limit 365",(u['id'],)).fetchall();c.close();return [dict(x) for x in r]
