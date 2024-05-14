import { visit } from 'unist-util-visit';
import { withBasePath } from '../utils/basePath';

export function remarkBasePathLinks() {
  const isGithubPages = process.env.GITHUB_PAGES === 'true';
  const basePath = process.env.VITE_BASE_PATH || '';

  return (tree) => {
    visit(tree, 'link', (node) => {
      if (node.url && node.url.startsWith('/') && !isGithubPages) {
        node.url = withBasePath(node.url);
      }
    });
  };
}
