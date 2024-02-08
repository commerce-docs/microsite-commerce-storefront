const constants = require('./lighthouse-constants.cjs');

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      startServerCommand: 'npm run preview',
      numberOfRuns: 1,
      staticDirFileDiscoveryDepth: 2,
      maxAutodiscoverUrls: 0,
      settings: {
        formFactor: 'desktop',
        throttling: constants.throttling.desktopDense4G,
        screenEmulation: constants.screenEmulationMetrics.desktop,
        emulatedUserAgent: constants.userAgents.desktop,
      },
    },
  },
};
