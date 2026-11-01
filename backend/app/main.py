import base64,hashlib,hmac,json,os,sqlite3,time,io,asyncio,tempfile,subprocess,logging,sys
import httpx
from fastapi import FastAPI,Depends,HTTPException,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel,EmailStr
from openpyxl import Workbook,load_workbook
from fastapi.responses import StreamingResponse
DB=os.getenv('DB_PATH','algorcher.db'); SECRET=os.getenv('JWT_SECRET','dev-secret'); JUDGE0_URL=os.getenv('JUDGE0_URL','http://localhost:2358'); USE_LOCAL_RUNNER=os.getenv('USE_LOCAL_RUNNER','false').lower()=='true'; last_exec={}
app=FastAPI(title='AlgoArcher API'); app.add_middleware(CORSMiddleware,allow_origin_regex=r'http://(localhost|127\.0\.0\.1)(:\d+)?',allow_credentials=True,allow_methods=['*'],allow_headers=['*']); bearer=HTTPBearer()
def db(): c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; return c
def make_token(u):
 p=base64.urlsafe_b64encode(json.dumps({'id':u['id'],'role':u['role'],'exp':time.time()+86400}).encode()).decode(); return p+'.'+hmac.new(SECRET.encode(),p.encode(),hashlib.sha256).hexdigest()
def current(c=Depends(bearer)):
 try:p,s=c.credentials.split('.'); x=json.loads(base64.urlsafe_b64decode(p)); assert hmac.compare_digest(s,hmac.new(SECRET.encode(),p.encode(),hashlib.sha256).hexdigest()) and x['exp']>time.time(); return x
 except: raise HTTPException(401,'Invalid token')
def guard(*roles):
 def dep(u=Depends(current)):
  if u['role'] not in roles: raise HTTPException(403,'Forbidden')
  return u
 return dep
class Login(BaseModel): email:EmailStr; password:str
@app.post('/auth/login')
def login(x:Login):
 c=db();u=c.execute('select * from users where email=? and password=?',(x.email,x.password)).fetchone();c.close()
 if not u:raise HTTPException(401,'Invalid email or password')
 return {'access_token':make_token(u),'user':dict(id=u['id'],name=u['name'],role=u['role'],must_change_pw=bool(u['must_change_pw']))}
@app.get('/student/courses')
def courses(u=Depends(guard('student'))):
 c=db();r=c.execute('select c.*,count(cp.problem_id) total from courses c join enrollments e on e.course_id=c.id left join course_problems cp on cp.course_id=c.id where e.student_id=? group by c.id',(u['id'],)).fetchall();c.close();return [dict(x) for x in r]
@app.get('/courses/{cid}/problems')
def problems(cid:int,u=Depends(current)):
 c=db();r=c.execute("select p.*,case when s.problem_id is not null then 1 else 0 end solved from problems p join course_problems cp on cp.problem_id=p.id left join (select distinct student_id,problem_id from submissions where status='ACCEPTED') s on s.problem_id=p.id and s.student_id=? where cp.course_id=?",(u['id'],cid)).fetchall();c.close();return [dict(x) for x in r]
@app.get('/problems/{pid}')
def problem(pid:int,course_id:int,u=Depends(current)):
 c=db();r=c.execute('select p.* from problems p join course_problems cp on cp.problem_id=p.id where p.id=? and cp.course_id=?',(pid,course_id)).fetchone();c.close()
 if not r:raise HTTPException(404,'Problem not found')
 x=dict(r);x['samples']=json.loads(x['samples']);return x
async def run_one(code,stdin,expected):
 if USE_LOCAL_RUNNER:
  raise_local=RuntimeError('local runner selected')
  try: raise raise_local
  except RuntimeError: pass
 try:
  async with httpx.AsyncClient(timeout=0.2 if USE_LOCAL_RUNNER else 8) as client:
   r=await client.post(f'{JUDGE0_URL}/submissions?base64_encoded=false&wait=true',json={'source_code':code,'language_id':71,'stdin':stdin,'expected_output':expected,'cpu_time_limit':2,'memory_limit':128000});x=r.json();v={3:'ACCEPTED',4:'WRONG_ANSWER',5:'TIME_LIMIT',6:'COMPILE_ERROR',7:'RUNTIME_ERROR',8:'RUNTIME_ERROR',9:'RUNTIME_ERROR',10:'RUNTIME_ERROR',11:'RUNTIME_ERROR',12:'RUNTIME_ERROR'}.get(x.get('status',{}).get('id'),'RUNTIME_ERROR');return {'verdict':v,'actual':x.get('stdout') or x.get('stderr') or x.get('compile_output') or '','runtime_ms':int(float(x.get('time') or 0)*1000)}
 except Exception:
  if not USE_LOCAL_RUNNER:raise HTTPException(503,'Judge0 is unreachable. Start Judge0 or set USE_LOCAL_RUNNER=true for demo mode.')
  logging.warning('USE_LOCAL_RUNNER active: Judge0 unavailable; executing local Python subprocess.')
  f=None
  try:
   fd,f=tempfile.mkstemp(suffix=".py"); os.close(fd)
   with open(f,"w",encoding="utf8") as h: h.write(code)
   try:
    completed=subprocess.run([sys.executable,f],input=stdin,capture_output=True,text=True,timeout=2)
   except subprocess.TimeoutExpired:
    return {"verdict":"TIME_LIMIT","actual":"","runtime_ms":2000}
   if completed.returncode!=0:
    return {"verdict":"RUNTIME_ERROR","actual":completed.stderr[-500:],"runtime_ms":0}
   verdict="ACCEPTED" if completed.stdout.strip()==expected.strip() else "WRONG_ANSWER"
   return {"verdict":verdict,"actual":completed.stdout,"runtime_ms":0}
  except Exception as exc:
   logging.exception("Local runner failed")
   return {"verdict":"RUNTIME_ERROR","actual":str(exc),"runtime_ms":0}
  finally:
   if f:
    try: os.unlink(f)
    except OSError: logging.exception("Failed to delete local runner temp file: %s",f)
@app.post('/problems/{pid}/{action}')
async def execute(pid:int,action:str,payload:dict,u=Depends(guard('student'))):
    if action not in ('run','submit'): raise HTTPException(404)
    now=time.time(); iflast=last_exec.get(u['id'],0)
    if now-iflast<3: raise HTTPException(429,'Please wait 3 seconds between runs/submits')
    last_exec[u['id']]=now; c=db(); p=c.execute('select * from problems where id=?',(pid,)).fetchone(); c.close()
    if not p: raise HTTPException(404,'Problem not found')
    tests=[(x['input'],x['output']) for x in json.loads(p['tests'])]; visible=tests[:2] if action=='run' else tests
    try: results=await asyncio.gather(*[run_one(payload.get('source_code',''),a,b) for a,b in visible])
    except HTTPException: raise
    passed=sum(x['verdict']=='ACCEPTED' for x in results); verdict='ACCEPTED' if passed==len(results) else next(x['verdict'] for x in results if x['verdict']!='ACCEPTED')
    if action=='submit':
        if verdict=='ACCEPTED': c.execute("insert or ignore into solved(student_id,problem_id,course_id,points,solved) select ?,p.id,cp.course_id,p.points,1 from problems p join course_problems cp on cp.problem_id=p.id where p.id=?",(u['id'],pid)); c.commit(); c.close()
        c=db(); c.execute('create table if not exists submissions(id integer primary key,student_id,problem_id,status,passed_tests,total_tests,runtime_ms,code,created_at)'); c.execute('insert into submissions(student_id,problem_id,status,passed_tests,total_tests,runtime_ms,code,created_at) values(?,?,?,?,?,?,?,datetime(\"now\"))',(u['id'],pid,verdict,passed,len(results),sum(x['runtime_ms'] for x in results),payload.get('source_code',''))); c.commit(); c.close()
    return {'verdict':verdict,'passed':passed,'total':len(results),'runtime_ms':sum(x['runtime_ms'] for x in results),'cases':results if action=='run' else [{'verdict':x['verdict'],'runtime_ms':x['runtime_ms']} for x in results]}
@app.get('/student/heatmap')
def heatmap(u=Depends(guard('student'))):
 c=db(); rows=c.execute("select date(first_at) date,count(*) count from (select problem_id,min(created_at) first_at from submissions where student_id=? and status='ACCEPTED' group by problem_id) group by date(first_at) order by date(first_at) desc limit 365",(u['id'],)).fetchall(); c.close(); return [dict(x) for x in rows]
@app.get('/student/dashboard')
def dashboard(u=Depends(guard('student'))):
 c=db(); rows=c.execute("select c.id,c.code,c.name,count(cp.problem_id) total,count(distinct case when s.status='ACCEPTED' then cp.problem_id end) solved,sum(case when p.difficulty='easy' and s.status='ACCEPTED' then 1 else 0 end) easy,sum(case when p.difficulty='medium' and s.status='ACCEPTED' then 1 else 0 end) medium,sum(case when p.difficulty='hard' and s.status='ACCEPTED' then 1 else 0 end) hard from courses c join enrollments e on e.course_id=c.id left join course_problems cp on cp.course_id=c.id left join problems p on p.id=cp.problem_id left join submissions s on s.student_id=e.student_id and s.problem_id=p.id where e.student_id=? group by c.id",(u['id'],)).fetchall(); c.close(); return {'courses':[dict(x) for x in rows]}
@app.get('/courses/{cid}/leaderboard')
def leaderboard(cid:int,u=Depends(current)):
 c=db(); rows=c.execute("select u.id,u.name,u.reg_no,count(distinct case when s.status='ACCEPTED' then cp.problem_id end) solved,coalesce(sum(distinct case when s.status='ACCEPTED' then p.points end),0) points,rank() over(order by count(distinct case when s.status='ACCEPTED' then cp.problem_id end) desc,coalesce(sum(distinct case when s.status='ACCEPTED' then p.points end),0) desc) rank from users u join enrollments e on e.student_id=u.id left join course_problems cp on cp.course_id=e.course_id left join problems p on p.id=cp.problem_id left join submissions s on s.student_id=u.id and s.problem_id=p.id and s.status='ACCEPTED' where e.course_id=? group by u.id order by rank,u.reg_no",(cid,)).fetchall(); c.close(); data=[dict(x) for x in rows]; me=next((x for x in data if x['id']==u['id']),None); return {'rows':[{'rank':int(x['rank']),'name':x['name'],'reg_no':x['reg_no'],'solved':x['solved'],'points':x['points'],'current':x['id']==u['id']} for x in data],'your_rank':int(me['rank']) if me else None,'total':len(data)}
def template(cols):
 w=Workbook(); w.active.append(cols); b=io.BytesIO(); w.save(b); b.seek(0); return StreamingResponse(b,media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',headers={'Content-Disposition':'attachment; filename=template.xlsx'})
@app.get('/admin/templates/{kind}')
def templates(kind:str,u=Depends(guard('admin'))): return template(['reg_no','name','year','dept','section','email','phone','courses','faculty_ids'] if kind=='students' else ['faculty_id','name','email','mobile','course','dept','year','section'])
@app.get('/admin/dashboard')
def admin_dashboard(u=Depends(guard('admin'))):
 c=db(); r=c.execute("select reg_no,name,year,dept,section from users where role='student'").fetchall(); c.close(); return {'students':[dict(x) for x in r],'total':len(r)}
@app.get('/faculty/courses')
def faculty_courses(u=Depends(guard('faculty'))):
 c=db(); r=c.execute('select c.* from courses c join faculty_courses f on f.course_id=c.id where f.faculty_id=?',(u['id'],)).fetchall(); c.close(); return [dict(x) for x in r]

@app.get('/')
def root():
    return {'message':'AlgoArcher API is running','docs':'/docs','frontend':'http://localhost:5173'}


def _rows(upload):
    wb=load_workbook(io.BytesIO(upload),read_only=True,data_only=True); ws=wb.active; rows=list(ws.iter_rows(values_only=True)); headers=[str(x).strip() if x is not None else '' for x in rows[0]]; return [dict(zip(headers,row)) for row in rows[1:]]

def _required(row, fields):
    return next((f for f in fields if row.get(f) in (None,'')), None)

@app.post('/admin/upload/students')
async def upload_students(file:UploadFile=File(...),u=Depends(guard('admin'))):
    rows=_rows(await file.read()); created=updated=0; failed=[]; c=db()
    for i,row in enumerate(rows,2):
        miss=_required(row,['reg_no','name','year','dept','section','email','courses','faculty_ids'])
        if miss: failed.append({'row':i,'reason':f'missing field: {miss}'}); continue
        if '@' not in str(row['email']): failed.append({'row':i,'reason':'invalid email'}); continue
        try:
            old=c.execute('select id from users where reg_no=?',(str(row['reg_no']),)).fetchone();
            if old:
                sid=old['id']; updated+=1; c.execute('update users set name=?,email=?,year=?,dept=?,section=? where id=?',(row['name'],row['email'],row['year'],row['dept'],row['section'],sid))
            else:
                cur=c.execute("insert into users(name,email,password,role,reg_no,year,dept,section,must_change_pw) values(?,?,?,?,?,?,?,?,1)",(row['name'],row['email'],str(row['reg_no']), 'student',str(row['reg_no']),row['year'],row['dept'],row['section'])); sid=cur.lastrowid; created+=1
            c.execute('delete from enrollments where student_id=?',(sid,))
            for code in str(row['courses']).split(','):
                code=code.strip(); cr=c.execute('select id from courses where code=?',(code,)).fetchone()
                if not cr: c.execute('insert into courses(code,name) values(?,?)',(code,code)); cr=c.execute('select id from courses where code=?',(code,)).fetchone()
                c.execute('insert into enrollments values(?,?)',(sid,cr['id']))
        except Exception as e: failed.append({'row':i,'reason':str(e)})
    c.commit(); c.close(); return {'created':created,'updated':updated,'failed':failed}

@app.post('/admin/upload/faculty')
async def upload_faculty(file:UploadFile=File(...),u=Depends(guard('admin'))):
    rows=_rows(await file.read()); created=updated=0; failed=[]; c=db()
    for i,row in enumerate(rows,2):
        miss=_required(row,['faculty_id','name','email','course','dept','year','section'])
        if miss: failed.append({'row':i,'reason':f'missing field: {miss}'}); continue
        if '@' not in str(row['email']): failed.append({'row':i,'reason':'invalid email'}); continue
        try:
            old=c.execute('select id from users where reg_no=? and role=\'faculty\'',(str(row['faculty_id']),)).fetchone()
            if old: fid=old['id']; updated+=1; c.execute('update users set name=?,email=?,dept=?,year=?,section=? where id=?',(row['name'],row['email'],row['dept'],row['year'],row['section'],fid))
            else:
                cur=c.execute("insert into users(name,email,password,role,reg_no,year,dept,section,must_change_pw) values(?,?,?,?,?,?,?,?,1)",(row['name'],row['email'],str(row['faculty_id']),'faculty',str(row['faculty_id']),row['year'],row['dept'],row['section'])); fid=cur.lastrowid; created+=1
            code=str(row['course']).strip(); cr=c.execute('select id from courses where code=?',(code,)).fetchone()
            if not cr: c.execute('insert into courses(code,name) values(?,?)',(code,code)); cr=c.execute('select id from courses where code=?',(code,)).fetchone()
            if not c.execute('select 1 from faculty_courses where faculty_id=? and course_id=?',(fid,cr['id'])).fetchone(): c.execute('insert into faculty_courses values(?,?)',(fid,cr['id']))
        except Exception as e: failed.append({'row':i,'reason':str(e)})
    c.commit(); c.close(); return {'created':created,'updated':updated,'failed':failed}
@app.get('/faculty/courses/{cid}/dashboard')
def faculty_dashboard(cid:int,u=Depends(guard('faculty'))):
    c=db(); allowed=c.execute('select 1 from faculty_courses where faculty_id=? and course_id=?',(u['id'],cid)).fetchone()
    if not allowed: c.close(); raise HTTPException(403,'Forbidden')
    rows=c.execute("select s.reg_no,s.name,sum(case when p.difficulty='easy' and so.solved=1 then 1 else 0 end) easy,sum(case when p.difficulty='medium' and so.solved=1 then 1 else 0 end) medium,sum(case when p.difficulty='hard' and so.solved=1 then 1 else 0 end) hard from users s join enrollments e on e.student_id=s.id left join (select distinct student_id,problem_id from submissions where status='ACCEPTED') so on so.student_id=s.id left join course_problems cp on cp.problem_id=so.problem_id and cp.course_id=? left join problems p on p.id=so.problem_id where e.course_id=? and (so.problem_id is null or cp.problem_id is not null) and s.dept=(select dept from users where id=?) and s.year=(select year from users where id=?) and s.section=(select section from users where id=?) group by s.id order by s.reg_no",(cid,cid,u['id'],u['id'],u['id'])).fetchall(); c.close(); data=[dict(x) for x in rows]; return {'students':data,'average_solved':(sum((x['easy'] or 0)+(x['medium'] or 0)+(x['hard'] or 0) for x in data)/len(data)) if data else 0}

@app.get('/faculty/courses/{cid}/report')
def faculty_report(cid:int,u=Depends(guard('faculty'))):
    data=faculty_dashboard(cid,u)['students']; w=Workbook(); ws=w.active; ws.append(['Reg No','Student Name','Easy Solved','Medium Solved','Hard Solved','Total Solved'])
    for x in data: ws.append([x['reg_no'],x['name'],x['easy'] or 0,x['medium'] or 0,x['hard'] or 0,(x['easy'] or 0)+(x['medium'] or 0)+(x['hard'] or 0)])
    b=io.BytesIO(); w.save(b); b.seek(0); return StreamingResponse(b,media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',headers={'Content-Disposition':'attachment; filename=course-report.xlsx'})


