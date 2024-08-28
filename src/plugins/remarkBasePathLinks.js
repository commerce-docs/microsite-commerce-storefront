import { visit } from 'unist-util-visit';
import { withBasePath } from '../utils/basePath';

export function remarkBasePathLinks() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isGitHub = process.env.NODE_ENV === 'github';

  return (tree) => {
    visit(tree, 'link', (node) => {
      if (node.url && node.url.startsWith('/')) {
        if (isProduction || isGitHub) {
          node.url = withBasePath(node.url);
        }
      }
    });
  };
}