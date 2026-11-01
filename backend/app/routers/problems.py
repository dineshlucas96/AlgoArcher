import json,asyncio,time
from fastapi import APIRouter,Depends,HTTPException
from app.db import db
from app.security import guard,course_access
from app.execution import run_one
router=APIRouter();last_exec={}
def ensure_schema(c):
 c.execute('create table if not exists submissions(id integer primary key,student_id,problem_id,course_id,status,passed_tests,total_tests,runtime_ms,code,created_at)')
 cols=[x['name'] for x in c.execute('pragma table_info(submissions)').fetchall()]
 if 'course_id' not in cols:c.execute('alter table submissions add column course_id')
@router.get('/courses/{cid}/problems')
def problems(cid:int,u=Depends(guard('student','faculty','admin'))):
 c=db();course_access(c,cid,u);r=c.execute("select p.*,case when s.problem_id is not null then 1 else 0 end solved from problems p join course_problems cp on cp.problem_id=p.id left join (select distinct student_id,problem_id,course_id from submissions where status='ACCEPTED') s on s.problem_id=p.id and s.course_id=cp.course_id and s.student_id=? where cp.course_id=?",(u['id'],cid)).fetchall();c.close();return [dict(x) for x in r]
@router.get('/problems/{pid}')
def problem(pid:int,course_id:int,u=Depends(guard('student','faculty','admin'))):
 c=db();course_access(c,course_id,u);r=c.execute('select p.* from problems p join course_problems cp on cp.problem_id=p.id where p.id=? and cp.course_id=?',(pid,course_id)).fetchone();c.close()
 if not r:raise HTTPException(404,'Problem not found')
 x=dict(r);x['samples']=json.loads(x['samples']);return x
@router.post('/problems/{pid}/{action}')
async def execute(pid:int,action:str,payload:dict,course_id:int|None=None,u=Depends(guard('student'))):
 if action not in ('run','submit'):raise HTTPException(404)
 selected_course=course_id if course_id is not None else payload.get('course_id')
 try:selected_course=int(selected_course)
 except (TypeError,ValueError):raise HTTPException(400,'course_id is required')
 now=time.time()
 if now-last_exec.get(u['id'],0)<3:raise HTTPException(429,'Please wait 3 seconds between runs/submits')
 c=db()
 enrolled=c.execute('select 1 from enrollments where student_id=? and course_id=?',(u['id'],selected_course)).fetchone()
 p=c.execute('select p.* from problems p join course_problems cp on cp.problem_id=p.id where p.id=? and cp.course_id=?',(pid,selected_course)).fetchone()
 if not enrolled or not p:c.close();raise HTTPException(400,'Problem is not in this course or student is not enrolled')
 last_exec[u['id']]=now;ensure_schema(c);c.commit();c.close()
 tests=[(x['input'],x['output']) for x in json.loads(p['tests'])];visible=tests[:2] if action=='run' else tests;results=await asyncio.gather(*[run_one(payload.get('source_code',''),a,b) for a,b in visible]);passed=sum(x['verdict']=='ACCEPTED' for x in results);verdict='ACCEPTED' if passed==len(results) else next(x['verdict'] for x in results if x['verdict']!='ACCEPTED');runtime=sum(x['runtime_ms'] for x in results)
 if action=='submit':
  c=db();ensure_schema(c);c.execute('insert into submissions(student_id,problem_id,course_id,status,passed_tests,total_tests,runtime_ms,code,created_at) values(?,?,?,?,?,?,?,?,datetime("now"))',(u['id'],pid,selected_course,verdict,passed,len(results),runtime,payload.get('source_code','')));c.commit();c.close()
 return {'verdict':verdict,'passed':passed,'total':len(results),'runtime_ms':runtime,'cases':results if action=='run' else [{'verdict':x['verdict'],'runtime_ms':x['runtime_ms']} for x in results]}
