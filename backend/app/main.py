from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth,student,faculty,admin,problems
app=FastAPI(title='AlgoArcher API')
app.add_middleware(CORSMiddleware,allow_origin_regex=r'http://(localhost|127\.0\.0\.1)(:\d+)?',allow_credentials=True,allow_methods=['*'],allow_headers=['*'])
for router in (auth.router,student.router,faculty.router,admin.router,problems.router):app.include_router(router)
@app.get('/')
def root():return {'message':'AlgoArcher API is running','docs':'/docs','frontend':'http://localhost:5173'}
