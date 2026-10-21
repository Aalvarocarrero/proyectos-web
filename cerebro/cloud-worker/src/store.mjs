const iso = () => new Date().toISOString();

export class StoreError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

async function digest(value) {
  const bytes = new TextEncoder().encode(canonical(value));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

const json = value => JSON.stringify(value);
const boundedText = (v, max = 12000) => typeof v === 'string' && v.length > 0 && v.length <= max;
const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) && /(?:Z|[+-]\d\d:\d\d)$/.test(value);
const encodeCursor = value => {
  const binary = [...new TextEncoder().encode(JSON.stringify(value))].map(byte => String.fromCharCode(byte)).join('');
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};
const decodeCursor = value => {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4);
  const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
};

function assertProject(project) {
  const keys = ['id', 'kind', 'projectId', 'title', 'body', 'status', 'priority', 'nextAction'];
  if (!project || typeof project !== 'object' || Array.isArray(project) || Object.keys(project).sort().join('|') !== [...keys].sort().join('|') ||
      !boundedText(project.id, 100) || project.kind !== 'project' || project.projectId !== '' || !boundedText(project.title, 100000) ||
      typeof project.body !== 'string' || typeof project.nextAction !== 'string' ||
      !['pendiente', 'en curso', 'bloqueado', 'preparado', 'probado', 'publicado', 'completado', 'sin verificar'].includes(project.status) ||
      !['muy alta', 'alta', 'media', 'baja', 'sin asignar'].includes(project.priority)) {
    throw new StoreError(400, 'Proyecto inválido según el contrato local.');
  }
}

function assertEvent(projectId, event) {
  const fields = ['id', 'at', 'op', 'entity', 'evidence'];
  if (!event || typeof event !== 'object' || Array.isArray(event) || Object.keys(event).sort().join('|') !== [...fields].sort().join('|') ||
      !boundedText(event.id, 100) || !validDate(event.at) || !['create', 'update'].includes(event.op) ||
      !Array.isArray(event.evidence) || event.evidence.length > 100 || !event.evidence.every(item => typeof item === 'string' && item.length <= 4000)) {
    throw new StoreError(400, 'Evento inválido según el contrato local.');
  }
  const entity = event.entity;
  const entityFields = ['id', 'kind', 'projectId', 'title', 'body', 'status', 'priority', 'nextAction'];
  if (!entity || typeof entity !== 'object' || Array.isArray(entity) || Object.keys(entity).sort().join('|') !== [...entityFields].sort().join('|') ||
      !boundedText(entity.id, 100) || !['project', 'instruction', 'decision', 'task', 'checkpoint', 'blocker', 'source'].includes(entity.kind) ||
      (entity.id === projectId ? entity.kind !== 'project' || entity.projectId !== '' : entity.projectId !== projectId || entity.kind === 'project') ||
      !boundedText(entity.title, 100000) || typeof entity.body !== 'string' ||
      typeof entity.nextAction !== 'string' || !['pendiente', 'en curso', 'bloqueado', 'preparado', 'probado', 'publicado', 'completado', 'sin verificar'].includes(entity.status) ||
      !['muy alta', 'alta', 'media', 'baja', 'sin asignar'].includes(entity.priority)) {
    throw new StoreError(400, 'El evento debe pertenecer al ID de proyecto solicitado.');
  }
}

export class D1Store {
  constructor(db) { this.db = db; }

  async listProjects(ownerId) {
    const result = await this.db.prepare(
      'SELECT project_json FROM projects WHERE owner_id = ? ORDER BY project_id'
    ).bind(ownerId).all();
    return (result.results || []).map(row => JSON.parse(row.project_json));
  }

  async getProject(ownerId, projectId) {
    const row = await this.db.prepare(
      'SELECT project_json FROM projects WHERE owner_id = ? AND project_id = ?'
    ).bind(ownerId, projectId).first();
    return row ? JSON.parse(row.project_json) : null;
  }

  async getMemory(ownerId, projectId, { limit = 100, cursor = '' } = {}) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) throw new StoreError(400, 'Límite de página fuera de rango.');
    if (!await this.getProject(ownerId, projectId)) throw new StoreError(404, 'Proyecto inexistente.');
    let rows;
    if (cursor) {
      let decoded;
      try { decoded = decodeCursor(cursor); } catch { throw new StoreError(400, 'Cursor inválido.'); }
      if (!validDate(decoded.at) || !boundedText(decoded.id, 100)) throw new StoreError(400, 'Cursor inválido.');
      rows = await this.db.prepare(
        'SELECT record_id, at, record_json FROM memory_records WHERE owner_id = ? AND project_id = ? AND (at < ? OR (at = ? AND record_id < ?)) ORDER BY at DESC, record_id DESC LIMIT ?'
      ).bind(ownerId, projectId, decoded.at, decoded.at, decoded.id, limit + 1).all();
    } else {
      rows = await this.db.prepare(
        'SELECT record_id, at, record_json FROM memory_records WHERE owner_id = ? AND project_id = ? ORDER BY at DESC, record_id DESC LIMIT ?'
      ).bind(ownerId, projectId, limit + 1).all();
    }
    const records = rows.results || [];
    const hasMore = records.length > limit;
    const page = records.slice(0, limit);
    const last = page.at(-1);
    return {
      projectId, limit, hasMore,
      nextCursor: hasMore && last ? encodeCursor({ at: last.at, id: last.record_id }) : null,
      records: page.map(row => JSON.parse(row.record_json)),
    };
  }

  async getReceipt(ownerId, operationId) {
    const row = await this.db.prepare(
      'SELECT result_json FROM operations WHERE owner_id = ? AND operation_id = ?'
    ).bind(ownerId, operationId).first();
    return row ? JSON.parse(row.result_json) : null;
  }

  async #existingOperation(ownerId, operationId, requestHash) {
    const row = await this.db.prepare(
      'SELECT request_hash, result_json FROM operations WHERE owner_id = ? AND operation_id = ?'
    ).bind(ownerId, operationId).first();
    if (!row) return null;
    if (row.request_hash !== requestHash) throw new StoreError(409, 'Este ID de operación ya se usó con otro contenido.');
    return { ...JSON.parse(row.result_json), duplicate: true };
  }

  async createProject(ownerId, operationId, project) {
    assertProject(project);
    if (!boundedText(operationId, 100)) throw new StoreError(400, 'ID de operación inválido.');
    const request = { operationId, project };
    const requestHash = await digest(request);
    const previous = await this.#existingOperation(ownerId, operationId, requestHash);
    if (previous) return previous;
    const current = await this.getProject(ownerId, project.id);
    if (current && canonical(current) !== canonical(project)) throw new StoreError(409, 'El ID de proyecto ya existe con otros datos.');

    const result = { accepted: true, projectId: project.id, recordId: project.id, duplicate: Boolean(current) };
    const at = iso();
    await this.db.batch([
      this.db.prepare('INSERT OR IGNORE INTO projects (owner_id, project_id, project_json, created_at) VALUES (?, ?, ?, ?)')
        .bind(ownerId, project.id, json(project), at),
      this.db.prepare(`INSERT OR IGNORE INTO operations (owner_id, operation_id, project_id, request_hash, record_id, result_json, created_at)
        SELECT ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (
          SELECT 1 FROM projects WHERE owner_id = ? AND project_id = ? AND project_json = ?
        )`).bind(ownerId, operationId, project.id, requestHash, project.id, json(result), at, ownerId, project.id, json(project)),
    ]);
    const receipt = await this.getReceipt(ownerId, operationId);
    if (!receipt) throw new StoreError(409, 'Conflicto al crear el proyecto; vuelva a leer el estado.');
    if (receipt.projectId !== project.id || await digest(request) !== requestHash) throw new StoreError(409, 'Colisión de recibo.');
    return receipt;
  }

  async appendMemory(ownerId, projectId, operationId, event) {
    if (!boundedText(projectId, 100) || !boundedText(operationId, 100)) throw new StoreError(400, 'ID de proyecto u operación inválido.');
    assertEvent(projectId, event);
    const request = { operationId, projectId, event };
    const requestHash = await digest(request);
    const previous = await this.#existingOperation(ownerId, operationId, requestHash);
    if (previous) return previous;
    if (!await this.getProject(ownerId, projectId)) throw new StoreError(404, 'Proyecto inexistente.');
    const result = { accepted: true, projectId, recordId: event.id, duplicate: false };
    const at = iso();
    await this.db.batch([
      this.db.prepare('INSERT OR IGNORE INTO memory_records (owner_id, project_id, record_id, record_type, at, record_json) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(ownerId, projectId, event.id, 'event', event.at, json(event)),
      this.db.prepare(`INSERT OR IGNORE INTO operations (owner_id, operation_id, project_id, request_hash, record_id, result_json, created_at)
        SELECT ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (
          SELECT 1 FROM memory_records WHERE owner_id = ? AND project_id = ? AND record_id = ? AND record_json = ?
        )`).bind(ownerId, operationId, projectId, requestHash, event.id, json(result), at, ownerId, projectId, event.id, json(event)),
    ]);
    const receipt = await this.getReceipt(ownerId, operationId);
    if (!receipt) throw new StoreError(409, 'Conflicto de registro; compruebe el estado antes de repetir.');
    return receipt;
  }

  async appendMessage(ownerId, message) {
    const keys = ['id', 'projectId', 'text'];
    if (!message || typeof message !== 'object' || Array.isArray(message) || Object.keys(message).sort().join('|') !== keys.sort().join('|') ||
        !boundedText(message.id, 100) || !boundedText(message.projectId, 100) || !boundedText(message.text, 12000) || !message.text.trim()) {
      throw new StoreError(400, 'Mensaje inválido.');
    }
    if (!await this.getProject(ownerId, message.projectId)) throw new StoreError(404, 'Proyecto inexistente.');
    const record = { id: message.id, at: iso(), projectId: message.projectId, role: 'user', text: message.text, channel: 'text', persistence: 'persistido' };
    const request = { message };
    const requestHash = await digest(request);
    const previous = await this.#existingOperation(ownerId, message.id, requestHash);
    if (previous) return previous;
    const result = { accepted: true, projectId: message.projectId, recordId: message.id, duplicate: false };
    const at = record.at;
    await this.db.batch([
      this.db.prepare('INSERT OR IGNORE INTO memory_records (owner_id, project_id, record_id, record_type, at, record_json) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(ownerId, message.projectId, message.id, 'message', at, json(record)),
      this.db.prepare(`INSERT OR IGNORE INTO operations (owner_id, operation_id, project_id, request_hash, record_id, result_json, created_at)
        SELECT ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (
          SELECT 1 FROM memory_records WHERE owner_id = ? AND project_id = ? AND record_id = ? AND record_type = 'message'
        )`).bind(ownerId, message.id, message.projectId, requestHash, message.id, json(result), at, ownerId, message.projectId, message.id),
    ]);
    const receipt = await this.getReceipt(ownerId, message.id);
    if (!receipt) throw new StoreError(409, 'Colisión de ID de mensaje; consulte el recibo antes de reintentar.');
    return receipt;
  }
}
