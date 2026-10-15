// Assembles the OMNI Demo Day pages from src/ and compiles Tailwind.
// Output goes into the deployed site folder, served at /omni-demo-day.
// Usage: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, '..', 'Sciton Landing Pages', 'omni-demo-day');
const read = (p) => readFileSync(join(root, p), 'utf8');

// <!-- @include lead-form id="hero" location="hero" heading="h2" -->
const include = (html) =>
  html.replace(/<!--\s*@include\s+([\w-]+)((?:\s+\w+="[^"]*")*)\s*-->/g, (_, name, attrs) => {
    let partial = read(`src/partials/${name}.html`);
    for (const [, key, value] of attrs.matchAll(/(\w+)="([^"]*)"/g)) {
      partial = partial.replaceAll(`{{${key}}}`, value);
    }
    const leftover = partial.match(/{{\w+}}/);
    if (leftover) throw new Error(`Unfilled ${leftover[0]} in ${name}`);
    return partial.trim();
  });

// Compile CSS first (Tailwind scans src/ and the page scripts), so its fingerprint can be stamped into the pages.
mkdirSync(join(out, 'assets', 'css'), { recursive: true });
execSync(`npx tailwindcss -i ./src/input.css -o "${join(out, 'assets', 'css', 'styles.css')}" --minify`, { cwd: root, stdio: 'inherit' });

// Every CSS / JS link carries a content hash, so a changed file gets a new URL and browsers always fetch the latest version.
const fingerprint = (file) => createHash('sha1').update(readFileSync(join(out, file))).digest('hex').slice(0, 10);
const versioned = ['assets/css/styles.css', 'assets/js/main.js', 'assets/js/thank-you.js'];
const stamp = (html) =>
  versioned.reduce((page, file) => page.replaceAll(`${file}"`, `${file}?v=${fingerprint(file)}"`), html);

const pages = [
  ['src/pages/index.html', 'index.html'],
  ['src/pages/thank-you.html', 'thank-you/index.html'],
];

for (const [src, dest] of pages) {
  mkdirSync(dirname(join(out, dest)), { recursive: true });
  writeFileSync(join(out, dest), stamp(include(read(src))));
  console.log(`built Sciton Landing Pages/omni-demo-day/${dest}`);
}
