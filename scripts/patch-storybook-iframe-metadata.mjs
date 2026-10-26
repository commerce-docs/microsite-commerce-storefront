/**
 * Re-applies Experience League meta description + query-aware description script to
 * Storybook's generated iframe.html after each static build.
 *
 * Storybook overwrites public/storybook-static/; run via npm run patch:storybook-iframe
 * or chained after build:storybook in package.json.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iframePath = path.join(__dirname, '..', 'public', 'storybook-static', 'iframe.html');

/** Injected immediately after the first </title> in iframe.html */
const HEAD_INJECTION = `<meta id="sb-desc" name="description" content="Adobe Commerce Storefront SDK Storybook iframe preview for interactive component and design-token examples published with Experience League documentation."><script>(()=>{var d=document,q=new URLSearchParams(location.search),id=q.get('id')||'',docs=q.get('viewMode')==='docs',M={'components-cartlist--overview':'CartList component preview in the Adobe Commerce Storefront SDK Storybook. Pair with Cart drop-in documentation on Experience League.','components-pagination--overview':'Pagination component preview in the Adobe Commerce Storefront SDK Storybook. Pair with Product Discovery documentation on Experience League.','components-skeleton--overview':'Skeleton component preview in the Adobe Commerce Storefront SDK Storybook. Pair with the SDK components documentation on Experience League.','design-typography--overview':'Typography design tokens preview in the Adobe Commerce Storefront SDK Storybook. Pair with SDK design system documentation on Experience League.'};var t=M[id]||(id?'Storybook preview for the Adobe Commerce Storefront SDK: '+id+'.':'Adobe Commerce Storefront SDK Storybook iframe preview for interactive component and design-token examples published with Experience League documentation.');if(docs)t+=' This URL opens the Storybook docs canvas.';var e=d.getElementById('sb-desc');if(e)e.setAttribute('content',t);})();</script>`;

function main() {
  if (!fs.existsSync(iframePath)) {
    console.error(`patch-storybook-iframe-metadata: missing ${iframePath}`);
    process.exit(1);
  }

  let html = fs.readFileSync(iframePath, 'utf8');

  // Remove a previous patch so re-runs stay idempotent
  html = html.replace(/<meta id="sb-desc"[\s\S]*?<\/script>/, '');

  const titleEnd = '</title>';
  const idx = html.indexOf(titleEnd);
  if (idx === -1) {
    console.error('patch-storybook-iframe-metadata: could not find </title> in iframe.html (Storybook output format changed?)');
    process.exit(1);
  }

  const insertAt = idx + titleEnd.length;
  html = html.slice(0, insertAt) + HEAD_INJECTION + html.slice(insertAt);

  fs.writeFileSync(iframePath, html, 'utf8');
  console.log(`patch-storybook-iframe-metadata: updated ${path.relative(process.cwd(), iframePath)}`);
}

main();
