import { visit } from 'unist-util-visit';
import { withBasePath } from '../utils/basePath';
import { isProductionOrGitHub } from '../utils/env';

// Derive the page's root-relative path (for example `/blocks/build-custom-features/`)
// so same-page `#id` links can be made absolute. A frontmatter `slug` overrides
// the served route, so it must win over the source file path when present.
function pagePathFromFile(file) {
  const slugOverride = file?.data?.astro?.frontmatter?.slug;
  if (typeof slugOverride === 'string') {
    const slug = slugOverride.replace(/^\/+|\/+$/g, '');
    return slug ? `/${slug}/` : '/';
  }

  const sourcePath = (file && (file.history?.[0] || file.path)) || '';
  const normalized = sourcePath.replace(/\\/g, '/');
  const marker = '/src/content/docs/';
  const index = normalized.indexOf(marker);
  if (index === -1) return null;

  const slug = normalized
    .slice(index + marker.length)
    .replace(/\.(mdx?|md)$/i, '')
    .replace(/(^|\/)index$/i, '');

  return slug ? `/${slug}/` : '/';
}

export function remarkBasePathLinks() {
  return (tree, file) => {
    if (!isProductionOrGitHub()) return;

    // Computed lazily: only pages with same-page links need their own path.
    let pagePath;

    visit(tree, 'link', (node) => {
      if (!node.url) return;

      if (node.url.startsWith('/')) {
        node.url = withBasePath(node.url);
        return;
      }

      // Bare `#id` fragments resolve against the `<base href>` the publishing
      // pipeline injects, which points at the site root — sending readers to the
      // home page. Prefix the page's own absolute path so the fragment resolves
      // against the current page regardless of any `<base>` tag.
      if (node.url.startsWith('#')) {
        if (pagePath === undefined) pagePath = pagePathFromFile(file);
        if (pagePath) node.url = withBasePath(pagePath) + node.url;
      }
    });
  };
}
