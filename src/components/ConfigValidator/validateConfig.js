const KNOWN_HEADERS = [
  'Magento-Store-Code',
  'Magento-Store-View-Code',
  'Magento-Website-Code',
  'Magento-Environment-Id',
  'x-api-key',
  'AC-View-ID',
  'AC-Price-Book-ID',
  'AC-Environment-Id',
];

const REQUIRED_ANALYTICS_FIELDS = {
  aco: ['locale', 'store-view-currency-code', 'view-id'],
  paas: ['base-currency-code', 'environment', 'environment-id', 'store-url', 'store-code', 'store-view-code'],
  accs: ['base-currency-code', 'environment', 'environment-id', 'store-url'],
};

function isSectionLike(value) {
  return Boolean(value) && typeof value === 'object' && ('headers' in value || 'analytics' in value);
}

function findPlaceholders(value, path, findings) {
  if (typeof value === 'string') {
    const matches = value.match(/\{\{[^{}]+\}\}/g);
    if (matches) {
      matches.forEach((placeholder) => {
        findings.push({
          rule: 'unresolved-placeholder',
          severity: 'error',
          path,
          message: `Unresolved placeholder ${placeholder} — replace it with your actual value.`,
        });
      });
    }
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => findPlaceholders(item, `${path}[${index}]`, findings));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => {
      findPlaceholders(child, path ? `${path}.${key}` : key, findings);
    });
  }
}

export function detectBackendType(section) {
  const csHeaders = section?.headers?.cs || {};
  const headerKeys = Object.keys(csHeaders);
  const hasAcHeader = headerKeys.some((key) => /^ac-/i.test(key));

  if (section?.['adobe-commerce-optimizer'] === true || hasAcHeader) return 'aco';

  const hasApiKey = headerKeys.some((key) => key.toLowerCase() === 'x-api-key');
  const hasEnvironmentId = headerKeys.some((key) => key.toLowerCase() === 'magento-environment-id');
  if (hasApiKey || hasEnvironmentId) return 'paas';

  return 'accs';
}

function checkHeaderCasing(headers, scopeLabel, path, findings) {
  Object.keys(headers || {}).forEach((key) => {
    const canonical = KNOWN_HEADERS.find((known) => known.toLowerCase() === key.toLowerCase());
    if (canonical && canonical !== key) {
      findings.push({
        rule: 'header-casing',
        severity: 'error',
        path: `${path}.headers.${scopeLabel}.${key}`,
        message: `Header "${key}" has incorrect casing — expected "${canonical}".`,
      });
    }
  });
}

function checkHeaderFamilies(csHeaders, path, findings) {
  const keys = Object.keys(csHeaders || {});
  const hasMagentoHeader = keys.some((key) => /^magento-/i.test(key));
  const hasAcHeader = keys.some((key) => /^ac-/i.test(key));

  if (hasMagentoHeader && hasAcHeader) {
    findings.push({
      rule: 'mixed-header-families',
      severity: 'warning',
      path: `${path}.headers.cs`,
      message:
        'Both Magento-* and AC-* headers found in the same "cs" section — confirm this isn\'t a leftover from a PaaS/ACCS-to-ACO migration.',
    });
  }
}

function checkAnalyticsFields(section, backendType, path, findings) {
  const analytics = section.analytics || {};
  const requiredFields = REQUIRED_ANALYTICS_FIELDS[backendType] || [];

  requiredFields.forEach((field) => {
    const value = analytics[field];
    if (value === undefined || value === null || value === '') {
      findings.push({
        rule: 'missing-analytics-field',
        severity: 'error',
        path: `${path}.analytics.${field}`,
        message: `Missing required "analytics.${field}" for a ${backendType.toUpperCase()} configuration.`,
      });
    }
  });
}

export function validateConfig(rawConfig) {
  if (!rawConfig || typeof rawConfig !== 'object') {
    return [
      {
        rule: 'invalid-json',
        severity: 'error',
        path: '',
        message: 'Input is not a valid JSON object.',
      },
    ];
  }

  const findings = [];
  findPlaceholders(rawConfig, '', findings);

  let sections;
  if (rawConfig.public && typeof rawConfig.public === 'object') {
    sections = rawConfig.public;
  } else if (isSectionLike(rawConfig)) {
    sections = { default: rawConfig };
  } else {
    sections = rawConfig;
  }

  Object.entries(sections).forEach(([sectionKey, section]) => {
    if (!isSectionLike(section)) return;

    const path = `public.${sectionKey}`;
    const backendType = detectBackendType(section);

    checkHeaderCasing(section.headers?.all, 'all', path, findings);
    checkHeaderCasing(section.headers?.cs, 'cs', path, findings);
    checkHeaderFamilies(section.headers?.cs, path, findings);

    // Only "default" carries the full analytics block — path-based overrides (e.g. "/fr/")
    // are merged with "default" at runtime and are expected to omit most fields.
    if (sectionKey === 'default') {
      checkAnalyticsFields(section, backendType, path, findings);
    }
  });

  return findings;
}
