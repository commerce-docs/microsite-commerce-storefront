import { satisfies } from 'semver';

if (!satisfies(process.env.npm_package_version, '>=9.0.0')) {
  throw new Error(`This repository requires pnpm version 9.1.0 or higher. Current version: ${process.env.npm_package_version}`);
}
