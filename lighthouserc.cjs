module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      settings: {
        onlyCategories: ['performance'],
        formFactor: 'desktop',
      },
    },
    assert: {
      // assert options here
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
    server: {
      // server options here
    },
    wizard: {
      // wizard options here
    },
  },
};
