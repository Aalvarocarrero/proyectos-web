import { D1Store, StoreError } from './store.mjs';

const MAX_BODY_BYTES = 256 * 1024;
const response = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});

async function readJson(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new StoreError(415, 'Se requiere application/json.');
  }
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) throw new StoreError(413, 'Solicitud demasiado grande.');
  const reader = request.body?.getReader();
  if (!reader) throw new StoreError(400, 'Cuerpo JSON vacío.');
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new StoreError(413, 'Solicitud demasiado grande.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const raw = new TextDecoder().decode(bytes);
  try { return JSON.parse(raw); } catch { throw new StoreError(400, 'JSON inválido.'); }
}

function sameOrigin(request) {
  const origin = request.headers.get('origin');
  try { if (origin && new URL(origin).origin !== new URL(request.url).origin) return false; }
  catch { return false; }
  return request.headers.get('sec-fetch-site') !== 'cross-site';
}

function route(path) {
  if (path === '/api/projects') return { name: 'projects' };
  if (path === '/api/messages') return { name: 'messages' };
  let match = path.match(/^\/api\/projects\/([^/]+)\/memory$/);
  if (match) return { name: 'memory', id: decodeURIComponent(match[1]) };
  match = path.match(/^\/api\/messages\/([^/]+)$/);
  if (match) return { name: 'receipt', id: decodeURIComponent(match[1]) };
  match = path.match(/^\/api\/operations\/([^/]+)$/);
  if (match) return { name: 'receipt', id: decodeURIComponent(match[1]) };
  return null;
}

export function createWorker({ authenticateOwner } = {}) {
  return {
    async fetch(request, env) {
      try {
        if (!authenticateOwner) return response(503, { error: 'Integración de identidad de Sites pendiente; endpoint cerrado.' });
        if (!sameOrigin(request)) return response(403, { error: 'Origen no permitido.' });
        const ownerId = await authenticateOwner(request, env);
        if (typeof ownerId !== 'string' || ownerId.length < 1 || ownerId.length > 200) {
          return response(401, { error: 'Se requiere una sesión autenticada del propietario.' });
        }
        if (!env?.DB) return response(503, { error: 'Binding D1 DB no configurado.' });
        const url = new URL(request.url);
        const target = route(url.pathname);
        if (!target) return response(404, { error: 'Ruta inexistente.' });
        const store = new D1Store(env.DB);

        if (target.name === 'projects' && request.method === 'GET') {
          return response(200, { projects: await store.listProjects(ownerId) });
        }
        if (target.name === 'projects' && request.method === 'POST') {
          const body = await readJson(request);
          if (!body || Object.keys(body).sort().join('|') !== ['operationId', 'project'].sort().join('|')) throw new StoreError(400, 'Campos requeridos: operationId, project.');
          return response(200, await store.createProject(ownerId, body.operationId, body.project));
        }
        if (target.name === 'memory' && request.method === 'GET') {
          const params = url.searchParams;
          if ([...params.keys()].some(key => !['limit', 'cursor'].includes(key)) || params.getAll('limit').length > 1 || params.getAll('cursor').length > 1) {
            throw new StoreError(400, 'Parámetros de memoria no admitidos.');
          }
          const limit = Number(params.get('limit') || 100);
          return response(200, await store.getMemory(ownerId, target.id, { limit, cursor: params.get('cursor') || '' }));
        }
        if (target.name === 'memory' && request.method === 'POST') {
          const body = await readJson(request);
          if (!body || Object.keys(body).sort().join('|') !== ['operationId', 'event'].sort().join('|')) throw new StoreError(400, 'Campos requeridos: operationId, event.');
          return response(200, await store.appendMemory(ownerId, target.id, body.operationId, body.event));
        }
        if (target.name === 'messages' && request.method === 'POST') {
          return response(200, await store.appendMessage(ownerId, await readJson(request)));
        }
        if (target.name === 'receipt' && request.method === 'GET') {
          const receipt = await store.getReceipt(ownerId, target.id);
          return receipt ? response(200, { ...receipt, verified: true }) : response(404, { error: 'Recibo no encontrado.' });
        }
        return response(405, { error: 'Método no permitido.' });
      } catch (error) {
        if (error instanceof StoreError) return response(error.status, { error: error.message });
        return response(500, { error: 'Error interno; consulte el estado antes de repetir una escritura.' });
      }
    },
  };
}

// Fail closed until the official Sites auth helper is wired by the hosting integration.
export default createWorker();
