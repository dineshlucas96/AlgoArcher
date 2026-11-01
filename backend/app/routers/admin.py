import io
from fastapi import APIRouter,Depends,HTTPException,UploadFile,File
from fastapi.responses import StreamingResponse
from openpyxl import Workbook,load_workbook
from app.db import db
from app.security import guard
router=APIRouter()
STUDENT=['reg_no','name','year','dept','section','email','phone','courses','faculty_ids'];FACULTY=['faculty_id','name','email','mobile','course','dept','year','section']
def template(cols):
 w=Workbook();w.active.append(cols);b=io.BytesIO();w.save(b);b.seek(0);return StreamingResponse(b,media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',headers={'Content-Disposition':'attachment; filename=template.xlsx'})
def rows(file,required):
 if not file.filename.lower().endswith('.xlsx'):raise HTTPException(400,'Only .xlsx files are accepted')
 try:raw=list(load_workbook(io.BytesIO(file.file.read()),read_only=True,data_only=True).active.iter_rows(values_only=True))
 except Exception:raise HTTPException(400,'Invalid .xlsx file')
 if not raw:raise HTTPException(400,'The workbook is empty')
 h=[str(x).strip() if x is not None else '' for x in raw[0]];miss=[x for x in required if x not in h]
 if miss:raise HTTPException(400,'Missing required columns: '+', '.join(miss))
 return [dict(zip(h,x)) for x in raw[1:]]
def missing(row,fields):return next((f for f in fields if row.get(f) in (None,'')),None)
@router.get('/admin/templates/{kind}')
def templates(kind:str,u=Depends(guard('admin'))):return template(STUDENT if kind=='students' else FACULTY)
@router.get('/admin/dashboard')
def dashboard(year:str=None,dept:str=None,section:str=None,faculty_id:int=None,page:int=1,u=Depends(guard('admin'))):
 c=db();where=["s.role='student'"];params=[]
 for col,val in [('year',year),('dept',dept),('section',section)]:
  if val:where.append('s.'+col+'=?');params.append(val)
 if faculty_id:where.append('exists (select 1 from enrollments fe join faculty_courses ff on ff.course_id=fe.course_id where fe.student_id=s.id and ff.faculty_id=?)');params.append(faculty_id)
 w=' and '.join(where);off=max(page-1,0)*20
 sql=f"select s.reg_no,s.name,s.year,s.dept,s.section,coalesce(sum(case when p.difficulty='easy' then 1 else 0 end),0) easy,coalesce(sum(case when p.difficulty='medium' then 1 else 0 end),0) medium,coalesce(sum(case when p.difficulty='hard' then 1 else 0 end),0) hard,coalesce(sum(p.points),0) points from users s left join (select distinct student_id,problem_id from submissions where status='ACCEPTED') a on a.student_id=s.id left join problems p on p.id=a.problem_id where {w} group by s.id order by s.reg_no limit 20 offset ?"
 rows_out=c.execute(sql,params+[off]).fetchall();total=c.execute(f'select count(*) from users s where {w}',params).fetchone()[0]
 top=c.execute(f"select s.reg_no,s.name,count(distinct a.problem_id) solved,coalesce(sum(p.points),0) points from users s left join (select distinct student_id,problem_id from submissions where status='ACCEPTED') a on a.student_id=s.id left join problems p on p.id=a.problem_id where {w} group by s.id order by solved desc,points desc,s.reg_no limit 10",params).fetchall();c.close();return {'students':[dict(x) for x in rows_out],'top10':[dict(x) for x in top],'page':page,'page_size':20,'total':total,'pages':(total+19)//20}
@router.post('/admin/upload/students')
async def upload_students(file:UploadFile=File(...),u=Depends(guard('admin'))):
 data=rows(file,STUDENT);created=updated=0;failed=[];c=db()
 for i,row in enumerate(data,2):
  miss=missing(row,['reg_no','name','year','dept','section','email','courses'])
  if miss:failed.append({'row':i,'reason':'missing field: '+miss});continue
  if '@' not in str(row['email']):failed.append({'row':i,'reason':'invalid email'});continue
  try:
   old=c.execute("select id from users where reg_no=? and role='student'",(str(row['reg_no']),)).fetchone()
   if old:sid=old['id'];updated+=1;c.execute('update users set name=?,email=?,year=?,dept=?,section=? where id=?',(row['name'],row['email'],row['year'],row['dept'],row['section'],sid))
   else:sid=c.execute("insert into users(name,email,password,role,reg_no,year,dept,section,must_change_pw) values(?,?,?,?,?,?,?,?,1)",(row['name'],row['email'],str(row['reg_no']),'student',str(row['reg_no']),row['year'],row['dept'],row['section'])).lastrowid;created+=1
   c.execute('delete from enrollments where student_id=?',(sid,))
   for code in str(row['courses']).split(','):
    cr=c.execute('select id from courses where code=?',(code.strip(),)).fetchone()
    if not cr:c.execute('insert into courses(code,name) values(?,?)',(code.strip(),code.strip()));cr=c.execute('select id from courses where code=?',(code.strip(),)).fetchone()
    c.execute('insert into enrollments values(?,?)',(sid,cr['id']))
  except Exception as e:failed.append({'row':i,'reason':str(e)})
 c.commit();c.close();return {'created':created,'updated':updated,'failed':failed}
@router.post('/admin/upload/faculty')
async def upload_faculty(file:UploadFile=File(...),u=Depends(guard('admin'))):
 data=rows(file,FACULTY);created=updated=0;failed=[];c=db()
 for i,row in enumerate(data,2):
  miss=missing(row,['faculty_id','name','email','course','dept','year','section'])
  if miss:failed.append({'row':i,'reason':'missing field: '+miss});continue
  if '@' not in str(row['email']):failed.append({'row':i,'reason':'invalid email'});continue
  try:
   old=c.execute("select id from users where reg_no=? and role='faculty'",(str(row['faculty_id']),)).fetchone()
   if old:fid=old['id'];updated+=1;c.execute('update users set name=?,email=?,dept=?,year=?,section=? where id=?',(row['name'],row['email'],row['dept'],row['year'],row['section'],fid))
   else:fid=c.execute("insert into users(name,email,password,role,reg_no,year,dept,section,must_change_pw) values(?,?,?,?,?,?,?,?,1)",(row['name'],row['email'],str(row['faculty_id']),'faculty',str(row['faculty_id']),row['year'],row['dept'],row['section'])).lastrowid;created+=1
   cr=c.execute('select id from courses where code=?',(str(row['course']).strip(),)).fetchone()
   if not cr:c.execute('insert into courses(code,name) values(?,?)',(str(row['course']).strip(),str(row['course']).strip()));cr=c.execute('select id from courses where code=?',(str(row['course']).strip(),)).fetchone()
   if not c.execute('select 1 from faculty_courses where faculty_id=? and course_id=?',(fid,cr['id'])).fetchone():c.execute('insert into faculty_courses values(?,?)',(fid,cr['id']))
  except Exception as e:failed.append({'row':i,'reason':str(e)})
 c.commit();c.close();return {'created':created,'updated':updated,'failed':failed}

