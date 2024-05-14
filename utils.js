export function withBasePath(path) {
  const basePath = import.meta.env.VITE_BASE_PATH || '';
  return `${basePath}${path}`;
}
