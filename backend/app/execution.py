import os,logging,tempfile,subprocess,sys
import httpx
from fastapi import HTTPException
JUDGE0_URL=os.getenv('JUDGE0_URL','http://localhost:2358'); USE_LOCAL_RUNNER=os.getenv('USE_LOCAL_RUNNER','false').lower()=='true'
async def run_one(code,stdin,expected):
 if USE_LOCAL_RUNNER:
  logging.warning('USE_LOCAL_RUNNER active: executing local Python subprocess.')
  path=None
  try:
   fd,path=tempfile.mkstemp(suffix='.py');os.close(fd)
   with open(path,'w',encoding='utf-8') as f:f.write(code)
   try:x=subprocess.run([sys.executable,path],input=stdin,capture_output=True,text=True,timeout=2)
   except subprocess.TimeoutExpired:return {'verdict':'TIME_LIMIT','actual':'','runtime_ms':2000}
   if x.returncode!=0:return {'verdict':'RUNTIME_ERROR','actual':x.stderr[-500:],'runtime_ms':0}
   return {'verdict':'ACCEPTED' if x.stdout.strip()==expected.strip() else 'WRONG_ANSWER','actual':x.stdout,'runtime_ms':0}
  except Exception as e:
   logging.exception('Local runner failed');return {'verdict':'RUNTIME_ERROR','actual':str(e),'runtime_ms':0}
  finally:
   if path:
    try:os.unlink(path)
    except OSError:logging.exception('Failed to delete temp runner file')
 try:
  async with httpx.AsyncClient(timeout=8) as client:
   r=await client.post(f'{JUDGE0_URL}/submissions?base64_encoded=false&wait=true',json={'source_code':code,'language_id':71,'stdin':stdin,'expected_output':expected,'cpu_time_limit':2,'memory_limit':128010});x=r.json();v={3:'ACCEPTED',4:'WRONG_ANSWER',5:'TIME_LIMIT',6:'COMPILE_ERROR',7:'RUNTIME_ERROR',8:'RUNTIME_ERROR',9:'RUNTIME_ERROR',10:'RUNTIME_ERROR',11:'RUNTIME_ERROR',12:'RUNTIME_ERROR'}.get(x.get('status',{}).get('id'),'RUNTIME_ERROR');return {'verdict':v,'actual':x.get('stdout') or x.get('stderr') or x.get('compile_output') or '','runtime_ms':int(float(x.get('time') or 0)*1000)}
 except Exception:
  raise HTTPException(503,'Judge0 is unreachable. Start Judge0 or set USE_LOCAL_RUNNER=true for demo mode.')
