"""Explicit offline two-store exchange. No network, scheduler or external effects."""
import argparse,copy,fcntl,json,os,tempfile
from pathlib import Path
from server import Store,now,require

def ids(doc):return [key+':'+x['id'] for key in ['events','transcripts','actions','messages'] for x in doc.get(key,[])]
def status(store):
 p=store.path/'sync.json'; metadata=json.loads(p.read_text()) if p.exists() else {'lastSync':None,'acknowledged':[]}
 return {**metadata,'outbox':[i for i in ids(store.doc) if i not in metadata['acknowledged']]}
def acknowledge(store,peer):
 data={'lastSync':now(),'peer':str(peer),'acknowledged':ids(store.doc)}
 target=store.path/'sync.json'; temp=store.path/'sync.json.tmp'
 with temp.open('w') as f:os.chmod(temp,0o600);json.dump(data,f);f.flush();os.fsync(f.fileno())
 temp.replace(target)
def sync(left,right):
 require(Path(left).resolve()!=Path(right).resolve(),'Seleccione dos almacenes distintos')
 locks=[]
 try:
  for p in sorted([Path(left).resolve(),Path(right).resolve()]):
   p.mkdir(parents=True,exist_ok=True,mode=0o700); f=(p/'server.lock').open('a');locks.append(f)
   try:fcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB)
   except BlockingIOError:raise ValueError('Cierre ambos servidores antes del intercambio local')
  a,b=Store(left),Store(right)
  # Validate both directions entirely before modifying either real store.
  with tempfile.TemporaryDirectory() as tmp:
   x,y=Store(Path(tmp)/'a'),Store(Path(tmp)/'b')
   x.doc=copy.deepcopy(a.doc);y.doc=copy.deepcopy(b.doc)
   x.mutate({'action':'import','revision':x.revision(),'document':y.doc})
   y.mutate({'action':'import','revision':y.revision(),'document':x.doc})
   merged=x.doc
  a.mutate({'action':'import','revision':a.revision(),'document':merged})
  b.mutate({'action':'import','revision':b.revision(),'document':merged})
  acknowledge(a,b.path);acknowledge(b,a.path)
  return {'left':status(a),'right':status(b),'note':'Intercambio local confirmado; ninguna acción externa ejecutada.'}
 finally:
  for f in locks:f.close()
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('left');p.add_argument('right');a=p.parse_args()
 try:print(json.dumps(sync(a.left,a.right),ensure_ascii=False,indent=2))
 except (ValueError,OSError) as e:raise SystemExit('Intercambio no confirmado: '+str(e)+'. Revise ambos almacenes antes de reintentar.')
