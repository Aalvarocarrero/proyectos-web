"""Explicit dedicated-profile runtime, using the tested macOS CLI sandbox."""
import os
import subprocess
from pathlib import Path
from codex_app_server import AppServerConfig,AppServerError,JsonlProcessTransport,CodexAppServerAdapter,ProjectSessionMap

def create_adapter(store,binary,profile,fixture):
    binary,profile,fixture=(Path(p).resolve() for p in (binary,profile,fixture))
    if not binary.is_file() or not (profile/'config.toml').is_file() or not fixture.is_dir() or any(fixture.iterdir()):
        raise ValueError('Codex requiere ejecutable, perfil dedicado y carpeta de prueba vacía')
    import tomllib
    cfg=tomllib.loads((profile/'config.toml').read_text())
    if (cfg.get('cli_auth_credentials_store')!='file' or cfg.get('mcp_servers') or cfg.get('plugins') or cfg.get('notify') or cfg.get('features',{}).get('shell_tool') is not False or cfg.get('features',{}).get('hooks') is not False):
        raise ValueError('El perfil Codex no cumple el aislamiento requerido')
    expected={':minimal':'read',str(fixture):'read'}
    if cfg.get('permissions',{}).get('jarvis_fixture')!={'filesystem':expected,'network':{'enabled':False}}:
        raise ValueError('Permisos de herramientas distintos del perfil validado')
    runtime=cfg['permissions'].get('jarvis_runtime',{})
    if runtime.get('filesystem')!={':minimal':'read',str(profile):'write',str(fixture):'read',str(binary.parent.parent):'read'}:
        raise ValueError('El runtime amplía acceso fuera del perfil dedicado')
    config=AppServerConfig(enabled=True,turns_enabled=True,executable=str(binary),data_dir=str(profile),project_roots={p['id']:str(fixture) for p in store.project_catalog()},ephemeral_turns=True)
    def factory(config,confirmed):
        if not confirmed:raise AppServerError('confirmation_required','Conexión no autorizada')
        env={k:v for k,v in os.environ.items() if k in {'PATH','HOME','LANG','LC_ALL'}}
        env.update(CODEX_HOME=str(profile),TMPDIR=str(profile/'tmp'))
        proc=subprocess.Popen([str(binary),'sandbox','--include-managed-config','-P','jarvis_runtime','-C',str(fixture),str(binary),'app-server','--listen','stdio://'],env=env,cwd=fixture,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True)
        return JsonlProcessTransport(proc)
    return CodexAppServerAdapter(config,ProjectSessionMap(profile/'jarvis-sessions.json'),factory)
