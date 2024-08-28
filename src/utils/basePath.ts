export function withBasePath(path: string): string {
  const basePath = import.meta.env.VITE_PROD_BASE_PATH || import.meta.env.VITE_GITHUB_BASE_PATH || '';
  return `${basePath}${path}`;
}

export function setBasePath(path: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const isGitHub = process.env.NODE_ENV === 'github';

  if (isProduction || isGitHub) {
    return withBasePath(path);
  }
  return path;
}