import asyncio,json,sqlite3,os
from .main import run_one
R={1:'import sys; a=list(map(int,sys.stdin.read().split())); print(sum(a[1:]))',2:"import sys;print(sys.stdin.readline().rstrip('\\n')[::-1])",3:"import sys;print(sum(c.lower() in 'aeiou' for c in sys.stdin.readline().rstrip('\\n')))",4:"import sys;a=list(map(int,sys.stdin.read().split()));n=a[0];v=a[1:n+1];t=a[n+1];print(*next(((i,j) for i in range(n) for j in range(i+1,n) if v[i]+v[j]==t),(-1,-1)))",5:"import sys;s=sys.stdin.readline().strip();st=[];m={')':'(',']':'[','}':'{'}\nfor x in s:\n if x in '([{':st.append(x)\n elif not st or st.pop()!=m[x]:print('false');break\nelse:print(str(not st).lower())",6:"import sys,collections;w=sys.stdin.readline().lower().split();c=collections.Counter(w);print(sorted(c,key=lambda x:(-c[x],x))[0])",7:"import sys;s=sys.stdin.readline().rstrip('\\n');d={};l=a=0\nfor r,x in enumerate(s):l=max(l,d.get(x,-1)+1);d[x]=r;a=max(a,r-l+1)\nprint(a)",8:"import sys;a=list(map(int,sys.stdin.read().split()));v=sorted(zip(a[1::2],a[2::2]));o=[]\nfor x,y in v:\n if o and x<=o[-1][1]:o[-1][1]=max(o[-1][1],y)\n else:o.append([x,y])\nprint('\\n'.join(f'{x} {y}' for x,y in o))"}
async def main():
 c=sqlite3.connect(os.getenv('DB_PATH','algorcher.db'));ok=True;print('problem | correct | wrong | result')
 for pid,title,raw in c.execute('select id,title,tests from problems'):
  good=bad=True
  for t in json.loads(raw):good &= (await run_one(R[pid],t['input'],t['output']))['verdict']=='ACCEPTED';bad &= (await run_one("print('wrong')",t['input'],t['output']))['verdict']=='WRONG_ANSWER'
  ok &= good and bad;print(f'{title} | ACCEPTED | WRONG_ANSWER | {"PASS" if good and bad else "FAIL"}')
 assert ok
if __name__=='__main__':asyncio.run(main())
