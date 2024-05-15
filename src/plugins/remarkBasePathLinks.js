import { visit } from 'unist-util-visit';
import { withBasePath } from '../utils/basePath';

export function remarkBasePathLinks() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isGithubPages = process.env.GITHUB_PAGES === 'true';

  return (tree) => {
    visit(tree, 'link', (node) => {
      if (node.url && node.url.startsWith('/') && isProduction && !isGithubPages) {
        node.url = withBasePath(node.url);
      }
    });
  };
}
