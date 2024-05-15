export function withBasePath(path) {
  const basePath = import.meta.env.VITE_BASE_PATH || '';
  return `${basePath}${path}`;
}

export function setBasePath(path) {
  const isProduction = import.meta.env.NODE_ENV === 'production';
  const isGithubPages = import.meta.env.GITHUB_PAGES === 'true';

  if (isProduction && !isGithubPages) {
    return withBasePath(path);
  }

  return path;
}
