from fastapi import APIRouter,Depends,HTTPException
from pydantic import BaseModel,EmailStr
from app.db import db
from app.security import make_token,current,hash_password,verify_password
router=APIRouter()
class Login(BaseModel): email:EmailStr; password:str
class PasswordChange(BaseModel): current_password:str; new_password:str
@router.post('/auth/login')
def login(x:Login):
 c=db();u=c.execute('select * from users where email=?',(x.email,)).fetchone();c.close()
 if not u or not verify_password(x.password,u['password']):raise HTTPException(401,'Invalid email or password')
 return {'access_token':make_token(u),'user':dict(id=u['id'],name=u['name'],role=u['role'],must_change_pw=bool(u['must_change_pw']))}
@router.post('/auth/change-password')
def change_password(x:PasswordChange,u=Depends(current)):
 c=db();row=c.execute('select password from users where id=?',(u['id'],)).fetchone()
 if not row or not verify_password(x.current_password,row['password']):c.close();raise HTTPException(400,'Current password is incorrect')
 if not x.new_password:c.close();raise HTTPException(400,'New password is required')
 c.execute('update users set password=?,must_change_pw=0 where id=?',(hash_password(x.new_password),u['id']));c.commit();c.close()
 return {'message':'Password changed'}
