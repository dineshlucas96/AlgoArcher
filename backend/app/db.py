import os,sqlite3
DB=os.getenv('DB_PATH','algorcher.db')
def db():
 c=sqlite3.connect(DB); c.row_factory=sqlite3.Row
 cols={x['name'] for x in c.execute('pragma table_info(users)').fetchall()}
 if 'phone' not in cols:c.execute('alter table users add column phone text')
 c.execute('create table if not exists student_faculties(student_id integer,faculty_id integer,unique(student_id,faculty_id))')
 c.commit();return c
