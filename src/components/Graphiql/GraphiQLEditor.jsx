import React, { useState, useCallback } from 'react';
import { GraphiQLProvider, QueryEditor, ResponseEditor } from '@graphiql/react';
import { GraphiQLInterface } from 'graphiql';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import 'graphiql/graphiql.css';
import './graphiql.css';

const QUERIES = {
  getProduct: `{
    country(code: "CA") {
      name
      capital
      currency
    }
  }`,
  getCustomer: `{
    country(code: "GB") {
      name
      capital
      currency
    }
  }`,
  getCategories: `{
    country(code: "FR") {
      name
      capital
      currency
    }
  }`,
};

const customLogo = () => null;
const explorer = explorerPlugin();

export default function GraphiQLEditor() {
  const [activeQueryKey, setActiveQueryKey] = useState('getProduct');
  const [queryResult, setQueryResult] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [error, setError] = useState(null);

  const fetcher = useCallback(async (graphQLParams) => {
    try {
      const startTime = performance.now();

      const response = await fetch('https://countries.trevorblades.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphQLParams),
      });

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
    } catch (error) {
      // Error message is set in the fetcher
    }
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

      <GraphiQLProvider fetcher={fetcher} plugins={[explorer]}>
        <div className="graphiql-container graphiql-wrapper">
          <GraphiQLInterface
            fetcher={fetcher}
            disableTabs={true}
            isHeadersEditorEnabled={false}
            defaultEditorToolsVisibility={false}
            showPersistHeadersSettings={false}
            query={QUERIES[activeQueryKey]}
            response={queryResult ? JSON.stringify(queryResult, null, 2) : ''}
          />
        </div>
      </GraphiQLProvider>
    </div>
  );
}
