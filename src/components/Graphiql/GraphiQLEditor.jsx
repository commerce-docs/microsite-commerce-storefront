import 'regenerator-runtime/runtime';
import React, { useState, useCallback } from 'react';
import { GraphiQLProvider, useExecutionContext } from '@graphiql/react';
import { GraphiQLInterface } from 'graphiql';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import '@graphiql/plugin-explorer/dist/style.css';
import '@graphiql/plugin-code-exporter/dist/style.css';
import './graphiql.css';

const QUERIES = {
  getProduct: `
  {
    country(code: "CA") {
      name
      capital
      currency
    }
  }`,
  getCustomer: `
  {
    country(code: "GB") {
      name
      capital
      currency
    }
  }`,
  getCategories: `
  {
    country(code: "FR") {
      name
      capital
      currency
    }
  }`,
};

const explorer = explorerPlugin();

const GraphiQLEditor = () => {
  const [activeQueryKey, setActiveQueryKey] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  let [executionTime, setExecutionTime] = useState(null);
  const [error, setError] = useState(null);

  const fetcher = useCallback(async (graphQLParams) => {
    try {
      const startTime = performance.now();

      const response = await fetch(
        'https://countries.trevorblades.com/',
        // 'https://edge-sandbox-graph.adobe.io/api/3134367d-63c9-4b79-b243-05f871be7a99/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(graphQLParams),
        }
      );

      const endTime = performance.now();
      setExecutionTime(Math.floor(endTime - startTime));

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const handleQueryClick = async (key) => {
    setActiveQueryKey(key);
    setError(null);

    try {
      const selectedQuery = QUERIES[key];
      const result = await fetcher({ query: selectedQuery });
      setQueryResult(result);
    } catch (error) {}
  };

  return (
    <div>
      <div className="queries-bar">
        {Object.keys(QUERIES).map((key) => (
          <button
            className={`button-39 ${activeQueryKey === key ? 'active' : ''}`}
            key={key}
            onClick={() => handleQueryClick(key)}
          >
            {key}
          </button>
        ))}
        <div className="execution-time">Execution Time: {executionTime} ms</div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <GraphiQLProvider
        fetcher={fetcher}
        plugins={[explorer]}
        defaultQuery={QUERIES[activeQueryKey]}
        query={QUERIES[activeQueryKey]}
        response={queryResult ? JSON.stringify(queryResult, null, 2) : ''}
      >
        <div className="graphiql-container graphiql-wrapper">
          <GraphiQLInterface disableTabs={true} fetcher={fetcher} />
        </div>
      </GraphiQLProvider>
    </div>
  );
};

export default GraphiQLEditor;
