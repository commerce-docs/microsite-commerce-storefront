// import 'regenerator-runtime/runtime';
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

import { ENDPOINT } from './queries/endpoint';
import { QUERIES } from './queries/queries';
import { VARIABLES } from './queries/queryVariables';
import headers from './queries/queryHeaders.json';

import 'graphiql/graphiql.min.css';
import './graphiql-overrides.css';
import './GraphiQLEditor.css';

const ErrorMessage = ({ message }) => <div className="error-message">{message}</div>;

const ResponseTime = ({ responseTime }) => (
  <span className="response-stat">
    <span className="stat-label">RESPONSE TIME: </span>
    <span className="stat-value">
      {responseTime !== null ? ` ${Math.floor(responseTime)} ms` : ''}
    </span>
  </span>
);

const ResponseSize = ({ responseSize }) => (
  <span className="response-stat">
    <span className="stat-label">RESPONSE SIZE: </span>
    <span className="stat-value">{responseSize !== null ? ` ${responseSize} bytes` : ''}</span>
  </span>
);

const QueryButton = ({ queryKey, activeQueryKey, onQueryClick }) => (
  <button
    className={`query-button ${activeQueryKey === queryKey ? 'active' : ''}`}
    onClick={() => onQueryClick(queryKey)}
  >
    {queryKey}
  </button>
);

const QueriesBar = ({ queries, activeQueryKey, onQueryClick, responseTime, responseSize }) => (
  <div className="queries-bar">
    <h2 className="queries-bar-title">Queries</h2>

    {Object.keys(queries).map((key) => (
      <QueryButton
        key={key}
        queryKey={key}
        activeQueryKey={activeQueryKey}
        onQueryClick={onQueryClick}
      />
    ))}
    <div className="response-stats">
      <ResponseTime responseTime={responseTime} />
      <ResponseSize responseSize={responseSize} />
    </div>
  </div>
);

const GraphiQLEditor = () => {
  const [selectedQuery, setSelectedQuery] = useState(QUERIES.Cart);
  const [selectedVariables, setSelectedVariables] = useState(VARIABLES.Cart);
  const [activeQueryKey, setActiveQueryKey] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [defaultVariables, setDefaultVariables] = useState(null);

  const queryHeaders = JSON.stringify(headers);
  console.log('queryHeaders', queryHeaders);

  const { timedFetcher, responseTime, responseSize, error, setError } = useTimedFetcher(ENDPOINT);
  const pluginContext = usePluginContext();
  const PluginContent = pluginContext?.visiblePlugin?.content;

  const handleQueryClick = useCallback(
    async (key) => {
      setActiveQueryKey(key);
      setError(null);

      try {
        setSelectedQuery(QUERIES[key]);
        setSelectedVariables(VARIABLES[key]);
        const result = await timedFetcher({
          query: selectedQuery,
          variables: selectedVariables,
        });

        setQueryResult(result);
      } catch (err) {
        setError(err.message);
      }
    },
    [timedFetcher, setError]
  );

  const formattedResponse = useMemo(
    () => (queryResult ? JSON.stringify(queryResult, null, 2) : ''),
    [queryResult]
  );

  return (
    <div className="editor-wrapper">
      <QueriesBar
        queries={QUERIES}
        activeQueryKey={activeQueryKey}
        onQueryClick={handleQueryClick}
        responseTime={responseTime}
        responseSize={responseSize}
      />

      {error && <ErrorMessage message={error} />}

      <GraphiQLProvider
        fetcher={timedFetcher}
        plugins={[explorerPlugin()]}
        defaultQuery={selectedQuery}
        query={selectedQuery}
        response={formattedResponse}
        defaultEditorToolsVisibility={'variables'}
        defaultVariables={selectedVariables}
        variables={selectedVariables}
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
          <GraphiQL.Logo>{null}</GraphiQL.Logo>
          <ResponseEditor />
        </GraphiQLInterface>
      </GraphiQLProvider>
    </div>
  );
};

function useTimedFetcher(endpoint) {
  const [responseTime, setResponseTime] = useState(null);
  const [responseSize, setResponseSize] = useState(0);
  const [error, setError] = useState(null);

  const defaultFetcher = createGraphiQLFetcher({
    url: endpoint,
    enableIncrementalDelivery: false,
  });

  const timedFetcher = useCallback(
    async (params) => {
      const start = performance.now();
      try {
        const response = await defaultFetcher(params);
        const end = performance.now();
        setResponseTime(end - start);
        const responseSize = new Blob([JSON.stringify(response)]).size;
        setResponseSize(responseSize);
        return response;
      } catch (err) {
        const end = performance.now();
        setResponseTime(end - start);
        setError(err.message);
        throw err;
      }
    },
    [endpoint]
  );

  return { timedFetcher, responseTime, responseSize, error, setError };
}

export default GraphiQLEditor;
