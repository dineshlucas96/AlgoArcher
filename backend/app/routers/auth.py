from fastapi import APIRouter,HTTPException
from pydantic import BaseModel,EmailStr
from app.db import db
from app.security import make_token
router=APIRouter()
class Login(BaseModel): email:EmailStr; password:str
@router.post('/auth/login')
def login(x:Login):
 c=db();u=c.execute('select * from users where email=? and password=?',(x.email,x.password)).fetchone();c.close()
 if not u: raise HTTPException(401,'Invalid email or password')
 return {'access_token':make_token(u),'user':dict(id=u['id'],name=u['name'],role=u['role'],must_change_pw=bool(u['must_change_pw']))}
