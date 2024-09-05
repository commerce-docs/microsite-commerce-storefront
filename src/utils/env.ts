export function isProductionOrGitHub(): boolean {
  const env = process.env.NODE_ENV;
  return env === 'production' || env === 'github';
}
