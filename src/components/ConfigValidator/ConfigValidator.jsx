import React, { useState } from 'react';
import { validateConfig, detectBackendType } from './validateConfig.js';
import './ConfigValidator.css';

const SAMPLE_CONFIG = `{
  "public": {
    "default": {
      "commerce-core-endpoint": "https://www.aemshop.net/graphql",
      "commerce-endpoint": "https://www.aemshop.net/cs-graphql",
      "headers": {
        "all": {
          "Store": "default"
        },
        "cs": {
          "Magento-Store-Code": "main_website_store",
          "Magento-Store-View-Code": "default",
          "Magento-Website-Code": "base",
          "x-api-key": "4dfa19c9fe6f4cccade55cc5b3da94f7",
          "Magento-Environment-Id": "f38a0de0-764b-41fa-bd2c-5bc2f3c7b39a"
        }
      },
      "analytics": {
        "base-currency-code": "USD",
        "environment": "Production",
        "environment-id": "f38a0de0-764b-41fa-bd2c-5bc2f3c7b39a",
        "store-code": "main_website_store",
        "store-view-code": "default",
        "store-url": "https://www.aemshop.net"
      }
    }
  }
}`;

function groupBySection(findings) {
  const groups = new Map();
  findings.forEach((finding) => {
    const sectionKey = finding.path.split('.')[1] || 'root';
    if (!groups.has(sectionKey)) groups.set(sectionKey, []);
    groups.get(sectionKey).push(finding);
  });
  return groups;
}

const ConfigValidator = () => {
  const [input, setInput] = useState(SAMPLE_CONFIG);
  const [findings, setFindings] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [backendSummary, setBackendSummary] = useState([]);

  const handleValidate = () => {
    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch (err) {
      setParseError(`Invalid JSON: ${err.message}`);
      setFindings(null);
      setBackendSummary([]);
      return;
    }

    setParseError(null);
    setFindings(validateConfig(parsed));

    const sections = parsed.public && typeof parsed.public === 'object' ? parsed.public : { default: parsed };
    setBackendSummary(
      Object.entries(sections)
        .filter(([, section]) => section && typeof section === 'object')
        .map(([key, section]) => ({ key, backendType: detectBackendType(section) }))
    );
  };

  const groupedFindings = findings ? groupBySection(findings) : null;

  return (
    <div className="config-validator not-content">
      <textarea
        className="config-validator-input"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        spellCheck={false}
        rows={16}
      />

      <button type="button" className="config-validator-button" onClick={handleValidate}>
        Validate
      </button>

      {parseError && <p className="config-validator-error">{parseError}</p>}

      {backendSummary.length > 0 && (
        <p className="config-validator-summary">
          Detected backend type:{' '}
          {backendSummary.map(({ key, backendType }) => `${key} → ${backendType.toUpperCase()}`).join(', ')}
        </p>
      )}

      {groupedFindings && groupedFindings.size === 0 && (
        <p className="config-validator-pass">No issues found against the known ACO/ACCS patterns.</p>
      )}

      {groupedFindings &&
        Array.from(groupedFindings.entries()).map(([sectionKey, sectionFindings]) => (
          <div key={sectionKey} className="config-validator-section">
            <h4>{sectionKey}</h4>
            <ul>
              {sectionFindings.map((finding, index) => (
                <li key={index} className={`config-validator-finding config-validator-finding-${finding.severity}`}>
                  <strong>[{finding.severity}]</strong> {finding.message}
                  {finding.path && <code className="config-validator-path"> ({finding.path})</code>}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
};

export default ConfigValidator;
