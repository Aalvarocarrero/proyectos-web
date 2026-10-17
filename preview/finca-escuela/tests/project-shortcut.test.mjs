import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('project shortcut uses an ordinary separate project-form anchor without auto-opening a third banner',async()=>{const [ui,page]=await Promise.all([read('components/idea-invitation.tsx'),read('app/proyectos/page.tsx')]);assert.match(ui,/<a href="\/proyectos#presentar-proyecto"[^>]*aria-label="Cuéntanos tu proyecto: abrir formulario"/);assert.match(ui,/<span>Tu proyecto<\/span>/);assert.match(page,/id="presentar-proyecto" tabIndex=\{-1\}/);assert.match(page,/<ProjectForm userId=\{user.id\}/);assert.match(page,/Inicia sesión para guardar el borrador/);assert.equal((ui.match(/<Dialog.Root/g)||[]).length,1);});
test('project shortcut uses the same measured size and an explicit gap below idea',async()=>{const css=await read('app/globals.css');assert.match(css,/\.glass-action-orb \{ position:fixed; z-index:90/);assert.match(css,/\.project-orb \{[^}]*var\(--agro-orb-top\) \+ var\(--agro-orb-size\) \+ var\(--agro-orb-gap\)/);assert.match(css,/--agro-orb-gap:8px/);});

test("short landscape moves the store request away and social placement avoids the new shortcut",async()=>{const [css,social]=await Promise.all([read("app/globals.css"),read("components/social-links.tsx")]);assert.match(css,/@media \(max-height:480px\) \{ \.store-request-trigger \{ left:max\([^}]*right:auto/);assert.match(social,/\.idea-orb, \.project-orb,/);});
