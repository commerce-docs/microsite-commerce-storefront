import { isProductionOrGitHub } from '../utils/env';

function getBasePath(): string {
  return import.meta.env.VITE_PROD_BASE_PATH || import.meta.env.VITE_GITHUB_BASE_PATH || '';
}

export function withBasePath(path: string): string {
  const basePath = getBasePath();
  return `${basePath}${path}`;
}

export function setBasePath(path: string): string {
  if (isProductionOrGitHub()) {
    return withBasePath(path);
  }
  return path;
}
