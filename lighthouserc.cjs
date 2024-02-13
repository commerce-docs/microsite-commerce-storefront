const dotenv = require('dotenv');
dotenv.config();
const { throttling, screenEmulationMetrics, userAgents } = require('./lighthouseConsts');

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 2,
      settings: {
        formFactor: 'desktop',
        throttling: throttling.desktopDense4G,
        screenEmulation: screenEmulationMetrics.desktop,
        emulatedUserAgent: userAgents.desktop,
      },
      url: [
        'http://localhost/index.html',
        'http://localhost/essentials/install/index.html',
        'http://localhost/essentials/brand/index.html',
        'http://localhost/essentials/explore/index.html',
        'http://localhost/essentials/connect/index.html',
        'http://localhost/essentials/customize/index.html',
        'http://localhost/essentials/localize/index.html',
      ],
    },
    upload: {
      target: 'temporary-public-storage',
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN || '',
    },
  },
};
