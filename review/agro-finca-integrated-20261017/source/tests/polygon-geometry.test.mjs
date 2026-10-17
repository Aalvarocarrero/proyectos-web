import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({
  appType: 'custom', configFile: false, root, resolve: { alias: { '@': root } },
  server: { middlewareMode: true, hmr: false, watch: null },
});
const geometry = await vite.ssrLoadModule('/lib/polygon-geometry.ts');
const { farmPayloadSchema, farmRecordPayloadSchema, surveyPlanSchema, legacySurveyPlanSchema } =
  await vite.ssrLoadModule('/lib/sync-validation.ts');
const { deriveAreaSplit } = await vite.ssrLoadModule('/lib/area-split-payload.ts');
const { parseLocalBackup } = await vite.ssrLoadModule('/lib/backup-import.ts');
after(() => vite.close());

function polygon(points = [[5, 5], [95, 5], [95, 95], [5, 95]]) {
  return { version: 1, coordinateSpace: 'normalized-100', vertices: points.map(([x, y], i) => ({ id: `point_${i + 1}`, x, y })) };
}
function survey(points = [[450000, 900000], [450125, 900000], [450125, 900100], [450000, 900100]]) {
  return points.map(([easting, northing], i) => ({ id: `survey_${i + 1}`, easting, northing }));
}
const concavePoints = [[3, 6], [35, 3], [55, 17], [90, 7], [96, 40], [72, 44], [89, 82], [55, 95], [21, 83], [8, 43]];
const validate = geometry.validateNormalizedSketchPolygon;
const area = (data = {}) => ({ farmId: 'test_farm', recordType: 'area', category: 'Cultivo', title: 'Área sintética', data: { areaSqM: 123.75, ...data } });
function assertInvalid(input, expectedCode) {
  const result = validate(input);
  assert.equal(result.ok, false);
  assert.ok(result.error.length > 15);
  if (expectedCode) assert.equal(result.code, expectedCode);
  return result;
}

test('accepts a many-point concave ring in either winding without changing IDs, order or coordinates', () => {
  for (const points of [concavePoints, [...concavePoints].reverse(), [[0, 0], [100, 0], [0, 100]]]) {
    const input = polygon(points), snapshot = structuredClone(input);
    const result = validate(input);
    assert.equal(result.ok, true);
    assert.deepEqual(result.polygon, snapshot);
    assert.deepEqual(input, snapshot);
    assert.notEqual(result.polygon, input);
    assert.notEqual(result.polygon.vertices, input.vertices);
    assert.equal('areaSqM' in result.polygon, false);
    assert.equal('perimeterM' in result.polygon, false);
  }
});

test('only the exact explicit closing vertex is canonicalized; input stays untouched', () => {
  const input = polygon(), open = structuredClone(input);
  input.vertices.push({ ...input.vertices[0] });
  const before = structuredClone(input);
  assert.deepEqual(geometry.canonicalizeNormalizedSketchPolygon(input), open);
  assert.deepEqual(input, before);
  input.vertices.at(-1).id = 'different_final_id';
  assertInvalid(input, 'zero_length_edge');
  const again = structuredClone(before);
  again.vertices.push({ ...again.vertices[0] });
  assertInvalid(again);
});

test('bounds the canonical ring to 3–200 vertices and does not truncate oversized input', () => {
  for (let count = 0; count < 3; count++) assertInvalid(polygon([[0, 0], [50, 50]].slice(0, count)), 'vertex_count');
  const points = Array.from({ length: 200 }, (_, i) => [50 + 40 * Math.cos(i * Math.PI / 100), 50 + 40 * Math.sin(i * Math.PI / 100)]);
  const input = polygon(points);
  assert.equal(validate(input).ok, true);
  input.vertices.push({ ...input.vertices[0] });
  assert.equal(validate(input).polygon.vertices.length, 200);
  input.vertices.push({ id: 'extra', x: 50, y: 50 });
  assertInvalid(input, 'vertex_count');
  const tooMany = polygon(Array.from({ length: 201 }, (_, i) => [50 + 40 * Math.cos(i * 2 * Math.PI / 201), 50 + 40 * Math.sin(i * 2 * Math.PI / 201)]));
  assertInvalid(tooMany, 'vertex_count');
});

test('rejects wrong versions, coordinate spaces, unsupported geometry fields and non-object input', () => {
  for (const input of [null, [], {}, { ...polygon(), version: 2 }, { ...polygon(), coordinateSpace: 'metres' },
    { ...polygon(), coordinateSpace: 'latitude-longitude' }, { ...polygon(), areaSqM: 200 }, { ...polygon(), vertices: null }]) {
    assertInvalid(input, 'invalid_format');
  }
});

test('rejects every incomplete/non-numeric row instead of coercing, filtering or clamping it', () => {
  for (const patch of [{ x: '' }, { y: '42' }, { x: null }, { y: undefined }, { x: NaN }, { y: Infinity },
    { x: -0.001 }, { y: 100.001 }, { id: '' }, { id: '   ' }, { id: 'x'.repeat(65) }, { easting: 123 }]) {
    const input = polygon(); Object.assign(input.vertices[2], patch);
    const snapshot = structuredClone(input);
    assertInvalid(input, 'invalid_vertex');
    assert.deepEqual(input, snapshot);
  }
  const input = polygon(); input.vertices[1] = null;
  assertInvalid(input, 'invalid_vertex');
});

test('rejects duplicate IDs even for different points and rejects duplicate points even with different IDs', () => {
  const repeatedId = polygon(); repeatedId.vertices[2].id = repeatedId.vertices[0].id;
  assertInvalid(repeatedId, 'duplicate_id');
  const repeatedPoint = polygon([[0, 0], [50, 0], [100, 50], [50, 0], [0, 100]]);
  assertInvalid(repeatedPoint, 'duplicate_point');
  const zeroEdge = polygon([[0, 0], [100, 0], [100, 0], [0, 100]]);
  assertInvalid(zeroEdge, 'zero_length_edge');
});

test('rejects crossing, non-adjacent touching, overlapping and zero-area outlines', () => {
  for (const points of [
    [[0, 0], [100, 100], [0, 100], [80, 0]], // Crossing, non-zero signed area.
    [[0, 0], [100, 100], [0, 100], [100, 0]], // Bow tie, zero signed area.
    [[0, 0], [100, 0], [100, 100], [50, 0], [0, 100]], // Vertex touches non-adjacent edge.
    [[0, 0], [100, 0], [100, 100], [20, 100], [20, 0], [80, 0], [80, 80], [0, 80]], // Collinear overlap.
    [[0, 0], [100, 0], [50, 0], [100, 100], [0, 100]], // Adjacent edge doubles back.
    [[0, 0], [50, 0], [100, 0]], // Line only.
  ]) assertInvalid(polygon(points));
});

test('preserves valid straight boundary vertices and does not collapse extremely narrow finite geometry', () => {
  assert.equal(validate(polygon([[0, 0], [50, 0], [100, 0], [100, 100], [0, 100]])).ok, true);
  const tiny = Number.MIN_VALUE;
  assert.equal(validate(polygon([[0, 0], [tiny, 0], [tiny, tiny], [0, tiny]])).ok, true);
  const narrow = 1e-14;
  assert.equal(validate(polygon([[0, 0], [100, 0], [100, narrow], [0, narrow]])).ok, true);
});

test('survey validation uses metric coordinates separately and preserves original IDs/numbers/closure exactly', () => {
  const vertices = survey(); vertices[0].id = ' Original ID ';
  vertices.push({ ...vertices[0] });
  const snapshot = structuredClone(vertices);
  const result = geometry.validateSurveyVertices(vertices);
  assert.equal(result.ok, true); assert.deepEqual(result.vertices, snapshot); assert.deepEqual(vertices, snapshot);
  const parsed = surveyPlanSchema.parse({ version: 1, vertices });
  assert.deepEqual(parsed.vertices, snapshot);
  assert.equal(validate({ version: 1, coordinateSpace: 'normalized-100', vertices }).ok, false);
  assert.equal(geometry.validateSurveyVertices(polygon().vertices).ok, false);
});

test('survey writes accept no coordinates but reject partial, coerced, duplicate and invalid populated rings', () => {
  assert.equal(surveyPlanSchema.safeParse({ version: 1, vertices: [] }).success, true);
  assert.equal(surveyPlanSchema.safeParse({ version: 1 }).success, true);
  for (const vertices of [survey().slice(0, 1), survey().slice(0, 2),
    survey([[0, 0], [100, 100], [0, 100], [100, 0]]),
    survey([[0, 0], [50, 0], [100, 0]])]) {
    assert.equal(surveyPlanSchema.safeParse({ version: 1, vertices }).success, false);
  }
  for (const patch of [{ easting: '' }, { northing: '900050' }, { easting: null }, { northing: undefined },
    { easting: Infinity }, { northing: NaN }, { id: 'survey_1' }]) {
    const vertices = survey(); Object.assign(vertices[2], patch);
    assert.equal(geometry.validateSurveyVertices(vertices).ok, false);
    assert.equal(surveyPlanSchema.safeParse({ version: 1, vertices }).success, false);
  }
  assert.equal(legacySurveyPlanSchema.safeParse({ version: 1, vertices: survey().slice(0, 2) }).success, true);
});

test('farm and area schemas retain declared area, legacy shapes, measurements and other record data', () => {
  const sketch = polygon(concavePoints);
  for (const boundaryShape of ['Rectángulo', 'Óvalo', 'Irregular / polígono']) {
    const input = { name: 'Finca sintética', areaSqM: 9876, boundaryShape, boundaryMeasurements: { northM: 23 },
      surveyPlan: { version: 1, vertices: survey() }, propertySketch: sketch, objective: '' };
    const parsed = farmPayloadSchema.parse(input);
    assert.equal(parsed.areaSqM, input.areaSqM);
    assert.equal(parsed.boundaryShape, boundaryShape);
    assert.deepEqual(parsed.boundaryMeasurements, input.boundaryMeasurements);
    assert.deepEqual(parsed.surveyPlan.vertices, input.surveyPlan.vertices);
    assert.deepEqual(parsed.propertySketch, sketch);
  }
  const data = { typedAreaOutline: sketch, mapShape: 'Óvalo', mapX: 10, mapY: 20, mapWidth: 30, mapHeight: 40,
    notes: 'Do not rewrite', customField: { preserve: true }, areaSqM: 123.75 };
  assert.deepEqual(farmRecordPayloadSchema.parse(area(data)).data, data);
  assert.equal(farmRecordPayloadSchema.safeParse(area({ typedAreaOutline: polygon([[1, 1], [2, 2]]) })).success, false);
});

test('custom area outlines cannot fall through to rectangular division, even when malformed', () => {
  for (const outline of [polygon(concavePoints), null, {}, { version: 9 }, 'invalid']) {
    const payload = area({ typedAreaOutline: outline }), before = structuredClone(payload);
    assert.equal(geometry.hasCustomAreaOutline(payload.data), true);
    assert.throws(() => deriveAreaSplit(payload), /custom_polygon_split_unsupported/);
    assert.deepEqual(payload, before);
  }
  assert.equal(geometry.getAreaOutline({ typedAreaOutline: null }), null);
  assert.deepEqual(geometry.getAreaOutline({ typedAreaOutline: polygon() }), polygon());
  assert.equal(geometry.hasCustomAreaOutline({}), false);
});

test('legacy rectangle/oval layout division remains unchanged and preserves decimal declared areas', () => {
  for (const mapShape of ['Rectángulo', 'Óvalo']) {
    const input = area({ mapShape, mapX: 10, mapY: 12, mapWidth: 30, mapHeight: 12, extra: { keep: true } });
    const snapshot = structuredClone(input), [a, b] = deriveAreaSplit(input);
    assert.equal(a.data.areaSqM + b.data.areaSqM, input.data.areaSqM);
    assert.equal(a.data.mapWidth + b.data.mapWidth, 30);
    assert.equal(a.data.mapX + a.data.mapWidth, b.data.mapX);
    assert.equal(a.data.mapShape, mapShape); assert.deepEqual(b.data.extra, input.data.extra);
    assert.deepEqual(input, snapshot);
  }
});

test('geometry round-trips in offline JSON entities and outbox without changing ownership or revisions', () => {
  const propertySketch = polygon(concavePoints), typedAreaOutline = polygon();
  const farm = { name: 'Finca sintética', location: '', areaSqM: 9000, objective: '', propertySketch,
    surveyPlan: { version: 1, vertices: survey() } };
  const payload = area({ typedAreaOutline, areaSqM: 312.5 });
  const timestamp = '2026-10-07T00:00:00Z';
  const entities = [['farm', 'test_farm', farm], ['farm-record', 'test_area', payload]].map(([entityType, id, value]) => ({
    key: `${entityType}:${id}`, id, entityType, payload: value, updatedAt: timestamp, syncState: 'pending', serverRevision: `revision_${id}`,
  }));
  const outbox = entities.map((entity) => ({ id: `op_${entity.id}`, entityType: entity.entityType, entityId: entity.id,
    action: 'upsert', payload: entity.payload, clientUpdatedAt: timestamp, baseRevision: entity.serverRevision }));
  const backup = { format: 'venezuela-agro-local-backup', version: 1, exportedAt: timestamp, origin: 'https://fixture.invalid',
    owner: 'synthetic_owner', entities, outbox, meta: [] };
  const parsed = parseLocalBackup(JSON.stringify(backup));
  assert.equal(parsed.owner, backup.owner);
  for (const items of [parsed.entities, parsed.outbox]) {
    assert.deepEqual(items[0].payload.propertySketch, propertySketch);
    assert.deepEqual(items[0].payload.surveyPlan.vertices, farm.surveyPlan.vertices);
    assert.equal(items[0].payload.areaSqM, 9000);
    assert.deepEqual(items[1].payload.data.typedAreaOutline, typedAreaOutline);
    assert.equal(items[1].payload.data.areaSqM, 312.5);
  }
  assert.deepEqual(parsed.entities.map((entity) => entity.serverRevision), entities.map((entity) => entity.serverRevision));
  assert.deepEqual(parsed.outbox.map((operation) => operation.baseRevision), outbox.map((operation) => operation.baseRevision));
});

function backupForSurvey(vertices) {
  const timestamp = '2026-10-07T00:00:00Z';
  const payload = { name: 'Finca sintética de respaldo', location: '', areaSqM: 54321, objective: '',
    surveyPlan: { version: 1, vertices } };
  return { format: 'venezuela-agro-local-backup', version: 1, exportedAt: timestamp,
    origin: 'https://fixture.invalid', owner: 'synthetic_owner',
    entities: [{ key: 'farm:survey_backup', id: 'survey_backup', entityType: 'farm', payload,
      updatedAt: timestamp, syncState: 'pending', serverRevision: 'survey_revision' }],
    outbox: [{ id: 'survey_operation', entityType: 'farm', entityId: 'survey_backup', action: 'upsert',
      payload, clientUpdatedAt: timestamp, baseRevision: 'survey_revision' }], meta: [] };
}

test('backup import retains 200 unique survey points and the explicit 201st closing row in entities and outbox', () => {
  const vertices = survey(Array.from({ length: 200 }, (_, i) => [
    450000 + 125 * Math.cos(i * Math.PI / 100), 900000 + 125 * Math.sin(i * Math.PI / 100),
  ]));
  vertices.push({ ...vertices[0] });
  assert.equal(surveyPlanSchema.safeParse({ version: 1, vertices }).success, true);
  assert.equal(legacySurveyPlanSchema.safeParse({ version: 1, vertices }).success, false);
  const backup = backupForSurvey(vertices), snapshot = JSON.stringify(backup);
  const parsed = parseLocalBackup(snapshot);
  for (const rows of [parsed.entities, parsed.outbox]) {
    assert.equal(rows[0].payload.surveyPlan.vertices.length, 201);
    assert.deepEqual(rows[0].payload.surveyPlan.vertices, vertices);
    assert.equal(rows[0].payload.areaSqM, 54321);
  }
  assert.equal(parsed.owner, backup.owner);
  assert.equal(parsed.entities[0].serverRevision, 'survey_revision');
  assert.equal(parsed.outbox[0].baseRevision, 'survey_revision');
  assert.equal(JSON.stringify(backup), snapshot);
});

test('legacy partial survey backups preserve exact IDs, rows and coordinate representations without weakening new writes', () => {
  const legacyRows = [
    { id: ' Legacy A ', easting: '0450000.00', northing: '' },
    { id: 'Legacy B ', easting: 450125.25, northing: '0900100.00' },
  ];
  for (const vertices of [legacyRows.slice(0, 1), legacyRows]) {
    assert.equal(surveyPlanSchema.safeParse({ version: 1, vertices }).success, false);
    assert.equal(legacySurveyPlanSchema.safeParse({ version: 1, vertices }).success, true);
    const backup = backupForSurvey(vertices), snapshot = JSON.stringify(backup);
    const parsed = parseLocalBackup(snapshot);
    for (const rows of [parsed.entities, parsed.outbox]) {
      assert.deepEqual(rows[0].payload.surveyPlan.vertices, vertices);
      assert.equal(JSON.stringify(rows[0].payload.surveyPlan.vertices), JSON.stringify(vertices));
      assert.equal(rows[0].payload.areaSqM, 54321);
      assert.equal(surveyPlanSchema.safeParse(rows[0].payload.surveyPlan).success, false);
    }
    assert.equal(parsed.owner, backup.owner);
    assert.equal(parsed.entities[0].serverRevision, 'survey_revision');
    assert.equal(parsed.outbox[0].baseRevision, 'survey_revision');
    assert.equal(JSON.stringify(backup), snapshot);
  }
});

test('server split rejects a stored custom outline before any SQL mutation or receipt', async () => {
  const { atomicAreaSplit } = await vite.ssrLoadModule('/lib/atomic-area-split.ts');
  let batches = 0;
  const payload = area({ typedAreaOutline: polygon(concavePoints) });
  const source = { id: 'test_area', owner_id: 'synthetic_owner', farm_id: payload.farmId,
    record_type: 'area', category: payload.category, title: payload.title, data_json: JSON.stringify(payload.data),
    revision: 'area_v1', last_operation_id: null, last_operation_hash: null, deleted: 0,
    server_updated_at: '2026-10-07T00:00:00Z', parent_active: 1, parent_revision: 'farm_v1' };
  const before = structuredClone(source);
  const db = {
    prepare(sql) { return { bind() { return { async first() { return sql.includes('sync_receipts') || sql.includes('json_extract') ? null : source; } }; } }; },
    async batch() { batches++; throw new Error('Unexpected SQL write'); },
  };
  await assert.rejects(atomicAreaSplit(db, 'synthetic_owner', {
    sourceId: source.id, baseRevision: source.revision, baseFarmRevision: source.parent_revision,
    operationId: 'split_polygon', newAreaId: 'child_polygon',
  }), (error) => error.status === 400 && error.message === 'invalid_area_payload');
  assert.equal(batches, 0); assert.deepEqual(source, before);
});

test('device-local split keeps custom geometry, ownership, revisions and pending intent unchanged', async () => {
  const { indexedDB, IDBKeyRange } = await import('fake-indexeddb');
  const storage = new Map();
  const replacements = { indexedDB, IDBKeyRange, location: { pathname: '/app-local', origin: 'https://fixture.invalid' },
    navigator: { onLine: false }, window: new EventTarget(),
    sessionStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) } };
  const descriptors = Object.fromEntries(Object.keys(replacements).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(replacements)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  try {
    const db = await vite.ssrLoadModule('/lib/offline-db.ts');
    const payload = area({ typedAreaOutline: polygon(concavePoints) });
    await db.queueMutation({ id: 'polygon_intent', entityType: 'farm-record', entityId: 'local_polygon', action: 'upsert',
      payload, clientUpdatedAt: '2026-10-07T00:00:00Z', baseRevision: 'retained_revision' });
    const source = await db.getCachedEntity('farm-record', 'local_polygon');
    const before = await db.exportLocalBackup();
    await assert.rejects(db.splitDeviceLocalArea(source), /custom_polygon_split_unsupported/);
    const after = await db.exportLocalBackup();
    assert.equal(after.owner, 'device-local');
    assert.deepEqual(after.entities, before.entities); assert.deepEqual(after.outbox, before.outbox);
    assert.deepEqual(after.meta, before.meta);
    assert.deepEqual(after.entities[0].payload.data.typedAreaOutline, payload.data.typedAreaOutline);
    assert.equal(after.entities[0].serverRevision, 'retained_revision');
  } finally {
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
});
