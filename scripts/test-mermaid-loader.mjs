import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const source = await readFile(
  new URL('../src/components/diagram/mermaid-global-mount.js', import.meta.url),
  'utf8',
);

class DiagramElement {
  constructor(id, inSearch = false) {
    this.id = id;
    this.inSearch = inSearch;
    this.isConnected = true;
    this.pending = true;
  }

  closest() { return this.inSearch; }
  hasAttribute() { return this.pending; }
  removeAttribute() { this.pending = false; }
}

async function setup() {
  const state = { elements: [], imports: 0, mounts: [], errors: [], failImport: false };
  const handlers = new Map();
  const context = vm.createContext({
    HTMLElement: DiagramElement,
    console: { error: (...args) => state.errors.push(args) },
    document: {
      querySelectorAll: () => state.elements.filter((element) => element.pending),
      addEventListener: (event, callback) => handlers.set(event, callback),
    },
  });
  const renderer = new vm.SyntheticModule(['attachMermaidDiagramLifecycle'], function () {
    this.setExport('attachMermaidDiagramLifecycle', ({ rootId }) => state.mounts.push(rootId));
  }, { context });
  await renderer.link(() => { });
  await renderer.evaluate();
  const loader = new vm.SourceTextModule(source, {
    context,
    importModuleDynamically: async () => {
      state.imports++;
      if (state.failImport) throw new Error('Network failure');
      return renderer;
    },
  });
  await loader.link(() => { });
  await loader.evaluate();
  return { state, navigate: () => handlers.get('astro:page-load')() };
}

test('pages without eligible diagrams do not import Mermaid', async () => {
  const { state, navigate } = await setup();
  assert.equal(state.imports, 0);
  state.elements = [new DiagramElement('search-preview', true), new DiagramElement('')];
  await navigate();
  assert.equal(state.imports, 0);
});

test('navigation mounts diagrams once, including overlapping page-load events', async () => {
  const { state, navigate } = await setup();
  state.elements = [new DiagramElement('first'), new DiagramElement('second')];
  await Promise.all([navigate(), navigate()]);
  assert.deepEqual(state.mounts, ['first', 'second']);
  await navigate();
  assert.deepEqual(state.mounts, ['first', 'second']);
  state.elements = [new DiagramElement('next-page')];
  await navigate();
  assert.deepEqual(state.mounts, ['first', 'second', 'next-page']);
});

test('diagrams detached while loading are not mounted', async () => {
  const { state, navigate } = await setup();
  const diagram = new DiagramElement('detached');
  state.elements = [diagram];
  const loading = navigate();
  diagram.isConnected = false;
  await loading;
  assert.deepEqual(state.mounts, []);
});

test('failed imports leave diagrams pending for a later retry', async () => {
  const { state, navigate } = await setup();
  const diagram = new DiagramElement('retry');
  state.elements = [diagram];
  state.failImport = true;
  await navigate();
  assert.equal(state.errors.length, 1);
  assert.equal(diagram.pending, true);
  state.failImport = false;
  await navigate();
  assert.deepEqual(state.mounts, ['retry']);
});
