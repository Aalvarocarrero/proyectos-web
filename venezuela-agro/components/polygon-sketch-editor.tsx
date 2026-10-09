"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { CornerDownLeft, MousePointer2, Plus, RotateCcw, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateNormalizedSketchPolygon, type NormalizedSketchPolygon, type NormalizedSketchVertex } from "@/lib/polygon-geometry";
import {
  appendSketchVertex, clientToSketchPosition, cloneSketch, commitSketchDraft,
  createSketchDraft, createSketchVertexIdAllocator, insertSketchMidpoint,
  moveSketchVertex, removeSketchVertex, resetSketchDraft, sameSketch,
  sketchKeyboardPosition, trackSketchTap, undoSketchDraft,
  type SketchPosition, type SketchTap,
} from "@/lib/polygon-editor-interaction";

export type PolygonSketchEditorProps = {
  value: NormalizedSketchPolygon | null;
  onChange: (value: NormalizedSketchPolygon | null) => void;
  disabled?: boolean;
  label?: string;
};

type Drag = {
  pointerId: number;
  element: SVGGElement;
  vertex: NormalizedSketchVertex;
  start: SketchPosition;
  before: NormalizedSketchPolygon;
  preview: NormalizedSketchPolygon;
};
type Preview = { before: NormalizedSketchPolygon; value: NormalizedSketchPolygon };

/**
 * Edits a form draft, never saves a record. Incomplete/invalid drafts are emitted
 * deliberately: the owning form must validate before its explicit Save action.
 * Key by record/form session when editing a different record with identical data.
 */
export function PolygonSketchEditor({ value, onChange, disabled = false, label = "Croquis de la forma" }: PolygonSketchEditorProps) {
  const id = useId();
  const gridId = `${id}-grid`;
  const [draft, setDraft] = useState(() => createSketchDraft(value));
  const [receivedValue, setReceivedValue] = useState(value);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [edgeStartId, setEdgeStartId] = useState<string | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [newX, setNewX] = useState("50");
  const [newY, setNewY] = useState("50");
  const [addError, setAddError] = useState("");
  const [notice, setNotice] = useState("");
  const allocateId = useRef<ReturnType<typeof createSketchVertexIdAllocator> | null>(null);
  const drag = useRef<Drag | null>(null);
  const tap = useRef<SketchTap | null>(null);
  const board = useRef<SVGSVGElement | null>(null);

  // A controlled parent echo preserves undo; an external replacement starts a
  // fresh session. Guarded render adjustment avoids a stale painted polygon.
  if (receivedValue !== value) {
    setReceivedValue(value);
    if (!sameSketch(draft.value, value)) setDraft(createSketchDraft(value));
  }

  const shown = !disabled && preview && sameSketch(preview.before, draft.value) ? preview.value : draft.value;
  const vertices = shown?.vertices ?? [];
  const selected = vertices.find((point) => point.id === selectedId) ?? null;
  const edgeIndex = vertices.length >= 3 ? vertices.findIndex((point) => point.id === edgeStartId) : -1;
  // Validate committed edits, not every pointer preview frame of a large ring.
  const validation = useMemo(() => draft.value ? validateNormalizedSketchPolygon(draft.value) : null, [draft.value]);
  const invalidIndices = validation && !validation.ok ? validation.vertexIndices : [];
  const editing = !disabled && preview !== null && sameSketch(preview.before, draft.value);
  const inputClass = "text-base md:text-sm h-11 min-w-0 w-full rounded-lg border border-[#3e2a19]/20 bg-white px-3 text-[#3e2a19] outline-none focus:border-[#4c6b3a] focus:ring-2 focus:ring-[#4c6b3a]/20 disabled:opacity-50";

  function nextId() {
    if (!allocateId.current) allocateId.current = createSketchVertexIdAllocator(draft.initial?.vertices);
    return allocateId.current(draft.value?.vertices);
  }

  function commit(next: NormalizedSketchPolygon | null) {
    if (disabled) return;
    const updated = commitSketchDraft(draft, next);
    setPreview(null);
    if (updated === draft) return;
    setDraft(updated);
    setNotice("");
    onChange(cloneSketch(updated.value));
  }

  function append(position: SketchPosition) {
    if (disabled || (draft.value?.vertices.length ?? 0) >= 200) return;
    const vertexId = nextId();
    const next = appendSketchVertex(draft.value, vertexId, position);
    commit(next);
    setSelectedId(vertexId);
    setEdgeStartId(null);
    setAddError("");
  }

  function addFromFields() {
    const x = Number(newX), y = Number(newY);
    if (!newX.trim() || !newY.trim() || !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) {
      setAddError("Escribe X e Y entre 0 y 100 para agregar el punto.");
      return;
    }
    append({ x, y });
  }

  function insertMidpoint() {
    if (!draft.value || edgeIndex < 0 || disabled) return;
    const vertexId = nextId();
    commit(insertSketchMidpoint(draft.value, vertices[edgeIndex].id, vertexId));
    setSelectedId(vertexId);
    setEdgeStartId(null);
  }

  function deleteSelected() {
    if (!draft.value || !selected || draft.value.vertices.length <= 3 || disabled) return;
    commit(removeSketchVertex(draft.value, selected.id));
    setSelectedId(null);
    setEdgeStartId(null);
  }

  function cancelDrag() {
    const active = drag.current;
    drag.current = null;
    setPreview(null);
    if (active?.element.hasPointerCapture(active.pointerId)) active.element.releasePointerCapture(active.pointerId);
  }

  function beginDrag(event: PointerEvent<SVGGElement>, vertex: NormalizedSketchVertex) {
    event.stopPropagation();
    if (disabled || !event.isPrimary || event.button !== 0 || drag.current || !draft.value || !board.current) return;
    setSelectedId(vertex.id);
    setEdgeStartId(null);
    setNotice("");
    // A touch first selects. Only a previously selected handle opts out of page
    // scrolling, so an ordinary swipe over the sketch keeps scrolling normally.
    if (event.pointerType !== "mouse" && selectedId !== vertex.id) return;
    const start = clientToSketchPosition(board.current, event.clientX, event.clientY);
    if (!start) return;
    const before = cloneSketch(draft.value)!;
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { return; }
    event.preventDefault();
    drag.current = { pointerId: event.pointerId, element: event.currentTarget, vertex: { ...vertex }, start, before, preview: before };
    setPreview({ before, value: before });
  }

  function dragValue(event: PointerEvent<SVGGElement>, active: Drag) {
    const position = board.current && clientToSketchPosition(board.current, event.clientX, event.clientY);
    if (!position) return active.preview;
    return moveSketchVertex(active.before, active.vertex.id, {
      x: active.vertex.x + position.x - active.start.x,
      y: active.vertex.y + position.y - active.start.y,
    });
  }

  function moveDrag(event: PointerEvent<SVGGElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (disabled || !sameSketch(active.before, draft.value)) { cancelDrag(); return; }
    active.preview = dragValue(event, active);
    // Pointer movement is local preview only, with no parent callback or save.
    setPreview({ before: active.before, value: active.preview });
  }

  function finishDrag(event: PointerEvent<SVGGElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (disabled || !sameSketch(active.before, draft.value)) { cancelDrag(); return; }
    const next = dragValue(event, active);
    drag.current = null; // Normal release must not cancel a successful commit.
    setPreview(null);
    if (active.element.hasPointerCapture(event.pointerId)) active.element.releasePointerCapture(event.pointerId);
    commit(next);
  }

  function cancelPointer(event: PointerEvent<SVGGElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    cancelDrag();
    setNotice("Movimiento cancelado; el punto conserva su posición anterior.");
  }

  function moveWithKeyboard(event: KeyboardEvent<SVGGElement>, vertex: NormalizedSketchVertex) {
    if (disabled || !draft.value) return;
    if (event.key === "Escape") { event.preventDefault(); cancelDrag(); return; }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); setSelectedId(vertex.id); setEdgeStartId(null); return;
    }
    const position = sketchKeyboardPosition(vertex, event.key, event.shiftKey);
    if (!position) return;
    event.preventDefault();
    cancelDrag();
    setSelectedId(vertex.id);
    commit(moveSketchVertex(draft.value, vertex.id, position));
  }

  function beginTap(event: PointerEvent<SVGSVGElement>) {
    if (disabled || !addMode || !event.isPrimary || event.button !== 0 || vertices.length >= 200) return;
    tap.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
  }

  function moveTap(event: PointerEvent<SVGSVGElement>) {
    if (tap.current) tap.current = trackSketchTap(tap.current, event.pointerId, event.clientX, event.clientY);
  }

  function finishTap(event: PointerEvent<SVGSVGElement>) {
    const gesture = tap.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    tap.current = null;
    if (disabled || !addMode || trackSketchTap(gesture, event.pointerId, event.clientX, event.clientY).moved) return;
    const position = clientToSketchPosition(event.currentTarget, event.clientX, event.clientY);
    if (position) append(position);
  }

  function restore(undo: boolean) {
    if (disabled) return;
    const wasDragging = drag.current !== null;
    cancelDrag();
    if (undo && wasDragging) {
      setNotice("Movimiento cancelado; el punto conserva su posición anterior.");
      return;
    }
    const next = undo ? undoSketchDraft(draft) : resetSketchDraft(draft);
    setDraft(next);
    setSelectedId(null);
    setEdgeStartId(null);
    setNotice(undo ? "Último cambio deshecho." : "Se restauró el croquis con el que abriste este editor.");
    if (!sameSketch(next.value, draft.value)) onChange(cloneSketch(next.value));
  }

  return (
    <fieldset disabled={disabled} className="polygon-sketch-editor min-w-0 rounded-2xl border border-[#3e2a19]/15 bg-[#fbf8f2] p-4 text-[#3e2a19]" aria-describedby={`${id}-help ${id}-validation`}>
      <legend className="px-2 text-sm font-bold">{label}</legend>
      <p id={`${id}-help`} className="text-sm leading-6 text-[#71685f]">Croquis orientativo. Dibuja entre 3 y 200 puntos, también con entrantes. X e Y indican posiciones de 0 a 100 dentro del dibujo; no representan metros, coordenadas geográficas ni superficie real.</p>
      <div className="my-3 flex flex-wrap gap-2">
        <Button type="button" variant={addMode ? "default" : "outline"} disabled={disabled || editing || vertices.length >= 200} aria-pressed={addMode} onClick={() => { setAddMode(!addMode); tap.current = null; }} className="min-h-11 rounded-full border-[#3e2a19]/20 data-[variant=default]:bg-[#4c6b3a]">
          {addMode ? <MousePointer2 /> : <Plus />}{addMode ? "Terminar de agregar" : "Agregar tocando"}
        </Button>
        <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={() => restore(true)} disabled={disabled || (!draft.history.length && !editing)}><Undo2 /> Deshacer</Button>
        <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={() => restore(false)} disabled={disabled || (sameSketch(draft.value, draft.initial) && !editing)}><RotateCcw /> Cancelar cambios</Button>
        <Button type="button" variant="outline" className="min-h-11 rounded-full text-[#8d372a]" onClick={() => { cancelDrag(); commit(null); setSelectedId(null); setEdgeStartId(null); setNotice("Croquis vacío. Puedes deshacer este cambio."); }} disabled={disabled || !draft.value}><Trash2 /> Borrar croquis</Button>
      </div>
      <p className="mb-3 text-xs leading-5 text-[#71685f]">{addMode ? "Toca el fondo para agregar cada punto en orden. Deslizar sigue desplazando la página." : "Selecciona un punto y luego arrástralo. También puedes usar las flechas del teclado; Mayús mueve de 5 en 5."}</p>
      <div className="rounded-2xl border border-[#3e2a19]/10 bg-[#f2ecdf] p-6">
        <svg ref={board} viewBox="0 0 100 100" className="aspect-square w-full overflow-visible select-none" role="group" aria-label={`${label}: dibujo interactivo`} aria-describedby={`${id}-help`} onPointerDown={beginTap} onPointerMove={moveTap} onPointerUp={finishTap} onPointerCancel={() => { tap.current = null; }} onPointerLeave={() => { tap.current = null; }}>
          <defs><pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#3e2a19" strokeOpacity=".12" strokeWidth=".3" /></pattern></defs>
          <rect x="0" y="0" width="100" height="100" fill={`url(#${gridId})`} stroke="#3e2a19" strokeOpacity=".2" strokeWidth=".3" />
          {vertices.length >= 3 ? <polygon points={vertices.map((point) => `${point.x},${point.y}`).join(" ")} fill={validation?.ok ? "#4c6b3a" : "#a7643d"} fillOpacity=".18" stroke={validation?.ok ? "#4c6b3a" : "#9c422e"} strokeWidth=".7" pointerEvents="none" /> : <polyline points={vertices.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="#a7643d" strokeWidth=".7" strokeDasharray="2 1" pointerEvents="none" />}
          {vertices.length >= 3 && vertices.map((point, index) => {
            const end = vertices[(index + 1) % vertices.length];
            return <g key={`edge-${point.id}`} pointerEvents={disabled || addMode ? "none" : undefined}>
              <line x1={point.x} y1={point.y} x2={end.x} y2={end.y} stroke="transparent" strokeWidth="44" vectorEffect="non-scaling-stroke" pointerEvents={disabled || addMode ? "none" : "stroke"} className="cursor-pointer" onClick={(event) => { event.stopPropagation(); setEdgeStartId(point.id); setSelectedId(null); }} />
              {edgeIndex === index && <line x1={point.x} y1={point.y} x2={end.x} y2={end.y} stroke="#ab6139" strokeWidth="1.4" pointerEvents="none" />}
            </g>;
          })}
          {vertices.map((point, index) => (
            <g key={point.id} role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled} aria-pressed={selectedId === point.id} aria-label={`Punto ${index + 1}, X ${formatPosition(point.x)}, Y ${formatPosition(point.y)}. Selecciona y usa las flechas para mover.`} style={{ touchAction: !disabled && selectedId === point.id ? "none" : "auto" }} className="cursor-grab outline-none focus-visible:[filter:drop-shadow(0_0_2px_#3e2a19)] active:cursor-grabbing" onPointerDown={(event) => beginDrag(event, point)} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={cancelPointer} onLostPointerCapture={cancelPointer} onKeyDown={(event) => moveWithKeyboard(event, point)} onFocus={() => { setSelectedId(point.id); setEdgeStartId(null); }}>
              <circle cx={point.x} cy={point.y} r=".01" fill="transparent" stroke="transparent" strokeWidth="44" vectorEffect="non-scaling-stroke" pointerEvents="all" />
              <circle cx={point.x} cy={point.y} r={selectedId === point.id ? "1.8" : "1.3"} fill={invalidIndices.includes(index) ? "#9c422e" : selectedId === point.id ? "#3e2a19" : "#4c6b3a"} stroke="#fff" strokeWidth=".5" pointerEvents="none" />
              <text x={point.x + (point.x > 90 ? -2.4 : 2.4)} y={point.y + (point.y < 8 ? 4 : -2.4)} textAnchor={point.x > 90 ? "end" : "start"} fill="#3e2a19" fontSize="3.4" fontWeight="700" pointerEvents="none">{index + 1}</text>
            </g>
          ))}
          {!vertices.length && <text x="50" y="50" textAnchor="middle" fill="#71685f" fontSize="3.6" pointerEvents="none">Agrega el primer punto</text>}
        </svg>
      </div>
      <p id={`${id}-validation`} role="status" aria-live="polite" className={`mt-3 text-sm leading-6 ${validation && !validation.ok ? "text-[#9c422e]" : "text-[#4c6b3a]"}`}>
        {vertices.length}/200 puntos. {validation ? validation.ok ? "Croquis válido. Guarda el formulario para conservarlo." : `${validation.error} Corrige el croquis antes de guardar el formulario.` : "Sin croquis; agrega al menos 3 puntos para crear uno."}
      </p>
      {notice && <p role="status" className="mt-1 text-xs text-[#71685f]">{notice}</p>}
      <div className="mt-4 grid min-w-0 gap-3 ">
        <label className="min-w-0 text-xs font-semibold">Lado para insertar un punto
          <select value={edgeIndex >= 0 ? edgeStartId! : ""} onChange={(event) => { setEdgeStartId(event.target.value || null); setSelectedId(null); }} disabled={disabled || editing || vertices.length < 3} className={`${inputClass} mt-1`}>
            <option value="">Selecciona un lado</option>
            {vertices.length >= 3 && vertices.map((point, index) => <option key={point.id} value={point.id}>Lado {index + 1} → {(index + 1) % vertices.length + 1}</option>)}
          </select>
        </label>
        <Button type="button" variant="outline" className="min-h-11 h-auto max-w-full whitespace-normal py-2 self-end rounded-full" disabled={disabled || editing || edgeIndex < 0 || vertices.length >= 200} onClick={insertMidpoint}><CornerDownLeft /> Insertar punto medio</Button>
      </div>
      <div className="mt-4 rounded-xl border border-[#3e2a19]/10 bg-white/60 p-3">
        <p className="text-sm font-semibold">Agregar por posición</p>
        <div className="mt-2 grid grid-cols-2 gap-2 ">
          <label className="min-w-0 text-xs">X del nuevo punto<input type="number" min="0" max="100" step="any" inputMode="decimal" value={newX} onChange={(event) => setNewX(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addFromFields(); } }} disabled={disabled || editing || vertices.length >= 200} className={`${inputClass} mt-1`} /></label>
          <label className="min-w-0 text-xs">Y del nuevo punto<input type="number" min="0" max="100" step="any" inputMode="decimal" value={newY} onChange={(event) => setNewY(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addFromFields(); } }} disabled={disabled || editing || vertices.length >= 200} className={`${inputClass} mt-1`} /></label>
          <Button type="button" variant="outline" className="col-span-2 min-h-11 self-end rounded-full sm:col-span-1" disabled={disabled || editing || vertices.length >= 200} onClick={addFromFields}><Plus /> Agregar punto</Button>
        </div>
        {addError && <p role="alert" className="mt-2 text-xs text-[#9c422e]">{addError}</p>}
      </div>
      {vertices.length > 0 && <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">Puntos en orden</p><Button type="button" variant="outline" className="min-h-11 rounded-full text-[#8d372a]" onClick={deleteSelected} disabled={disabled || editing || !selected || vertices.length <= 3}><Trash2 /> Eliminar punto{selected ? ` ${vertices.findIndex((point) => point.id === selected.id) + 1}` : ""}</Button></div>
        <p className="mt-1 text-xs leading-5 text-[#71685f]">Edita X e Y y sal del campo para aplicar. Enter aplica; Escape descarta lo escrito. Conserva al menos 3 puntos o borra todo el croquis.</p>
        <ol aria-label="Puntos ordenados del croquis" className="polygon-coordinate-list mt-3 space-y-2 pr-1">
          {vertices.map((point, index) => <li key={point.id} className={`polygon-coordinate-row grid min-w-0 items-start gap-2 rounded-xl border p-2 ${selectedId === point.id ? "border-[#4c6b3a]/60 bg-[#4c6b3a]/5" : "border-[#3e2a19]/10 bg-white"}`}>
            <Button type="button" variant="outline" className="h-11 w-11 p-0" aria-label={`Seleccionar punto ${index + 1}`} aria-pressed={selectedId === point.id} disabled={disabled || editing} onClick={() => { setSelectedId(point.id); setEdgeStartId(null); }}>{index + 1}</Button>
            {(["x", "y"] as const).map((axis) => <CoordinateField key={axis} label={`${axis.toUpperCase()} del punto ${index + 1}`} value={point[axis]} disabled={disabled || editing} inputClass={inputClass} onCommit={(coordinate) => { if (!draft.value) return; setSelectedId(point.id); commit(moveSketchVertex(draft.value, point.id, { x: point.x, y: point.y, [axis]: coordinate })); }} />)}
          </li>)}
        </ol>
      </div>}
    </fieldset>
  );
}

export function CoordinateField({ label, value, disabled, inputClass, onCommit }: { label: string; value: number; disabled: boolean; inputClass: string; onCommit: (value: number) => void }) {
  const [received, setReceived] = useState(value);
  const [text, setText] = useState(String(value));
  if (received !== value) { setReceived(value); setText(String(value)); }
  const number = Number(text);
  const invalid = !text.trim() || !Number.isFinite(number) || number < 0 || number > 100;
  return <label className="min-w-0 text-xs">{label}
    <input type="number" inputMode="decimal" min="0" max="100" step="any" required value={text} disabled={disabled} aria-invalid={invalid} className={`${inputClass} mt-1`} onChange={(event) => setText(event.target.value)} onBlur={(event) => { const raw = event.currentTarget.value; const next = Number(raw); if (raw.trim() && Number.isFinite(next) && next >= 0 && next <= 100) onCommit(next); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur(); } else if (event.key === "Escape") { event.preventDefault(); setText(String(value)); event.currentTarget.value = String(value); event.currentTarget.blur(); } }} />
    <span role={invalid?"alert":undefined} className="mt-1 block h-8 text-[#9c422e]">{invalid?"Usa 0–100.":""}</span>
  </label>;
}

function formatPosition(value: number) {
  return value.toLocaleString("es-VE", { maximumFractionDigits: 2 });
}
