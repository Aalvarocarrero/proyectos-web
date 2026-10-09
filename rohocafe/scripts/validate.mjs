import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const css = fs.readFileSync(path.join(dist, "styles.css"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(dist, "manifest.webmanifest"), "utf8"));
const hosting = JSON.parse(fs.readFileSync(path.join(root, ".openai", "hosting.json"), "utf8"));

const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

assert(/^<!doctype html>/i.test(html), "Missing HTML doctype");
assert(/<html lang="es">/.test(html), "Missing Spanish document language");
assert(/<link rel="canonical" href="https:\/\//.test(html), "Missing absolute canonical URL");
assert(hosting.project_id, "Missing Sites project_id");
assert(hosting.static?.directory === "dist", "Static directory must be dist");
assert(manifest.display === "standalone", "PWA display mode must be standalone");

const documentRefs = [...html.matchAll(/(?:src|href)="(\.\/[^"?#]+)(?:[?#][^"]*)?"/g)].map((match) => match[1]);
const styleRefs = [...css.matchAll(/url\("(\.\/[^"?#]+)"\)/g)].map((match) => match[1]);
const manifestRefs = manifest.icons.map((icon) => icon.src);

for (const ref of new Set([...documentRefs, ...styleRefs, ...manifestRefs])) {
  assert(fs.existsSync(path.resolve(dist, ref)), `Missing local asset: ${ref}`);
}

for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
  assert(/\balt="[^"]*"/.test(match[1]), `Image lacks alt text: ${match[0].slice(0, 90)}`);
  assert(/\bwidth="\d+"/.test(match[1]) && /\bheight="\d+"/.test(match[1]), `Image lacks dimensions: ${match[0].slice(0, 90)}`);
}

for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  try {
    JSON.parse(match[1]);
  } catch (error) {
    errors.push(`Invalid structured data: ${error.message}`);
  }
}

assert(!/href="#"/.test(html), "Found empty anchor destination");
assert(!/lorem ipsum|contenido pendiente|texto de prueba/i.test(html), "Found unfinished placeholder copy");
assert(fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8").includes("<urlset"), "Invalid sitemap");
assert(fs.readFileSync(path.join(dist, "robots.txt"), "utf8").includes("Sitemap:"), "robots.txt lacks sitemap");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${new Set([...documentRefs, ...styleRefs, ...manifestRefs]).size} local references, structured data, SEO metadata and PWA configuration.`);
