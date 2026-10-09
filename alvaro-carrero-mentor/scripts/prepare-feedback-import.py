"""Offline converter for an owner-authorized feedback export. Never reads the live database."""
import json,sys,os
from pathlib import Path
rows=json.loads(Path(sys.argv[1]).read_text())
if isinstance(rows,dict):rows=rows['rows']
columns=['id','created_at','language','useful','improve','support','reply_requested','name','email']
assert isinstance(rows,list)
def literal(v):
 if v is None:return 'NULL'
 if type(v) is int:return str(v)
 if isinstance(v,str):return "'"+v.replace("'","''")+"'"
 raise ValueError('Unsupported value')
statements=[];ids=set()
for row in rows:
 assert set(row)==set(columns),'Unexpected export schema'
 assert row['id'] not in ids,'Duplicate ID in export';ids.add(row['id'])
 assert type(row['created_at']) is int and row['language'] in ('es','en')
 assert row['reply_requested'] in (0,1)
 assert all(isinstance(row[k],str) and len(row[k])<=800 for k in ['useful','improve','support'])
 assert row['reply_requested'] or (row['name'] is None and row['email'] is None)
 statements.append('INSERT INTO feedback ('+', '.join(columns)+') VALUES ('+', '.join(literal(row[k]) for k in columns)+');')
# Exclusive create prevents accidentally replacing a previous export/import packet.
fd=os.open(sys.argv[2],os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'w') as f:f.write('-- Private feedback data. Keep outside source control and public assets.\n'+'\n'.join(statements)+'\n')
print('Prepared',len(rows),'rows; schema must already exist. No live database changed.')
