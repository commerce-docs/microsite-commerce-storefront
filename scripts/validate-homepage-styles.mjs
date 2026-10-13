import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM, VirtualConsole } from 'jsdom';

const input = process.argv[2] || new URL('../dist/index.html', import.meta.url);
let html = '';
if (input === '-') {
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) html += chunk;
} else {
  html = await readFile(input, 'utf8');
}
const { window } = new JSDOM(html, { virtualConsole: new VirtualConsole() });
const { document } = window;
const styles = [...document.querySelectorAll('style')].map((style) => style.textContent).join('\n');

for (const className of ['home-hero', 'home-search']) {
  assert.ok(document.querySelector(`.${className}`), `Missing homepage markup: .${className}`);
  assert.match(
    styles,
    new RegExp(`\\.${className}(?=[:\\s.{])`),
    `Missing inline CSS for .${className}. Keep build.inlineStylesheets set to 'always'; deployed CSS must not depend on JavaScript imports.`
  );
}

const externalStyles = [...document.querySelectorAll('link[rel="stylesheet"]')]
  .filter((link) => link.getAttribute('media') !== 'print')
  .map((link) => link.getAttribute('href'));
assert.deepEqual(
  externalStyles,
  [],
  'Homepage screen styles must be inline to avoid deployment CSS-as-JavaScript failures.'
);

window.close();
console.log('Homepage styles are inline and independent of JavaScript.');
