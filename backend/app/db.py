import os,sqlite3
DB=os.getenv('DB_PATH','algorcher.db')
def db():
 c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; return c
