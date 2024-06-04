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

const ENDPOINT =
  'https://edge-sandbox-graph.adobe.io/api/3134367d-63c9-4b79-b243-05f871be7a99/graphql';
let isFetching = false;

const QUERIES = {
  getProduct: dedent`{
    products(search: "earrings") {
      items {
        name
        sku
        price_range {
          minimum_price {
            regular_price {
              value
              currency
            }
          }
        }
        image {
          url
        }
      }
    }
  }
  `,
  getProducts: dedent`{
    country(id: "US") {
      id
      full_name_english
    }
  
    categories(filters: { name: { match: "Tops" } }) {
      items {
        name
        products(pageSize: 10, currentPage: 2) {
          items {
            sku
          }
        }
      }
    }
  }
  `,
  getStores: dedent`{
    availableStores(useCurrentGroup: true) {
      store_code
      store_name
      is_default_store
      store_group_code
      is_default_store_group
      locale
      base_currency_code
      default_display_currency_code
      timezone
      weight_unit
      base_url
      base_link_url
      base_static_url
      base_media_url
      secure_base_url
      secure_base_link_url
      secure_base_static_url
      secure_base_media_url
    }
  }`,
};

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

const useTimedFetcher = (endpoint) => {
  const [responseTime, setResponseTime] = useState(null);
  const [responseSize, setResponseSize] = useState(0);
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
        setResponseTime(end - start);

        const responseSize = new Blob([JSON.stringify(response)]).size;
        setResponseSize(responseSize);

        isFetching = false;
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
  const [activeQueryKey, setActiveQueryKey] = useState('');
  const [queryResult, setQueryResult] = useState(null);

  const { timedFetcher, responseTime, responseSize, error, setError } = useTimedFetcher(ENDPOINT);
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
      >
        {/* <div className="endpoint-container">
          <button type="button" className="post-button">
            POST
          </button>
          <input type="text" className="endpoint-input" value={TEST_ENDPOINT} />
          <div className="response-header">
            <ResponseTime responseTime={responseTime} />
            <ResponseSize responseSize={responseSize} />
          </div>
        </div> */}

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
