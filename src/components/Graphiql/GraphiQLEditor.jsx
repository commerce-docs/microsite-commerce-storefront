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

import queryHeaders from './queries/queryHeaders.json';

import 'graphiql/graphiql.min.css';
import './graphiql-overrides.css';
import './GraphiQLEditor.css';

const useTimedFetcher = (endpoint, queryHeaders) => {
  const [responseTime, setResponseTime] = useState(null);
  const [responseSize, setResponseSize] = useState(0);
  const [error, setError] = useState(null);

  const defaultFetcher = createGraphiQLFetcher({
    url: endpoint,
    headers: queryHeaders,
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
};

const GraphiQLEditor = () => {
  const [selectedQuery, setSelectedQuery] = useState(``);
  const [selectedVariables, setSelectedVariables] = useState(VARIABLES.Default);
  const [queryResult, setQueryResult] = useState(null);
  const [defaultVariables, setDefaultVariables] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const { timedFetcher, responseTime, responseSize, error, setError } = useTimedFetcher(
    ENDPOINT,
    queryHeaders
  );
  const pluginContext = usePluginContext();
  const PluginContent = pluginContext?.visiblePlugin?.content;

  const handleQuerySelection = useCallback(
    async (query) => {
      console.log('handleQuerySelection', query);
      setError(null);

      try {
        setSelectedQuery(QUERIES[query]);
        setSelectedVariables(VARIABLES[query]);
        const response = await timedFetcher({
          query: selectedQuery,
          variables: selectedVariables,
        });

        setQueryResult(response);
      } catch (err) {
        setError(err.message);
      }
    },
    [timedFetcher, setError]
  );

  return (
    <div className={`graphiql-editor`}>
      <div className="editor-wrapper not-content">
        <QueriesBar
          queries={QUERIES}
          handleQuerySelection={handleQuerySelection}
          responseTime={responseTime}
          responseSize={responseSize}
        />

        {error && <ErrorMessage message={error} />}

        <GraphiQLProvider
          fetcher={timedFetcher}
          plugins={[explorerPlugin()]}
          defaultQuery={selectedQuery}
          query={selectedQuery}
          response={queryResult}
          defaultEditorToolsVisibility={true}
          defaultVariables={selectedVariables}
          variables={selectedVariables}
          headers={JSON.stringify(queryHeaders, null, 2)}
        >
          <GraphiQLInterface>
            <div className="graphiql-sidebar-section">{PluginContent && <PluginContent />}</div>

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
    </div>
  );
};

function QueriesBar({ queries, handleQuerySelection, responseTime, responseSize }) {
  return (
    <div className="queries-bar">
      <h2 className="queries-bar-title">QUERIES</h2>
      {Object.keys(queries).map((query) => (
        <QueryButton key={query} query={query} handleQuerySelection={handleQuerySelection} />
      ))}
      <div className="response-stats">
        <ResponseTime responseTime={responseTime} />
        <ResponseSize responseSize={responseSize} />
      </div>
    </div>
  );
}

function QueryButton({ query, handleQuerySelection }) {
  return (
    <button className={`query-button`} onClick={() => handleQuerySelection(query)}>
      {query}
    </button>
  );
}

function ResponseTime({ responseTime }) {
  return (
    <span className="response-stat">
      <span className="stat-label">RESPONSE TIME: </span>
      <span className="stat-value">
        {responseTime !== null ? ` ${Math.floor(responseTime)} ms` : ''}
      </span>
    </span>
  );
}

function ResponseSize({ responseSize }) {
  return (
    <span className="response-stat">
      <span className="stat-label">RESPONSE SIZE: </span>
      <span className="stat-value">{responseSize !== null ? ` ${responseSize} bytes` : ''}</span>
    </span>
  );
}

function ErrorMessage({ message }) {
  return <div className="error-message">{message}</div>;
}

export default GraphiQLEditor;
