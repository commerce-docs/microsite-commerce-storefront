// Guard for the inline home-page search (src/components/HomeSearch.astro).
// That component loads Pagefind's documented JS API from `<base>/pagefind/
// pagefind.js`. If a Starlight or Pagefind upgrade ever stops emitting that
// file, the home search silently degrades to the modal fallback — correct, but
// easy to miss. Run this after a production build to catch it loudly instead.
//
// Usage: pnpm build:prod-fast && node scripts/check-pagefind.mjs
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
const TARGET = 'pagefind.js';

async function findPagefind(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = await findPagefind(full);
      if (found) return found;
    } else if (entry.name === TARGET && dir.endsWith('pagefind')) {
      return full;
    }
  }
  return null;
}

const found = await findPagefind(DIST);

if (found) {
  console.log(`Pagefind API present at ${found} — home search inline mode is healthy.`);
} else {
  console.error(`Could not find pagefind/${TARGET} under ${DIST}/.`);
  console.error('The home search will fall back to the modal everywhere.');
  console.error('If Pagefind moved, update the path in src/components/HomeSearch.astro.');
  process.exit(1);
}
