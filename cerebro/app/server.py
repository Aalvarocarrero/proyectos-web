#!/usr/bin/env python3
"""Cerebro portable: local event journal, no external services or dependencies."""
import argparse, copy, datetime as dt, hashlib, json, os, re, secrets, threading, unicodedata, uuid
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

STATUSES = ['pendiente','en curso','bloqueado','preparado','probado','publicado','completado','sin verificar']
KINDS = ['project','instruction','decision','task','checkpoint','blocker','source']
ROOT = Path(__file__).parent
MAX_BYTES = 8 * 1024 * 1024

def now(): return dt.datetime.now(dt.timezone.utc).isoformat()
def timestamp(value): return dt.datetime.fromisoformat(value[:-1]+'+00:00' if isinstance(value,str) and value.endswith('Z') else value)
def require(ok, message):
    if not ok: raise ValueError(message)
def text(value, limit=100000): return isinstance(value,str) and len(value)<=limit
def search_normalize(value):
    folded=unicodedata.normalize('NFKD',value).casefold()
    return ''.join(c for c in folded if not unicodedata.combining(c))

def validate_event(e, entities):
    require(isinstance(e,dict) and set(e)=={'id','at','op','entity','evidence'}, 'Evento: campos incorrectos')
    require(text(e['id'],100) and bool(e['id']), 'ID inválido')
    try:
        at=timestamp(e['at']); require(at.utcoffset() is not None, 'Fecha sin zona horaria')
    except (TypeError, ValueError): raise ValueError('Fecha ISO 8601 con zona requerida')
    require(isinstance(e['evidence'],list) and len(e['evidence'])<=100 and all(text(x,4000) for x in e['evidence']), 'Evidencias inválidas')
    r=e['entity']
    fields={'id','kind','projectId','title','body','status','priority','nextAction'}
    require(isinstance(r,dict) and set(r)==fields, 'Entidad: campos incorrectos')
    require(all(text(r[k]) for k in fields), 'Los campos deben ser texto')
    require(bool(r['id']) and len(r['id'])<=100 and r['kind'] in KINDS and bool(r['title'].strip()), 'Entidad inválida')
    require(r['status'] in STATUSES and r['priority'] in ['muy alta','alta','media','baja','sin asignar'], 'Estado o prioridad inválidos')
    if r['kind']=='project': require(r['projectId']=='', 'Un proyecto no tiene padre')
    elif not(r['kind'] in ['instruction','source'] and r['projectId']==''): require(r['projectId'] in entities and entities[r['projectId']]['kind']=='project', 'Proyecto inexistente')
    if e['op']=='create': require(r['id'] not in entities, 'Entidad duplicada')
    elif e['op']=='update':
        old=entities.get(r['id']); require(old is not None, 'Entidad inexistente')
        require(old['kind'] not in ['instruction','decision','checkpoint','source'], 'Registro inmutable: añada un registro nuevo')
        require((old['kind'],old['projectId'])==(r['kind'],r['projectId']), 'No puede cambiar tipo ni proyecto')
        require(old!=r, 'No hay cambios para registrar')
    else: raise ValueError('Operación inválida')
    entities[r['id']]=dict(r)

def validate_config(c):
    require(isinstance(c,dict) and set(c)=={'timezone','source','schedule','executionNote'}, 'Configuración inválida')
    require(all(text(c[k],4000) for k in ['timezone','source','executionNote']), 'Configuración textual inválida')
    from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
    try: ZoneInfo(c['timezone'])
    except (ValueError,ZoneInfoNotFoundError): raise ValueError('Zona IANA inválida')
    require(isinstance(c['schedule'],list) and len(c['schedule'])<=100, 'Horario inválido')
    for s in c['schedule']:
        require(isinstance(s,dict) and set(s)=={'startDate','time','label','windowHours','flexible'}, 'Franja inválida')
        try: dt.date.fromisoformat(s['startDate']); dt.time.fromisoformat(s['time'])
        except (ValueError,TypeError): raise ValueError('Fecha/hora de franja inválida')
        require(text(s['label'],4000) and (s['windowHours'] is None or (type(s['windowHours']) is int and 1<=s['windowHours']<=24)) and type(s['flexible']) is bool, 'Franja inválida')

def validate_document(d):
    root_fields={'schemaVersion','config','events','transcripts','actions'}
    require(isinstance(d,dict) and root_fields<=set(d)<=root_fields|{'messages'}, 'Documento: campos incorrectos')
    require(type(d['schemaVersion']) is int and d['schemaVersion']==1, 'Versión no compatible')
    validate_config(d['config']); require(isinstance(d['events'],list), 'events debe ser una lista')
    require(isinstance(d['transcripts'],list), 'transcripts debe ser lista')
    tids=set()
    for order,t in enumerate(d['transcripts'],1):
        require(isinstance(t,dict) and set(t)=={'id','at','original','source','speaker','order','persistence'}, 'Fragmento inválido')
        require(all(text(t[k]) for k in ['id','at','original','source','speaker','persistence']), 'Fragmento: campos textuales requeridos')
        require(bool(t['id']) and len(t['id'])<=100 and t['id'] not in tids, 'ID de fragmento duplicado o inválido')
        try: require(timestamp(t['at']).utcoffset() is not None, 'Fecha sin zona')
        except (ValueError,TypeError): raise ValueError('Fecha de fragmento inválida')
        require(type(t['order']) is int and t['order']==order and t['persistence']=='persistido', 'Orden o persistencia inválidos')
        tids.add(t['id'])
    require(isinstance(d['actions'],list),'actions debe ser lista')
    action_states={}; action_ids=set(); keys={}
    for a in d['actions']:
        require(isinstance(a,dict) and set(a)=={'id','at','actionId','type','state','outcome','intent','checkpoint','dependsOn','idempotencyKey','title','projectId','evidence'}, 'Entrada de cola inválida')
        require(all(text(a[k]) for k in ['id','at','actionId','type','state','outcome','intent','checkpoint','idempotencyKey','title','projectId','evidence']), 'Los campos de cola deben ser texto')
        require(isinstance(a['dependsOn'],list) and all(text(x,100) and x for x in a['dependsOn']) and len(a['dependsOn'])==len(set(a['dependsOn'])), 'Dependencias inválidas')
        require(a['id'] and a['id'] not in action_ids and a['actionId'] and a['title'].strip() and a['intent'].strip() and a['idempotencyKey'], 'IDs, intención o título de cola inválidos')
        try: require(timestamp(a['at']).utcoffset() is not None,'Zona requerida')
        except (ValueError,TypeError): raise ValueError('Fecha de cola inválida')
        require(a['type'] in ['task','code','external_send'] and a['state'] in ['pending','in_progress','blocked','uncertain','completed'] and a['outcome'] in ['not_started','unknown','succeeded','failed'], 'Estado de cola inválido')
        require(keys.get(a['idempotencyKey'],a['actionId'])==a['actionId'],'Clave de idempotencia ya usada')
        previous=action_states.get(a['actionId'])
        if previous:
            require(all(a[k]==previous[k] for k in ['type','idempotencyKey','title','projectId','intent','dependsOn']), 'Intención, dependencias e identidad de acción son inmutables')
            require(previous['state']!='completed','Acción completada inmutable')
            require(not(previous['outcome']=='unknown' and a['state']=='in_progress'),'Resultado incierto: verificar antes de reintentar')
            if previous['outcome']=='unknown' and a['outcome']!='unknown': require(bool(a['evidence'].strip()),'Resolución de incertidumbre requiere evidencia')
        else: require(a['state']=='pending' and a['outcome']=='not_started','Una acción nueva comienza pendiente')
        require(a['state']!='completed' or (a['outcome']=='succeeded' and bool(a['evidence'].strip())), 'Completar requiere resultado y evidencia')
        require(a['state']!='in_progress' or a['outcome']=='unknown','En ejecución implica resultado aún incierto')
        require(a['outcome']!='unknown' or a['state'] in ['in_progress','blocked','uncertain'],'Resultado incierto requiere revisión')
        require(a['state']!='uncertain' or a['outcome']=='unknown','Estado incierto requiere outcome unknown')
        action_ids.add(a['id']); keys[a['idempotencyKey']]=a['actionId']; action_states[a['actionId']]=a
    entities={}; ids=set()
    for e in d['events']:
        validate_event(e,entities); require(e['id'] not in ids,'ID de evento duplicado'); ids.add(e['id'])
        for evidence in e['evidence']:
            if evidence.startswith('transcript:'): require(evidence[11:] in tids,'Referencia a fragmento inexistente')
    for a in d['actions']:
        require(a['projectId'] in entities and entities[a['projectId']]['kind']=='project','Proyecto de cola inexistente')
        require(all((dep in action_states and dep!=a['actionId']) or dep=='legacy:review-dependencies' for dep in a['dependsOn']), 'Dependencia inexistente o cíclica')
    messages=d.get('messages',[]); require(isinstance(messages,list),'messages debe ser lista')
    message_ids=set()
    for m in messages:
        require(isinstance(m,dict) and set(m)=={'id','at','projectId','role','text','channel','persistence'},'Mensaje local inválido')
        require(all(text(m[k]) for k in ['id','at','projectId','role','text','channel','persistence']),'Campos de mensaje inválidos')
        require(m['id'] and len(m['id'])<=100 and m['id'] not in message_ids and m['text'].strip() and len(m['text'])<=12000,'ID o texto de mensaje inválido')
        require(m['role']=='user' and m['channel']=='text' and m['persistence']=='persistido','Tipo de mensaje no compatible')
        try: require(timestamp(m['at']).utcoffset() is not None,'Zona requerida')
        except (TypeError,ValueError): raise ValueError('Fecha de mensaje inválida')
        require(m['projectId'] in entities and entities[m['projectId']]['kind']=='project','El mensaje debe pertenecer a un proyecto')
        message_ids.add(m['id'])
    return entities

def upgrade_legacy_actions(d):
    """Preserve v1 queue entries created before intent/dependency tracking existed."""
    for a in d.get('actions',[]):
        if 'intent' not in a: a['intent']='Intención histórica no registrada; revisar antes de iniciar.'
        if 'dependsOn' not in a: a['dependsOn']=['legacy:review-dependencies']

def resumable_action(actions):
    """Pick the oldest pending item whose declared dependencies are complete."""
    latest={}
    for entry in actions: latest[entry['actionId']]=entry
    for entry in latest.values():
        if entry['state']=='pending' and all(latest.get(dep,{}).get('state')=='completed' for dep in entry['dependsOn']): return entry
    return None

class Store:
    def __init__(self,path):
        self.path=Path(path); self.path.mkdir(parents=True,exist_ok=True,mode=0o700)
        self.log=self.path/'journal.jsonl'; self.lock=threading.RLock(); self.write_uncertain=False
        self.doc={'schemaVersion':1,'config':{'timezone':'Etc/UTC','source':'','schedule':[], 'executionNote':'Esta aplicación registra trabajo. No ejecuta agentes. El motor actual requiere activaciones verificadas de dot.'},'events':[],'transcripts':[],'actions':[],'messages':[]}
        if self.log.exists():
            raw=self.log.read_bytes()
            if raw and not raw.endswith(b'\n'):
                # Only an uncommitted trailing transaction is recoverable automatically.
                (self.path/('interrupted-'+uuid.uuid4().hex+'.bin')).write_bytes(raw)
                boundary=raw.rfind(b'\n')+1
                with self.log.open('r+b') as f: f.truncate(boundary); f.flush(); os.fsync(f.fileno())
                raw=raw[:boundary]
            for line in raw.decode().splitlines():
                t=json.loads(line)
                if 'config' in t: self.doc['config']=t['config']
                self.doc['events'].extend(t['events'])
                self.doc['transcripts'].extend(t.get('transcripts',[]))
                self.doc['actions'].extend(t.get('actions',[]))
                self.doc['messages'].extend(t.get('messages',[]))
        upgrade_legacy_actions(self.doc)
        validate_document(self.doc)
    def revision(self): return hashlib.sha256(json.dumps(self.doc,sort_keys=True).encode()).hexdigest()
    def snapshot(self):
        with self.lock: return {'document':json.loads(json.dumps(self.doc)), 'revision':self.revision(), 'entities':list(validate_document(self.doc).values()), 'storageWarning':'Escritura anterior incierta. Reinicie y revise el diario antes de reintentar.' if self.write_uncertain else ''}
    def project_catalog(self):
        """Return only project selectors; detailed memory is read by exact project ID."""
        with self.lock:
            projects=[entity for entity in validate_document(self.doc).values() if entity['kind']=='project']
            projects.sort(key=lambda project:(project['title'].casefold(),project['id']))
            return [{'id':p['id'],'title':p['title'],'status':p['status'],'priority':p['priority'],'nextAction':p['nextAction']} for p in projects]
    def project_memory(self,project_id,query='',kind='all',limit=100):
        """Search the append-only memory tied to exactly one project, without AI or remote access."""
        with self.lock:
            require(text(project_id,100) and bool(project_id),'ID de proyecto inválido')
            require(text(query,300),'La búsqueda admite hasta 300 caracteres')
            allowed={'all',*KINDS,'action','message','transcript'}
            require(kind in allowed,'Tipo de memoria no admitido')
            require(type(limit) is int and 1<=limit<=200,'El límite debe estar entre 1 y 200')
            entities=validate_document(self.doc); project=entities.get(project_id)
            if not project or project['kind']!='project': raise KeyError('Proyecto inexistente')
            rows=[]; transcript_ids=set()
            related_events=[event for event in self.doc['events'] if event['entity']['id']==project_id or event['entity']['projectId']==project_id or (project_id=='cerebro-contexto-general' and not event['entity']['projectId'] and event['entity']['kind']=='instruction')]
            for event in related_events:
                entity=event['entity']
                rows.append({'id':event['id'],'recordId':entity['id'],'type':entity['kind'],'source':'historial append-only','at':event['at'],'title':entity['title'],'content':entity['body'],'status':entity['status'],'priority':entity['priority'],'nextAction':entity['nextAction'],'operation':event['op'],'evidence':list(event['evidence'])})
                for evidence in event['evidence']:
                    if evidence.startswith('transcript:'): transcript_ids.add(evidence[11:])
            for entry in self.doc['actions']:
                if entry['projectId']==project_id:
                    content='\n'.join(value for value in [entry['intent'],entry['checkpoint']] if value)
                    rows.append({'id':entry['id'],'recordId':entry['actionId'],'type':'action','source':'cola local','at':entry['at'],'title':entry['title'],'content':content,'status':entry['state'],'outcome':entry['outcome'],'priority':'sin asignar','nextAction':entry['checkpoint'],'evidence':[entry['evidence']] if entry['evidence'] else []})
            for message in self.doc.get('messages',[]):
                if message['projectId']==project_id:
                    rows.append({'id':message['id'],'recordId':message['id'],'type':'message','source':'conversación local de texto','at':message['at'],'title':'Mensaje de texto','content':message['text'],'status':message['persistence'],'priority':'sin asignar','nextAction':'','evidence':[]})
            for transcript in self.doc['transcripts']:
                if transcript['id'] in transcript_ids:
                    rows.append({'id':transcript['id'],'recordId':transcript['id'],'type':'transcript','source':transcript['source'],'at':transcript['at'],'title':'Transcripción original · '+transcript['speaker'],'content':transcript['original'],'status':transcript['persistence'],'priority':'sin asignar','nextAction':'','evidence':[]})
            query_norm=search_normalize(query.strip())
            filtered=[]
            for row in rows:
                if kind!='all' and row['type']!=kind: continue
                haystack=search_normalize(' '.join([row['title'],row['content'],row['status'],row.get('outcome',''),row['priority'],row['nextAction'],' '.join(row['evidence'])]))
                if not query_norm or query_norm in haystack: filtered.append(row)
            filtered.sort(key=lambda row:timestamp(row['at']),reverse=True)
            return {'projectId':project_id,'query':query,'type':kind,'total':len(filtered),'limit':limit,'hasMore':len(filtered)>limit,'records':filtered[:limit]}
    def append_project_message(self,project_id,message_id,message_text):
        """Append one explicit user message under the exact project scope; IDs are idempotent."""
        require(text(project_id,100) and bool(project_id),'ID de proyecto inválido')
        require(text(message_id,100) and bool(message_id),'ID de mensaje inválido')
        require(text(message_text,12000) and bool(message_text.strip()),'El mensaje está vacío o supera el límite')
        with self.lock:
            body={'revision':self.revision(),'action':'message','message':{'id':message_id,'projectId':project_id,'text':message_text}}
            return self.mutate(body)
    def commit(self,events,config=None,transcripts=None,actions=None,messages=None):
        candidate={'schemaVersion':1,'config':config if config is not None else self.doc['config'],'events':self.doc['events']+events,'transcripts':self.doc['transcripts']+(transcripts or []),'actions':self.doc['actions']+(actions or []),'messages':self.doc.get('messages',[])+(messages or [])}
        validate_document(candidate)
        transaction={'events':events,'transcripts':transcripts or [],'actions':actions or [],'messages':messages or []}
        if config is not None: transaction['config']=config
        payload=json.dumps(transaction,ensure_ascii=False)+'\n'
        require(len(json.dumps(candidate,ensure_ascii=False,indent=2).encode())<=MAX_BYTES-1024,'Capacidad exportable de 8 MiB alcanzada: archive antes de añadir registros')
        if self.write_uncertain: raise OSError('Escritura anterior incierta: reinicie y verifique antes de reintentar')
        try:
            with self.log.open('a',encoding='utf-8') as f:
                os.chmod(self.log,0o600); f.write(payload); f.flush(); os.fsync(f.fileno())
            directory_fd=os.open(self.path,os.O_RDONLY)
            try: os.fsync(directory_fd)
            finally: os.close(directory_fd)
        except OSError:
            self.write_uncertain=True
            raise
        self.doc=candidate
    def backup(self):
        folder=self.path/'backups'; folder.mkdir(exist_ok=True,mode=0o700)
        target=folder/(dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%S')+'-'+uuid.uuid4().hex[:8]+'.json')
        with target.open('x') as f:
            os.chmod(target,0o600); json.dump(self.doc,f,ensure_ascii=False,indent=2); f.flush(); os.fsync(f.fileno())
        directory_fd=os.open(folder,os.O_RDONLY)
        try: os.fsync(directory_fd)
        finally: os.close(directory_fd)
        return target.name
    def mutate(self,body):
        with self.lock:
            require(isinstance(body,dict),'Solicitud debe ser objeto JSON')
            if self.write_uncertain: raise OSError('Escritura anterior incierta: reinicie y verifique antes de reintentar')
            action=body.get('action')
            if action=='message':
                msg=body.get('message')
                require(isinstance(msg,dict) and set(msg)=={'id','projectId','text'},'Campos de mensaje incorrectos')
                prior=next((m for m in self.doc.get('messages',[]) if m['id']==msg['id']),None)
                if prior:
                    require(all(prior[k]==msg[k] for k in ['id','projectId','text']),'Colisión de ID de mensaje')
                    return {'message':prior,'duplicate':True}
            if action=='queue':
                require(isinstance(body.get('entry'),dict),'Entrada debe ser objeto'); proposed=dict(body['entry'])
                prior=next((x for x in reversed(self.doc['actions']) if x['actionId']==proposed.get('actionId')),None)
                if prior and proposed=={k:v for k,v in prior.items() if k not in ['id','at']}:
                    return {'entry':prior,'duplicate':True}
            require(body.get('revision')==self.revision(),'Conflicto de versión: recargue antes de reintentar')
            if action=='backup': return {'backup':self.backup()}
            if action=='queue':
                a=dict(body['entry'])
                a['id']=str(uuid.uuid4()); a['at']=now()
                self.commit([],actions=[a]); return {'entry':a}
            if action=='transcript':
                t=body['fragment']
                require(isinstance(t,dict) and set(t)=={'id','at','original','source','speaker'}, 'Campos de fragmento incorrectos')
                prior=next((x for x in self.doc['transcripts'] if x['id']==t['id']),None)
                if prior:
                    require(all(prior[k]==v for k,v in t.items()), 'Colisión de ID de fragmento')
                    return {'fragment':prior,'duplicate':True}
                saved={**t,'order':len(self.doc['transcripts'])+1,'persistence':'persistido'}
                self.commit([],transcripts=[saved]); return {'fragment':saved,'duplicate':False}
            if action=='message':
                msg=body['message']
                saved={'id':msg['id'],'at':now(),'projectId':msg['projectId'],'role':'user','text':msg['text'],'channel':'text','persistence':'persistido'}
                self.commit([],messages=[saved]); return {'message':saved,'duplicate':False}
            if action=='import':
                incoming=copy.deepcopy(body['document']); incoming.setdefault('messages',[]); upgrade_legacy_actions(incoming); validate_document(incoming)
                known={e['id']:e for e in self.doc['events']}; additions=[]
                for e in incoming['events']:
                    if e['id'] in known: require(e==known[e['id']], 'Colisión: evento existente modificado')
                    else: additions.append(e)
                transcript_known={t['id']:t for t in self.doc['transcripts']}; transcript_additions=[]
                for t in incoming['transcripts']:
                    if t['id'] in transcript_known: require(t==transcript_known[t['id']], 'Colisión de fragmento importado')
                    else:
                        require(t['order']==len(self.doc['transcripts'])+len(transcript_additions)+1, 'Orden divergente: reconciliación manual necesaria')
                        transcript_additions.append(t)
                config=incoming['config']
                if self.doc['events'] or self.doc['config']['source'] or self.doc['config']['schedule']:
                    require(config==self.doc['config'],'Configuraciones distintas: no se sobrescriben automáticamente')
                actions_known={a['id']:a for a in self.doc['actions']}; action_additions=[]
                for a in incoming['actions']:
                    if a['id'] in actions_known: require(a==actions_known[a['id']], 'Colisión de acción')
                    else: action_additions.append(a)
                messages_known={m['id']:m for m in self.doc.get('messages',[])}; message_additions=[]
                for m in incoming.get('messages',[]):
                    if m['id'] in messages_known: require(m==messages_known[m['id']],'Colisión de mensaje importado')
                    else: message_additions.append(m)
                # New updates may extend only a complete known per-entity history.
                for key,items,new_items in [('events',incoming['events'],additions),('actions',incoming['actions'],action_additions)]:
                    identity=(lambda x:x['entity']['id']) if key=='events' else (lambda x:x['actionId'])
                    for entity_id in {identity(x) for x in new_items}:
                        local=[x['id'] for x in self.doc[key] if identity(x)==entity_id]
                        remote=[x['id'] for x in items if identity(x)==entity_id]
                        require(remote[:len(local)]==local,'Historial divergente: conflicto sin sobrescritura')
                candidate={'schemaVersion':1,'config':config,'events':self.doc['events']+additions,'transcripts':self.doc['transcripts']+transcript_additions,'actions':self.doc['actions']+action_additions,'messages':self.doc.get('messages',[])+message_additions}; validate_document(candidate)
                if additions or transcript_additions or action_additions or message_additions or config!=self.doc['config']:
                    self.backup(); self.commit(additions,config,transcript_additions,action_additions,message_additions)
                return {'imported':len(additions),'transcriptsImported':len(transcript_additions),'actionsImported':len(action_additions),'messagesImported':len(message_additions)}
            require(action in ['create','update'], 'Acción desconocida')
            event={'id':str(uuid.uuid4()),'at':now(),'op':action,'entity':body['entity'],'evidence':body.get('evidence',[])}
            self.commit([event]); return {'eventId':event['id']}

def markdown(doc):
    lines=['# Cerebro — exportación legible','', '```json', json.dumps(doc['config'],ensure_ascii=False,indent=2),'```','', '## Historial íntegro']
    for e in doc['events']:
        lines += ['',f"### {e['at']} · {e['op']} · {e['entity']['title']}", '', e['entity']['body'],'', '```json',json.dumps(e,ensure_ascii=False,indent=2),'```']
    lines += ['', '## Transcripciones originales']
    for t in doc['transcripts']: lines += ['',f"### {t['order']} · {t['at']} · {t['speaker']} · {t['source']}",t['original']]
    lines += ['', '## Ledger de acciones', '```json',json.dumps(doc['actions'],ensure_ascii=False,indent=2),'```']
    lines += ['', '## Mensajes de texto guardados por proyecto']
    for m in doc.get('messages',[]): lines += ['',f"### {m['at']} · proyecto {m['projectId']} · mensaje del usuario",m['text']]
    # Canonical payload enables exact Markdown round trip, regardless of text formatting.
    import base64
    lines += ['', '<!-- CEREBRO_JSON_BASE64:'+base64.b64encode(json.dumps(doc,ensure_ascii=False).encode()).decode()+' -->']
    return '\n'.join(lines)

def handler(store,token,local_chat=None,codex_adapter=None):
    from codex_preview import CodexPreview
    codex_preview=CodexPreview(store,codex_adapter)
    class Handler(BaseHTTPRequestHandler):
        def log_message(self,*args): pass
        def send(self,status,data,ctype='application/json; charset=utf-8'):
            raw=data if isinstance(data,bytes) else (data.encode() if isinstance(data,str) else json.dumps(data,ensure_ascii=False).encode())
            self.send_response(status); self.send_header('Content-Type',ctype); self.send_header('Content-Length',str(len(raw))); self.send_header('Cache-Control','no-store'); self.send_header('X-Content-Type-Options','nosniff'); self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'none'"); self.end_headers(); self.wfile.write(raw)
        def permitted(self):
            hosts=[f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}']
            origin=self.headers.get('Origin')
            return self.headers.get('Host') in hosts and (origin is None or origin in ['http://'+h for h in hosts]) and self.headers.get('Sec-Fetch-Site') not in ['cross-site']
        def do_GET(self):
            if not self.permitted(): return self.send(403,{'error':'Host no permitido'})
            from urllib.parse import parse_qs,unquote,urlsplit
            parsed=urlsplit(self.path); path=parsed.path
            chat_route=re.fullmatch(r'/api/local-chat/([^/]+)',path)
            if chat_route:
                if local_chat is None:return self.send(503,{'error':'Modelo local no habilitado en este servidor'})
                try:return self.send(200,local_chat.view(unquote(chat_route.group(1))))
                except ValueError as e:return self.send(400,{'error':str(e)})
            if path.startswith('/api/codex/result/'):
                return self.send(200,codex_preview.result(unquote(path[len('/api/codex/result/'):])) )
            if path=='/api/codex/status': return self.send(200,codex_preview.status())
            if path=='/api/session':
                return self.send(200,{'token':token})
            if path=='/api/projects':
                projects=store.project_catalog()
                return self.send(200,{'count':len(projects),'projects':projects})
            if path=='/api/state':
                from sync_local import status
                with store.lock: return self.send(200,{**store.snapshot(),'token':token,'sync':status(store)})
            if path=='/api/capabilities':
                from capabilities import catalog
                return self.send(200,catalog())
            memory_route=re.fullmatch(r'/api/projects/([^/]+)/memory',path)
            if memory_route:
                try:
                    params=parse_qs(parsed.query,keep_blank_values=True)
                    require(set(params)<={'q','type','limit'} and all(len(values)==1 for values in params.values()),'Parámetros de búsqueda no admitidos')
                    kind=params.get('type',['all'])[0]
                    limit=int(params.get('limit',['100'])[0])
                    result=store.project_memory(unquote(memory_route.group(1)),params.get('q',[''])[0],kind,limit)
                    return self.send(200,result)
                except KeyError:return self.send(404,{'error':'Proyecto inexistente'})
                except (ValueError,TypeError) as e:return self.send(400,{'error':str(e)})
            if path=='/api/export.json': return self.send(200,store.snapshot()['document'])
            if path=='/api/export.md': return self.send(200,markdown(store.snapshot()['document']),'text/markdown; charset=utf-8')
            if path=='/jarvis' or path.startswith('/jarvis/'):
                import mimetypes
                dist=(ROOT.parent/'jarvis-ui-preview'/'dist').resolve()
                relative=unquote(path[len('/jarvis/'):]) if path.startswith('/jarvis/') else ''
                candidate=(dist/(relative or 'index.html')).resolve()
                if candidate!=dist/'index.html' and dist not in candidate.parents:return self.send(404,{'error':'No encontrado'})
                if not candidate.is_file():return self.send(404,{'error':'Interfaz Jarvis no construida. Ejecute npm install y npm run build en jarvis-ui-preview.'})
                return self.send(200,candidate.read_bytes(),(mimetypes.guess_type(candidate.name)[0] or 'application/octet-stream')+'; charset=utf-8')
            files={'/':('index.html','text/html'),'/app.js':('app.js','application/javascript'),'/style.css':('style.css','text/css')}
            if path not in files:return self.send(404,{'error':'No encontrado'})
            filename,ctype=files[path]; return self.send(200,(ROOT/filename).read_bytes(),ctype+'; charset=utf-8')
        def do_POST(self):
            if not self.permitted() or self.headers.get('X-Cerebro-Token')!=token:return self.send(403,{'error':'Origen o token no permitido'})
            from urllib.parse import urlsplit,unquote
            if self.path in ['/api/codex/preview','/api/codex/send','/api/codex/cancel','/api/codex/reset']:
                try:
                    require(self.headers.get('Content-Type','').split(';')[0].strip()=='application/json','JSON requerido')
                    require(not self.headers.get('Transfer-Encoding'),'Transfer-Encoding no soportado')
                    size=int(self.headers.get('Content-Length','0'));require(0<size<=32768,'Carga inválida')
                    body=json.loads(self.rfile.read(size))
                    if self.path.endswith('/preview'): result=codex_preview.preview(body)
                    elif self.path.endswith('/send'): result=codex_preview.send(body)
                    else:
                        require(isinstance(body,dict) and set(body)=={'projectId'},'Campos incorrectos')
                        result=(codex_preview.reset if self.path.endswith('/reset') else codex_preview.cancel)(body['projectId'])
                    return self.send(200,result)
                except (ValueError,TypeError,KeyError) as e:return self.send(400,{'error':str(e),'code':getattr(e,'code','invalid_preview')})
            voice_route=re.fullmatch(r'/api/local-chat/([^/]+)/transcribe',urlsplit(self.path).path)
            if voice_route:
                if local_chat is None:return self.send(503,{'error':'Asistente local no habilitado'})
                try:
                    from local_transcription import MAX_AUDIO_BYTES
                    consent=self.headers.get('X-Cerebro-Audio-Consent')
                    require(consent in ['one-shot','session'],'Se requiere captura autorizada')
                    sid=self.headers.get('X-Cerebro-Voice-Session') if consent=='session' else None
                    if consent=='session':local_chat.require_session(unquote(voice_route.group(1)),sid)
                    require(self.headers.get('Content-Type','').split(';')[0].strip().lower()=='audio/wav','Se requiere WAV')
                    require(not self.headers.get('Transfer-Encoding'),'Transfer-Encoding no soportado')
                    size=int(self.headers.get('Content-Length','0'));require(44<=size<=MAX_AUDIO_BYTES,'Audio demasiado grande o vacío')
                    return self.send(200,local_chat.transcribe(unquote(voice_route.group(1)),self.rfile.read(size),sid))
                except (ValueError,TypeError,KeyError) as e:return self.send(400,{'error':str(e)})
            if self.path in ['/api/local-chat/permission','/api/local-chat/voice-permission','/api/local-chat/send','/api/local-chat/speak','/api/local-chat/session-start','/api/local-chat/session-stop','/api/local-chat/cancel']:
                if local_chat is None:return self.send(503,{'error':'Modelo local no habilitado en este servidor'})
                try:
                    require(self.headers.get('Content-Type','').split(';')[0].strip().lower()=='application/json','JSON requerido')
                    require(not self.headers.get('Transfer-Encoding'),'Transfer-Encoding no soportado')
                    size=int(self.headers.get('Content-Length','0'));require(0<size<=32768,'Carga inválida')
                    body=json.loads(self.rfile.read(size))
                    if self.path.endswith('/speak'):
                        require(isinstance(body,dict) and set(body) in ({'projectId','text'},{'projectId','text','voice'}),'Campos incorrectos')
                        local_chat.project(body['projectId']);require(local_chat.speech is not None,'Voz local no configurada')
                        return self.send(200,local_chat.speech.synthesize(body['text'],voice=body.get('voice')),'audio/wav')
                    elif self.path.endswith('/session-start'):
                        require(isinstance(body,dict) and set(body)=={'projectId'},'Campos incorrectos');result=local_chat.start_session(body['projectId'])
                    elif self.path.endswith('/session-stop'):
                        require(isinstance(body,dict) and set(body)=={'projectId','sessionId'},'Campos incorrectos');result=local_chat.stop_session(body['projectId'],body['sessionId'])
                    elif self.path.endswith('/cancel'):
                        require(isinstance(body,dict) and set(body)=={'projectId','id'},'Campos incorrectos');result=local_chat.cancel_turn(body['projectId'],body['id'])
                    elif self.path.endswith('/permission') or self.path.endswith('/voice-permission'):
                        require(isinstance(body,dict) and set(body)=={'projectId','enabled'},'Campos incorrectos')
                        result=(local_chat.voice_permission if self.path.endswith('/voice-permission') else local_chat.permission)(body['projectId'],body['enabled'])
                    else:
                        require(isinstance(body,dict) and {'projectId','id','text'}<=set(body) and set(body)<={'projectId','id','text','useMemory','source','transcriptConfirmed','sessionId'},'Campos incorrectos')
                        result=local_chat.send(body['projectId'],body['id'],body['text'],body.get('useMemory',False),body.get('source','typed_text'),body.get('transcriptConfirmed',False),body.get('sessionId'))
                    return self.send(200,result)
                except (ValueError,TypeError,KeyError) as e:return self.send(400,{'error':str(e)})
                except OSError:return self.send(500,{'error':'Escritura incierta. Revise el diario antes de reintentar.'})
            if self.path=='/api/messages':
                try:
                    require(self.headers.get('Content-Type','').split(';')[0].strip().lower()=='application/json','Content-Type application/json requerido')
                    require(not self.headers.get('Transfer-Encoding'),'Transfer-Encoding no soportado')
                    size=int(self.headers.get('Content-Length','0')); require(0<size<=128*1024,'Carga vacía o superior a 128 KiB')
                    body=json.loads(self.rfile.read(size))
                    require(isinstance(body,dict) and set(body)=={'id','projectId','text'},'Solo se admite ID, proyecto y texto del mensaje')
                    result=store.append_project_message(body['projectId'],body['id'],body['text'])
                    return self.send(200,result)
                except (ValueError,KeyError,TypeError) as e:return self.send(400,{'error':str(e)})
                except OSError:return self.send(500,{'error':'No se pudo escribir en disco. Revise el diario antes de volver a intentar.'})
            if self.path=='/api/providers/simulate':
                from providers import ProviderError, simulate_provider
                try:
                    require(self.headers.get('Content-Type','').split(';')[0].strip().lower()=='application/json','Content-Type application/json requerido')
                    require(not self.headers.get('Transfer-Encoding'),'Transfer-Encoding no soportado')
                    size=int(self.headers.get('Content-Length','0')); require(0<size<=1024,'Carga vacía o superior a 1 KiB')
                    body=json.loads(self.rfile.read(size))
                    require(isinstance(body,dict) and set(body)=={'provider'} and text(body['provider'],20),'Solo se admite el identificador del proveedor')
                    return self.send(200,simulate_provider(body['provider']))
                except ProviderError as e:return self.send(400,{'error':str(e)})
                except (ValueError,KeyError,TypeError) as e:return self.send(400,{'error':str(e)})
            if self.path!='/api/action':return self.send(404,{'error':'No encontrado'})
            try:
                require(self.headers.get('Content-Type','').split(';')[0].strip().lower()=='application/json','Content-Type application/json requerido')
                require(not self.headers.get('Transfer-Encoding'),'Transfer-Encoding no soportado')
                size=int(self.headers.get('Content-Length','0')); require(0<size<=MAX_BYTES,'Carga vacía o superior a 8 MiB')
                body=json.loads(self.rfile.read(size)); result=store.mutate(body); self.send(200,result)
            except (ValueError,KeyError,TypeError) as e: self.send(400,{'error':str(e)})
            except OSError: self.send(500,{'error':'No se pudo escribir en disco. Revise espacio y permisos; no se confirmó la operación.'})
    return Handler

def main():
    p=argparse.ArgumentParser(); p.add_argument('--data-dir',default=str(Path.home()/'.cerebro-portable')); p.add_argument('--port',type=int,default=8765); p.add_argument('--local-model',action='store_true'); p.add_argument('--whisper-cli'); p.add_argument('--whisper-model'); p.add_argument('--tts-voice'); p.add_argument('--codex-bin'); p.add_argument('--codex-profile'); p.add_argument('--codex-fixture'); args=p.parse_args()
    data_path=Path(args.data_dir); data_path.mkdir(parents=True,exist_ok=True,mode=0o700)
    # A process lock prevents two independent writers sharing this data directory.
    import fcntl
    lock=(data_path/'server.lock').open('a')
    try: fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
    except BlockingIOError: raise SystemExit('Otro servidor ya usa este directorio de datos.')
    store=Store(args.data_dir)
    local_chat=None
    if args.local_model:
        from ollama_runtime import LocalChat
        transcriber=None
        if args.whisper_cli and args.whisper_model:
            from local_transcription import LocalTranscriber
            transcriber=LocalTranscriber(args.whisper_cli,args.whisper_model)
        speech=None
        if args.tts_voice:
            from local_speech import MacSpeech
            speech=MacSpeech(args.tts_voice)
        local_chat=LocalChat(store,transcriber=transcriber,speech=speech)
    codex_adapter=None
    if args.codex_bin and args.codex_profile and args.codex_fixture:
        from codex_runtime import create_adapter
        codex_adapter=create_adapter(store,args.codex_bin,args.codex_profile,args.codex_fixture)
    server=ThreadingHTTPServer(('127.0.0.1',args.port),handler(store,secrets.token_urlsafe(32),local_chat,codex_adapter))
    print(f'Cerebro disponible en http://127.0.0.1:{server.server_port} · datos: {store.path}',flush=True)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()
if __name__=='__main__': main()
