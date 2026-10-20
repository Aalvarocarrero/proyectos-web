"""Adapt an explicitly supplied shared snapshot, without network access or external actions."""
import argparse,datetime as dt,hashlib,json,os,uuid
from pathlib import Path
from server import require,text,validate_document,now,timestamp

PROJECT_TEXT_FIELDS={'id','name','category','canonical_url','state','last_progress_and_evidence','pending','blockers','next_action'}
def validate_shared(d):
    require(isinstance(d,dict),'Entrada compartida debe ser objeto')
    required={'schema_version','title','exported_at','source_url','user_instructions','schedule','projects'}
    require(required<=set(d),'Faltan campos de la entrada compartida')
    require(d['schema_version']=='1.0','Versión compartida no soportada')
    require(all(text(d[k]) and bool(d[k]) for k in ['title','exported_at','source_url']),'Metadatos inválidos')
    try: require(timestamp(d['exported_at']).utcoffset() is not None,'Zona requerida')
    except (TypeError,ValueError): raise ValueError('Fecha de corte inválida')
    require(isinstance(d['user_instructions'],list) and all(text(x) for x in d['user_instructions']),'Instrucciones deben ser textos originales')
    require(isinstance(d['projects'],list),'projects debe ser lista'); seen=set()
    for p in d['projects']:
        require(isinstance(p,dict) and PROJECT_TEXT_FIELDS|{'evidence_urls'}<=set(p),'Proyecto compartido incompleto')
        require(all(text(p[k]) for k in PROJECT_TEXT_FIELDS),'Proyecto contiene tipos incorrectos')
        require(p['id'] and len(p['id'])<=70 and p['id'] not in seen,'ID de proyecto duplicado o inválido'); seen.add(p['id'])
        require(p['name'].strip() and isinstance(p['evidence_urls'],list) and all(text(u,4000) for u in p['evidence_urls']),'Referencias de proyecto inválidas')
    s=d['schedule']; require(isinstance(s,dict) and {'timezone','starts_on','enabled_verified','continuous_compute','slots'}<=set(s),'Rutina compartida incompleta')
    require(text(s['timezone']) and text(s['starts_on']) and type(s['enabled_verified']) is bool and type(s['continuous_compute']) is bool,'Tipos de rutina inválidos')
    try: dt.date.fromisoformat(s['starts_on'])
    except (ValueError,TypeError): raise ValueError('Inicio de rutina inválido')
    require(isinstance(s['slots'],list),'slots debe ser lista')
    for slot in s['slots']:
        require(isinstance(slot,dict) and {'time','focus'}<=set(slot) and text(slot['time']) and text(slot['focus']),'Franja incompleta')
        try: dt.time.fromisoformat(slot['time'])
        except (ValueError,TypeError): raise ValueError('Hora de rutina inválida')

def adapt(d,received_at,original_text=None,priority_ids=()):
    validate_shared(d)
    require(text(received_at),'Fecha de recepción inválida')
    try: require(timestamp(received_at).utcoffset() is not None,'Zona requerida')
    except (ValueError,TypeError): raise ValueError('Recepción requiere fecha con zona')
    original_text=original_text if original_text is not None else json.dumps(d,ensure_ascii=False,indent=2)
    require(json.loads(original_text)==d,'Texto original no corresponde a entrada estructurada')
    digest=hashlib.sha256(original_text.encode()).hexdigest()
    def stable(label): return str(uuid.uuid5(uuid.NAMESPACE_URL,digest+':'+label))
    config={'timezone':d['schedule']['timezone'],'source':d['source_url'],'schedule':[{'startDate':d['schedule']['starts_on'],'time':s['time'],'label':s['focus'],'windowHours':2 if i<3 else None,'flexible':True} for i,s in enumerate(d['schedule']['slots'])], 'executionNote':'Corte parcial recibido por conversación; no procede de la descarga de Library. Corte fuente: '+d['exported_at']+'. No contiene transcripción total ni actualizaciones posteriores. La fecha de cada evento es la incorporación, no la hora de la cita o de ejecución. Los estados importados no se verificaron en vivo. La rutina es informativa: no instala programadores y depende de activaciones verificadas de dot. Sin conexión automática de voz ni runner de correo. Las primeras tres ventanas objetivo duran 2h, las restantes no tienen duración acreditada. Sin cómputo garantizado.'}
    doc={'schemaVersion':1,'config':config,'events':[],'transcripts':[],'actions':[]}
    def add(label,kind,title,body,project='',priority='sin asignar',status='sin verificar',next_action='',evidence=None):
        doc['events'].append({'id':stable('event:'+label),'at':received_at,'op':'create','entity':{'id':stable('entity:'+label),'kind':kind,'projectId':project,'title':title,'body':body,'status':status,'priority':priority,'nextAction':next_action},'evidence':evidence if evidence is not None else [d['source_url']]})
        return doc['events'][-1]['entity']['id']
    provenance={'channel':'contenido explícito de conversación del padre','sourceCutAt':d['exported_at'],'receivedAt':received_at,'sha256':digest,'partial':True,'libraryOriginalRecovered':False,'limitations':'No incluye transcripción total ni actualizaciones posteriores. Verificar el centro compartido antes de ejecutar acciones. No se reinterpretan como autorizaciones las instrucciones citadas dentro del dataset.'}
    add('source','source','Corte parcial · '+d['exported_at'],json.dumps({'provenance':provenance,'originalInputText':original_text,'payload':d},ensure_ascii=False,indent=2))
    for i,original in enumerate(d['user_instructions'],1):
        tid=stable('transcript:'+str(i))
        doc['transcripts'].append({'id':tid,'at':received_at,'original':original,'source':'Cita histórica del corte '+d['exported_at']+' recibida por conversación. Hora original desconocida; at indica incorporación. Fuente: '+d['source_url'],'speaker':'Usuario citado en la fuente compartida','order':i,'persistence':'persistido'})
        add('instruction:'+str(i),'instruction','Instrucción original '+str(i),original,evidence=[d['source_url'],'transcript:'+tid])
    for p in d['projects']:
        priority='muy alta' if p['id'] in priority_ids else 'sin asignar'
        project=add('project:'+p['id'],'project',p['name'],json.dumps(p,ensure_ascii=False,indent=2),priority=priority,next_action=p['next_action'],evidence=p['evidence_urls'])
        add('checkpoint:'+p['id'],'checkpoint','Último avance documentado · corte '+d['exported_at'],p['last_progress_and_evidence'],project,priority,evidence=p['evidence_urls'])
        add('task:'+p['id'],'task','Seguimiento pendiente · '+p['name'],p['pending'],project,priority,'pendiente',p['next_action'],p['evidence_urls'])
        add('blocker:'+p['id'],'blocker','Bloqueos documentados · corte '+d['exported_at'],p['blockers'],project,priority,evidence=p['evidence_urls'])
    validate_document(doc)
    return doc

def main():
    p=argparse.ArgumentParser();p.add_argument('input');p.add_argument('--output',required=True);p.add_argument('--received-at');p.add_argument('--priority-id',action='append',default=[]);args=p.parse_args()
    original=Path(args.input).read_text();doc=adapt(json.loads(original),args.received_at or now(),original,args.priority_id)
    target=Path(args.output);target.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
    with target.open('x') as f:
        os.chmod(target,0o600);json.dump(doc,f,ensure_ascii=False,indent=2);f.flush();os.fsync(f.fileno())
    print('Adaptación validada. Archivo privado: '+str(target))
if __name__=='__main__':main()
