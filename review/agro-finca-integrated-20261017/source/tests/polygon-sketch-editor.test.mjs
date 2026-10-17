import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom", configFile: false, root,
  cacheDir: "/tmp/agro-polygon-editor-tests",
  resolve: { alias: { "@": root } },
  plugins: [{
    name: "polygon-editor-interaction-hooks",
    enforce: "pre",
    transform(code, id) {
      if (id.includes("polygon-sketch-editor.tsx?interaction")) return code.replace('from "react";', 'from "virtual:polygon-editor-hooks";');
    },
    resolveId(id) {
      if (id === "virtual:polygon-editor-hooks") return "\0polygon-editor-hooks";
    },
    load(id) {
      if (id === "\0polygon-editor-hooks") return `
        export const useId = () => globalThis.__polygonEditorHooks.useId();
        export const useMemo = (factory, dependencies) => globalThis.__polygonEditorHooks.useMemo(factory, dependencies);
        export const useRef = (initial) => globalThis.__polygonEditorHooks.useRef(initial);
        export const useState = (initial) => globalThis.__polygonEditorHooks.useState(initial);
      `;
    },
  }],
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
});
after(async () => { await vite.close(); delete globalThis.__polygonEditorHooks; });
const helpers = await vite.ssrLoadModule("/lib/polygon-editor-interaction.ts");
const geometry = await vite.ssrLoadModule("/lib/polygon-geometry.ts");
const { PolygonSketchEditor } = await vite.ssrLoadModule("/components/polygon-sketch-editor.tsx");
const { PolygonSketchEditor: InteractiveEditor, CoordinateField: InteractiveCoordinateField } = await vite.ssrLoadModule("/components/polygon-sketch-editor.tsx?interaction");

// All fixtures are invented normalized drawing positions, not user records.
const polygon = () => ({
  version: 1, coordinateSpace: "normalized-100",
  vertices: [{ id: "a", x: 10, y: 10 }, { id: "b", x: 85, y: 10 }, { id: "c", x: 80, y: 80 }, { id: "d", x: 10, y: 75 }],
});

test("history is immutable, one commit can be undone, and cancellation restores the initial draft", () => {
  const original = polygon();
  const draft = helpers.createSketchDraft(original);
  const moved = helpers.moveSketchVertex(original, "b", { x: 60, y: 20 });
  const committed = helpers.commitSketchDraft(draft, moved);
  assert.equal(committed.history.length, 1);
  assert.equal(original.vertices[1].x, 85);
  assert.deepEqual(helpers.undoSketchDraft(committed).value, original);
  assert.deepEqual(helpers.resetSketchDraft(helpers.commitSketchDraft(committed, null)).value, original);
  assert.equal(helpers.commitSketchDraft(committed, helpers.cloneSketch(moved)), committed);
  moved.vertices[1].x = 1;
  assert.equal(committed.value.vertices[1].x, 60);
});

test("stable vertex IDs are never reused after deletion, clear, or undo", () => {
  const allocate = helpers.createSketchVertexIdAllocator([{ id: "sketch-v1", x: 0, y: 0 }]);
  assert.equal(allocate(), "sketch-v2");
  assert.equal(allocate([]), "sketch-v3");
  assert.equal(allocate([{ id: "sketch-v4", x: 0, y: 0 }]), "sketch-v5");
  assert.equal(allocate(), "sketch-v6");
});

test("drawing drafts allow one and two points, but geometry validation blocks their save", () => {
  const one = helpers.appendSketchVertex(null, "a", { x: 10, y: 10 });
  const two = helpers.appendSketchVertex(one, "b", { x: 80, y: 10 });
  const three = helpers.appendSketchVertex(two, "c", { x: 40, y: 70 });
  assert.equal(geometry.validateNormalizedSketchPolygon(one).ok, false);
  assert.equal(geometry.validateNormalizedSketchPolygon(two).ok, false);
  assert.equal(geometry.validateNormalizedSketchPolygon(three).ok, true);
  assert.equal(helpers.removeSketchVertex(three, "b"), three);
  assert.equal(helpers.removeSketchVertex(two, "b"), two);
});

test("midpoint insertion handles the closing edge without changing any existing IDs or order", () => {
  const value = polygon();
  const inserted = helpers.insertSketchMidpoint(value, "d", "e");
  assert.deepEqual(inserted.vertices.map((point) => point.id), ["a", "b", "c", "d", "e"]);
  assert.deepEqual(inserted.vertices[4], { id: "e", x: 10, y: 42.5 });
  assert.equal(geometry.validateNormalizedSketchPolygon(inserted).ok, true);
  assert.deepEqual(helpers.removeSketchVertex(inserted, "e"), value);
});

test("200 points is a hard interaction ceiling and concave shapes retain their ordered outline", () => {
  const value = polygon();
  const concave = helpers.moveSketchVertex(value, "c", { x: 30, y: 30 });
  assert.equal(geometry.validateNormalizedSketchPolygon(concave).ok, true);
  const full = { ...value, vertices: Array.from({ length: 200 }, (_, i) => ({ id: `p${i}`, x: i / 2, y: 20 })) };
  assert.equal(helpers.appendSketchVertex(full, "overflow", { x: 50, y: 50 }), full);
  assert.equal(helpers.insertSketchMidpoint(full, "p0", "overflow"), full);
});

function boardMatrix() {
  return {
    getScreenCTM() { return { inverse() { return { a: 0.5, d: 0.25, e: -15, f: -10 }; } }; },
    createSVGPoint() { return { x: 0, y: 0, matrixTransform(matrix) { return { x: this.x * matrix.a + matrix.e, y: this.y * matrix.d + matrix.f }; } }; },
  };
}

test("inverse screen CTM handles offsets and non-square scaling; failed and singular transforms are safe", () => {
  assert.deepEqual(helpers.clientToSketchPosition(boardMatrix(), 90, 120), { x: 30, y: 20 });
  assert.deepEqual(helpers.clientToSketchPosition(boardMatrix(), 250, 480), { x: 110, y: 110 });
  assert.equal(helpers.clientToSketchPosition({ ...boardMatrix(), getScreenCTM: () => null }, 90, 120), null);
  assert.equal(helpers.clientToSketchPosition({ ...boardMatrix(), getScreenCTM() { throw new Error("Detached SVG"); } }, 90, 120), null);
  assert.equal(helpers.clientToSketchPosition(boardMatrix(), NaN, 120), null);
  assert.deepEqual(helpers.moveSketchVertex(polygon(), "a", { x: -40, y: 130 }).vertices[0], { id: "a", x: 0, y: 100 });
});

test("scroll gestures cannot become taps by returning to the original position", () => {
  const tap = { pointerId: 1, startX: 100, startY: 100, moved: false };
  assert.equal(helpers.trackSketchTap(tap, 2, 200, 200), tap);
  const moved = helpers.trackSketchTap(tap, 1, 100, 130);
  assert.equal(moved.moved, true);
  assert.equal(helpers.trackSketchTap(moved, 1, 100, 100).moved, true);
  assert.equal(helpers.trackSketchTap(tap, 1, 103, 103).moved, false);
});

test("keyboard movement is bounded and Shift uses five drawing units", () => {
  assert.deepEqual(helpers.sketchKeyboardPosition({ x: 99, y: 2 }, "ArrowRight", true), { x: 100, y: 2 });
  assert.deepEqual(helpers.sketchKeyboardPosition({ x: 40, y: 2 }, "ArrowUp", true), { x: 40, y: 0 });
  assert.deepEqual(helpers.sketchKeyboardPosition({ x: 40, y: 20 }, "ArrowDown"), { x: 40, y: 21 });
  assert.equal(helpers.sketchKeyboardPosition({ x: 40, y: 20 }, "Enter"), null);
});

test("rendered editor labels drawing units, exposes ordered numeric controls, and never implies measured area", () => {
  const html = renderToStaticMarkup(React.createElement(PolygonSketchEditor, { value: polygon(), onChange() {} }));
  assert.match(html, /Croquis orientativo/);
  assert.match(html, /no representan metros, coordenadas geográficas ni superficie real/);
  assert.match(html, /viewBox="0 0 100 100"/);
  assert.match(html, /<ol aria-label="Puntos ordenados del croquis"/);
  assert.equal((html.match(/role="button" tabindex="0"/g) ?? []).length, 4);
  assert.equal((html.match(/stroke-width="44"/g) ?? []).length, 8);
  assert.match(html, /min="0" max="100"/);
  assert.match(html, /Croquis válido/);
  assert.doesNotMatch(html, /touch-action:none/);
  assert.doesNotMatch(html, /m²|hectáreas|Perímetro/);
});

test("empty, incomplete, invalid, and disabled drafts have explicit accessible states", () => {
  const render = (value, disabled = false) => renderToStaticMarkup(React.createElement(PolygonSketchEditor, { value, disabled, onChange() {} }));
  assert.match(render(null), /Sin croquis; agrega al menos 3 puntos/);
  const two = { ...polygon(), vertices: polygon().vertices.slice(0, 2) };
  assert.match(render(two), /Corrige el croquis antes de guardar el formulario/);
  const crossed = { ...polygon(), vertices: [{ id: "a", x: 10, y: 10 }, { id: "b", x: 90, y: 90 }, { id: "c", x: 10, y: 90 }, { id: "d", x: 90, y: 10 }] };
  assert.match(render(crossed), /Corrige el croquis antes de guardar el formulario/);
  assert.match(render(polygon(), true), /<fieldset disabled=""/);
  assert.equal((render(polygon(), true).match(/role="button" tabindex="-1"/g) ?? []).length, 4);
});

// Tiny deterministic hook harness exercises the component's actual event
// handlers. It is not a replacement for browser pointer/scroll/device QA.
function editorHarness(initial = polygon()) {
  let slots = [], cursor = 0, changed = false, tree;
  let memoRuns = 0;
  const callbacks = [];
  const props = { value: initial, onChange(next) { callbacks.push(next); props.value = next; } };
  const hooks = {
    useId() { return "synthetic-editor"; },
    useMemo(factory, dependencies) {
      const index = cursor++;
      if (!(index in slots) || dependencies.some((dependency, i) => !Object.is(dependency, slots[index].dependencies[i]))) {
        memoRuns++;
        slots[index] = { value: factory(), dependencies: [...dependencies] };
      }
      return slots[index].value;
    },
    useRef(initialValue) { const index = cursor++; if (!(index in slots)) slots[index] = { current: initialValue }; return slots[index]; },
    useState(initialValue) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initialValue === "function" ? initialValue() : initialValue;
      return [slots[index], (next) => { const updated = typeof next === "function" ? next(slots[index]) : next; if (updated !== slots[index]) { changed = true; slots[index] = updated; } }];
    },
  };
  function nodes(node = tree) {
    if (!node || typeof node !== "object") return [];
    if (Array.isArray(node)) return node.flatMap((child) => nodes(child));
    return [node, ...(node.props?.children !== undefined ? nodes(node.props.children) : [])];
  }
  function render() {
    globalThis.__polygonEditorHooks = hooks;
    let count = 0;
    do { changed = false; cursor = 0; tree = InteractiveEditor(props); assert.ok(++count < 20, "render converges"); } while (changed);
    find((node) => node.type === "svg").props.ref.current = boardMatrix();
    return tree;
  }
  const find = (predicate) => { const node = nodes().find(predicate); assert.ok(node, "requested element exists"); return node; };
  const point = (index = 0) => nodes().filter((node) => node.type === "g" && node.props.role === "button")[index];
  const button = (text) => find((node) => node.props?.type === "button" && JSON.stringify(node.props.children).includes(text));
  render();
  return { render, find, point, button, props, callbacks, get memoRuns() { return memoRuns; } };
}
function pointer(x, y, overrides = {}) {
  const captured = new Set();
  const element = { setPointerCapture(id) { captured.add(id); }, hasPointerCapture(id) { return captured.has(id); }, releasePointerCapture(id) { captured.delete(id); } };
  return { pointerId: 1, pointerType: "mouse", button: 0, isPrimary: true, clientX: x * 2 + 30, clientY: y * 4 + 40, currentTarget: element, preventDefault() {}, stopPropagation() {}, ...overrides };
}

test("actual drag handlers preview without callbacks and emit exactly one committed change at release", () => {
  const editor = editorHarness();
  const down = pointer(10, 10);
  editor.point().props.onPointerDown(down); editor.render();
  editor.point().props.onPointerMove(pointer(20, 30, { currentTarget: down.currentTarget })); editor.render();
  assert.equal(editor.callbacks.length, 0);
  assert.equal(editor.props.value.vertices[0].x, 10);
  assert.match(editor.point().props["aria-label"], /X 20, Y 30/);
  editor.point().props.onPointerUp(pointer(20, 30, { currentTarget: down.currentTarget })); editor.render();
  assert.equal(editor.callbacks.length, 1);
  assert.deepEqual(editor.props.value.vertices[0], { id: "a", x: 20, y: 30 });
  editor.point().props.onLostPointerCapture(pointer(20, 30, { currentTarget: down.currentTarget })); editor.render();
  assert.equal(editor.callbacks.length, 1);
  assert.equal(editor.props.value.vertices[0].x, 20);
});

test("200-point drag validates only the committed polygon, then revalidates at release and numeric commit", () => {
  const full = { version: 1, coordinateSpace: "normalized-100", vertices: Array.from({ length: 200 }, (_, index) => ({
    id: `ring-${index}`, x: 50 + 40 * Math.cos(index * Math.PI / 100), y: 50 + 40 * Math.sin(index * Math.PI / 100),
  })) };
  const editor = editorHarness(full);
  assert.equal(editor.memoRuns, 1);
  const down = pointer(90, 50);
  editor.point().props.onPointerDown(down); editor.render();
  for (let index = 1; index <= 5; index++) {
    editor.point().props.onPointerMove(pointer(90 - index, 50, { currentTarget: down.currentTarget })); editor.render();
  }
  assert.equal(editor.memoRuns, 1);
  assert.equal(editor.callbacks.length, 0);
  editor.point().props.onPointerUp(pointer(85, 50, { currentTarget: down.currentTarget })); editor.render();
  assert.equal(editor.memoRuns, 2);
  assert.equal(editor.callbacks.length, 1);
  editor.find((node) => node.props?.label === "X del punto 1").props.onCommit(87); editor.render();
  assert.equal(editor.memoRuns, 3);
  assert.equal(editor.props.value.vertices[0].x, 87);
});

test("pointer cancel and unexpected capture loss restore before-drag coordinates without a commit", () => {
  for (const eventName of ["onPointerCancel", "onLostPointerCapture"]) {
    const editor = editorHarness();
    const down = pointer(10, 10);
    editor.point().props.onPointerDown(down); editor.render();
    editor.point().props.onPointerMove(pointer(30, 40, { currentTarget: down.currentTarget })); editor.render();
    editor.point().props[eventName](pointer(30, 40, { currentTarget: down.currentTarget })); editor.render();
    assert.equal(editor.callbacks.length, 0);
    assert.match(editor.point().props["aria-label"], /X 10, Y 10/);
  }
});

test("disabling or externally replacing a draft during drag prevents stale drag commits", () => {
  for (const scenario of ["disabled", "replacement"]) {
    const editor = editorHarness();
    const down = pointer(10, 10);
    editor.point().props.onPointerDown(down); editor.render();
    editor.point().props.onPointerMove(pointer(30, 40, { currentTarget: down.currentTarget })); editor.render();
    if (scenario === "disabled") editor.props.disabled = true;
    else editor.props.value = helpers.moveSketchVertex(polygon(), "a", { x: 5, y: 5 });
    editor.render();
    editor.point().props.onPointerUp(pointer(30, 40, { currentTarget: down.currentTarget })); editor.render();
    assert.equal(editor.callbacks.length, 0);
    assert.equal(editor.props.value.vertices[0].x, scenario === "disabled" ? 10 : 5);
  }
});

test("touch first selects a point, only the selected handle disables scrolling, and a second gesture can drag", () => {
  const editor = editorHarness();
  editor.point().props.onPointerDown(pointer(10, 10, { pointerType: "touch" })); editor.render();
  assert.equal(editor.point().props.style.touchAction, "none");
  assert.equal(editor.point(1).props.style.touchAction, "auto");
  editor.point().props.onPointerMove(pointer(30, 40, { pointerType: "touch" })); editor.render();
  assert.equal(editor.callbacks.length, 0);
  assert.match(editor.point().props["aria-label"], /X 10, Y 10/);
  const down = pointer(10, 10, { pointerType: "touch" });
  editor.point().props.onPointerDown(down); editor.render();
  editor.point().props.onPointerUp(pointer(30, 40, { pointerType: "touch", currentTarget: down.currentTarget })); editor.render();
  assert.equal(editor.callbacks.length, 1);
  assert.equal(editor.props.value.vertices[0].x, 30);
});

test("tap addition is explicit, scrolling never adds, and undo/clear/cancel are reversible", () => {
  const editor = editorHarness(null);
  const svg = () => editor.find((node) => node.type === "svg");
  const tapEvent = (x, y) => pointer(x, y, { currentTarget: boardMatrix() });
  svg().props.onPointerDown(tapEvent(30, 30)); svg().props.onPointerUp(tapEvent(30, 30)); editor.render();
  assert.equal(editor.callbacks.length, 0);
  editor.button("Agregar tocando").props.onClick(); editor.render();
  svg().props.onPointerDown(tapEvent(30, 30)); svg().props.onPointerMove(tapEvent(30, 50)); svg().props.onPointerUp(tapEvent(30, 30)); editor.render();
  assert.equal(editor.callbacks.length, 0);
  for (const [x, y] of [[10, 10], [80, 10], [40, 70]]) {
    svg().props.onPointerDown(tapEvent(x, y)); svg().props.onPointerUp(tapEvent(x, y)); editor.render();
  }
  assert.equal(editor.props.value.vertices.length, 3);
  const oldId = editor.props.value.vertices[2].id;
  editor.button("Deshacer").props.onClick(); editor.render();
  assert.equal(editor.props.value.vertices.length, 2);
  svg().props.onPointerDown(tapEvent(40, 70)); svg().props.onPointerUp(tapEvent(40, 70)); editor.render();
  assert.notEqual(editor.props.value.vertices[2].id, oldId);
  editor.button("Borrar croquis").props.onClick(); editor.render();
  assert.equal(editor.props.value, null);
  editor.button("Deshacer").props.onClick(); editor.render();
  assert.equal(editor.props.value.vertices.length, 3);
  editor.button("Cancelar cambios").props.onClick(); editor.render();
  assert.equal(editor.props.value, null);
});

test("selected edge insertion, point deletion, keyboard movement, and undo use discrete callbacks", () => {
  const editor = editorHarness();
  editor.find((node) => node.type === "select").props.onChange({ target: { value: "d" } }); editor.render();
  editor.button("Insertar punto medio").props.onClick(); editor.render();
  assert.equal(editor.callbacks.length, 1);
  assert.equal(editor.props.value.vertices.length, 5);
  assert.deepEqual(editor.props.value.vertices[4], { id: "sketch-v1", x: 10, y: 42.5 });
  editor.button("Eliminar punto").props.onClick(); editor.render();
  assert.equal(editor.callbacks.length, 2);
  assert.deepEqual(editor.props.value, polygon());
  editor.point().props.onKeyDown({ key: "ArrowRight", shiftKey: true, preventDefault() {} }); editor.render();
  assert.equal(editor.callbacks.length, 3);
  assert.equal(editor.props.value.vertices[0].x, 15);
  editor.button("Deshacer").props.onClick(); editor.render();
  assert.equal(editor.props.value.vertices[0].x, 10);
  editor.button("Eliminar punto").props.onClick(); editor.render(); // No selection after undo.
  assert.equal(editor.props.value.vertices.length, 4);
});

test("undo during an active drag cancels only its preview and leaves earlier history intact", () => {
  const editor = editorHarness();
  editor.point().props.onKeyDown({ key: "ArrowRight", shiftKey: true, preventDefault() {} }); editor.render();
  assert.equal(editor.props.value.vertices[0].x, 15);
  const down = pointer(15, 10);
  editor.point().props.onPointerDown(down); editor.render();
  editor.point().props.onPointerMove(pointer(30, 40, { currentTarget: down.currentTarget })); editor.render();
  editor.button("Deshacer").props.onClick(); editor.render();
  assert.equal(editor.props.value.vertices[0].x, 15);
  assert.equal(editor.callbacks.length, 1);
  editor.button("Deshacer").props.onClick(); editor.render();
  assert.equal(editor.props.value.vertices[0].x, 10);
});

test("cancelled, non-primary, and multi-pointer background gestures never append a vertex", () => {
  const editor = editorHarness(null);
  const svg = () => editor.find((node) => node.type === "svg");
  editor.button("Agregar tocando").props.onClick(); editor.render();
  svg().props.onPointerDown(pointer(20, 20, { isPrimary: false }));
  svg().props.onPointerUp(pointer(20, 20, { currentTarget: boardMatrix(), isPrimary: false })); editor.render();
  assert.equal(editor.callbacks.length, 0);
  svg().props.onPointerDown(pointer(20, 20));
  svg().props.onPointerCancel();
  svg().props.onPointerUp(pointer(20, 20, { currentTarget: boardMatrix() })); editor.render();
  assert.equal(editor.callbacks.length, 0);
  svg().props.onPointerDown(pointer(20, 20));
  svg().props.onPointerUp(pointer(20, 20, { pointerId: 2, currentTarget: boardMatrix() })); editor.render();
  assert.equal(editor.callbacks.length, 0);
  svg().props.onPointerLeave();
  svg().props.onPointerUp(pointer(20, 20, { currentTarget: boardMatrix() })); editor.render();
  assert.equal(editor.callbacks.length, 0);
});

test("component never queues records or imports persistence into drawing interactions", async () => {
  const source = await readFile(new URL("../components/polygon-sketch-editor.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /queueMutation|indexedDB|fetch\(|offline-db|onChange\(active\.preview/);
  const move = source.slice(source.indexOf("function moveDrag("), source.indexOf("function finishDrag("));
  assert.doesNotMatch(move, /onChange\(|commit\(/);
});


test("five-digit and negative sketch drafts retain fixed tracks and reserved error space without clamping values",()=>{
 let cursor=0;const slots=[],commits=[];
 globalThis.__polygonEditorHooks={useState(initial){const index=cursor++;if(!(index in slots))slots[index]=initial;return [slots[index],next=>slots[index]=typeof next==='function'?next(slots[index]):next];}};
 const render=()=>{cursor=0;return InteractiveCoordinateField({label:'X del punto 1',value:50,disabled:false,inputClass:'h-11 min-w-0 w-full',onCommit:value=>commits.push(value)});};
 const input=tree=>tree.props.children.find(child=>child?.type==='input');const error=tree=>tree.props.children.find(child=>child?.type==='span');
 const initial=render(),inputClass=input(initial).props.className,errorClass=error(initial).props.className;
 for(const value of ['85518','-12345','99.123456']){input(render()).props.onChange({target:{value}});const tree=render();assert.equal(input(tree).props.value,value);assert.equal(input(tree).props.className,inputClass);assert.equal(error(tree).props.className,errorClass);assert.match(errorClass,/h-8/);input(tree).props.onBlur({currentTarget:{value}});}
 assert.deepEqual(commits,[99.123456]);
});
