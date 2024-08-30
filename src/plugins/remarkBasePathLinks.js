import { visit } from 'unist-util-visit';
import { withBasePath } from '../utils/basePath';
import { isProductionOrGitHub } from '../utils/env';

export function remarkBasePathLinks() {
  return (tree) => {
    visit(tree, 'link', (node) => {
      if (node.url && node.url.startsWith('/')) {
        if (isProductionOrGitHub()) {
          node.url = withBasePath(node.url);
        }
      }
    });
  };
}
