export function withBasePath(path) {
  const basePath = import.meta.env.VITE_PROD_BASE_PATH || '';
  return `${basePath}${path}`;
}

export function setBasePath(path) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return withBasePath(path);
  }
  return path;
}
