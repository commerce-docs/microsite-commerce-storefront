/// <reference path="./node_modules/@astrojs/starlight/virtual-internal.d.ts" />

declare module 'virtual:starlight/user-config' {
  const Config: import('@astrojs/starlight/types').StarlightConfig;

  export default Config;
}
