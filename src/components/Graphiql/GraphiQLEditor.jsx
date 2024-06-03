import 'regenerator-runtime/runtime';
import React, { useState, useCallback, useMemo } from 'react';
import { GraphiQL, GraphiQLInterface } from 'graphiql';
import {
  GraphiQLProvider,
  QueryEditor,
  ResponseEditor,
  ExecuteButton,
  usePluginContext,
} from '@graphiql/react';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import dedent from 'dedent';
import 'graphiql/graphiql.css';
import './graphiql-root.css';
import './graphiql-overrides.css';

const TEST_ENDPOINT = 'https://countries.trevorblades.com/';
let isFetching = false;

const QUERIES = {
  getProduct: dedent`{
    countries {
      code
      name
      native
      emoji
      currency
      languages {
        code
        name
      }
    }
  }
  `,
  getCustomer: dedent`{
    country(code: "GB") {
      name
      capital
      currency
    }
  }`,
  getCategories: dedent`{
    country(code: "FR") {
      name
      capital
      currency
    }
  }`,
};

const ErrorMessage = ({ message }) => <div className="error-message">{message}</div>;

const ResponseTime = ({ executionTime: responseTime }) => (
  <div className="response-time-display">
    {responseTime !== null ? `Response time: ${responseTime.toFixed(2)} ms` : 'No response yet'}
  </div>
);

const QueryButton = ({ queryKey, activeQueryKey, onQueryClick }) => (
  <button
    className={`query-button ${activeQueryKey === queryKey ? 'active' : ''}`}
    onClick={() => onQueryClick(queryKey)}
  >
    {queryKey}
  </button>
);

const QueriesBar = ({ queries, activeQueryKey, onQueryClick, executionTime }) => (
  <div className="queries-bar">
    {Object.keys(queries).map((key) => (
      <QueryButton
        key={key}
        queryKey={key}
        activeQueryKey={activeQueryKey}
        onQueryClick={onQueryClick}
      />
    ))}
    <ResponseTime executionTime={executionTime} />
  </div>
);

const useTimedFetcher = (endpoint) => {
  const [executionTime, setExecutionTime] = useState(null);
  const [error, setError] = useState(null);

  const defaultFetcher = createGraphiQLFetcher({
    url: endpoint,
    enableIncrementalDelivery: false,
  });

  const timedFetcher = useCallback(
    async (params) => {
      if (isFetching) return;
      isFetching = true;

      const start = performance.now();
      try {
        const response = await defaultFetcher(params);
        const end = performance.now();
        setExecutionTime(end - start);

        isFetching = false;
        return response;
      } catch (err) {
        const end = performance.now();
        setExecutionTime(end - start);
        setError(err.message);
        throw err;
      }
    },
    [endpoint]
  );

  return { timedFetcher, executionTime, error, setError };
};

const GraphiQLEditor = () => {
  const [activeQueryKey, setActiveQueryKey] = useState('');
  const [queryResult, setQueryResult] = useState(null);

  const { timedFetcher, executionTime, error, setError } = useTimedFetcher(TEST_ENDPOINT);
  const pluginContext = usePluginContext();
  const PluginContent = pluginContext?.visiblePlugin?.content;

  const handleQueryClick = useCallback(
    async (key) => {
      setActiveQueryKey(key);
      setError(null);

      try {
        const selectedQuery = QUERIES[key];
        const result = await timedFetcher({ query: selectedQuery });
        setQueryResult(result);
      } catch (err) {
        setError(err.message);
      }
    },
    [timedFetcher, setError]
  );

  const selectedQuery = useMemo(() => QUERIES[activeQueryKey], [activeQueryKey]);
  const formattedResponse = useMemo(
    () => (queryResult ? JSON.stringify(queryResult, null, 2) : ''),
    [queryResult]
  );

  return (
    <div className="editor-wrapper not-content">
      <QueriesBar
        queries={QUERIES}
        activeQueryKey={activeQueryKey}
        onQueryClick={handleQueryClick}
        executionTime={executionTime}
      />

      {error && <ErrorMessage message={error} />}

      <GraphiQLProvider
        fetcher={timedFetcher}
        plugins={[explorerPlugin()]}
        defaultQuery={selectedQuery}
        query={selectedQuery}
        response={formattedResponse}
      >
        <GraphiQLInterface>
          <div className="graphiql-sidebar-section">
            {PluginContent && <PluginContent className="not-content" />}
          </div>
          <QueryEditor className="custom-query-editor" />
          <div className="vertical">
            <ExecuteButton />
            <GraphiQL.Toolbar />
          </div>
          <GraphiQL.Logo>{() => null}</GraphiQL.Logo>
          <ResponseEditor />
        </GraphiQLInterface>
      </GraphiQLProvider>
    </div>
  );
};

export default GraphiQLEditor;
