import base64,hashlib,hmac,json,os,time
from fastapi import Depends,HTTPException
from fastapi.security import HTTPBearer
SECRET=os.getenv('JWT_SECRET','dev-secret'); bearer=HTTPBearer()
def make_token(u):
 p=base64.urlsafe_b64encode(json.dumps({'id':u['id'],'role':u['role'],'exp':time.time()+86400}).encode()).decode(); return p+'.'+hmac.new(SECRET.encode(),p.encode(),hashlib.sha256).hexdigest()
def current(c=Depends(bearer)):
 try:
  p,s=c.credentials.split('.'); x=json.loads(base64.urlsafe_b64decode(p)); assert hmac.compare_digest(s,hmac.new(SECRET.encode(),p.encode(),hashlib.sha256).hexdigest()) and x['exp']>time.time(); return x
 except: raise HTTPException(401,'Invalid token')
def guard(*roles):
 def dep(u=Depends(current)):
  if u['role'] not in roles: raise HTTPException(403,'Forbidden')
  return u
 return dep
