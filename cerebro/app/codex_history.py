"""Private durable per-project conversation. No credentials or automatic transmission."""
import json,os,threading,uuid
from pathlib import Path

class ConversationHistory:
    def __init__(self,path=None):
        self.path=Path(path) if path else None
        self.lock=threading.RLock()
        self.data={'version':1,'epochs':{},'turns':[]}
        if self.path and self.path.exists():
            raw=json.loads(self.path.read_text())
            if not isinstance(raw,dict) or raw.get('version')!=1 or not isinstance(raw.get('epochs'),dict) or not isinstance(raw.get('turns'),list):raise ValueError('Historial Codex inválido; no se reemplazó')
            self.data=raw
    def save(self):
        if not self.path:return
        self.path.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
        tmp=self.path.with_name(self.path.name+'.'+uuid.uuid4().hex+'.tmp')
        with tmp.open('x') as f:
            os.chmod(tmp,0o600);json.dump(self.data,f,ensure_ascii=False);f.flush();os.fsync(f.fileno())
        os.replace(tmp,self.path)
    def rows(self,project):
        with self.lock:return [dict(r) for r in self.data['turns'] if r['projectId']==project and r['epoch']==self.data['epochs'].get(project,0)]
    def begin(self,project,identity,text,memory):
        if not isinstance(identity,str) or not identity or len(identity)>120:raise ValueError('Identidad de intento inválida')
        with self.lock:
            if any(r['id']==identity for r in self.data['turns']):raise ValueError('Intento ya registrado; no se reenvía')
            if any(r['projectId']==project and r['state'] in ['pending','uncertain'] for r in self.data['turns']):raise ValueError('Hay un intento incierto; no se reenvía ni se inicia otro')
            self.data['turns'].append({'projectId':project,'epoch':self.data['epochs'].get(project,0),'id':identity,'user':text,'text':'','memorySent':memory,'state':'pending','provider':'Codex / OpenAI'})
            self.save()
    def finish(self,identity,result):
        with self.lock:
            row=next(r for r in self.data['turns'] if r['id']==identity);row.update(result);self.save()
    def reset(self,project):
        with self.lock:
            if any(r['projectId']==project and r['state'] in ['pending','uncertain'] for r in self.data['turns']):raise ValueError('No se puede reiniciar con un intento incierto o pendiente')
            self.data['epochs'][project]=self.data['epochs'].get(project,0)+1;self.save()
            return {'state':'reset','archived':True}
