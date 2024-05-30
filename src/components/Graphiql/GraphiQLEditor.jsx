import 'regenerator-runtime/runtime';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GraphiQLInterface, GraphiQLProvider } from 'graphiql';
import { ExecuteButton, ToolbarButton } from '@graphiql/react';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import { codeExporterPlugin } from '@graphiql/plugin-code-exporter';
import '@graphiql/plugin-explorer/dist/style.css';
import '@graphiql/plugin-code-exporter/dist/style.css';
import './graphiql.css';

let executionTime = null;

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

console.log('QUERIES', QUERIES['getCustomer']);
const customLogo = () => null;
const explorer = explorerPlugin();

export default function GraphiQLEditor() {
  const [activeQueryKey, setActiveQueryKey] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  // const [executionTime, setExecutionTime] = useState(null);
  const [error, setError] = useState(null);
  const executeButtonRef = useRef(null);

  useEffect(() => {
    executeButtonRef.current = document.querySelector('.graphiql-execute-button');
  }, []);

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
      executionTime = Math.floor(endTime - startTime);

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
      // console.log('selectedQuery:', selectedQuery);
      const result = await fetcher({ query: selectedQuery });
      setQueryResult(result);
    } catch (error) {}
  };

  /*
  Example code for snippets. See https://github.com/OneGraph/graphiql-code-exporter#snippets for details
  */

  const removeQueryName = (query) =>
    query.replace(
      /^[^{(]+([{(])/,
      (_match, openingCurlyBracketsOrParenthesis) => `query ${openingCurlyBracketsOrParenthesis}`
    );

  const getQuery = (arg, spaceCount) => {
    const { operationDataList } = arg;
    const { query } = operationDataList[0];
    const anonymousQuery = removeQueryName(query);
    return ' '.repeat(spaceCount) + anonymousQuery.replaceAll('\n', '\n' + ' '.repeat(spaceCount));
  };

  const exampleSnippetOne = {
    name: 'Example One',
    language: 'JavaScript',
    codeMirrorMode: 'jsx',
    options: [],
    generate: (arg) => `export const query = graphql\`
${getQuery(arg, 2)}
\`
`,
  };

  const exampleSnippetTwo = {
    name: 'Example Two',
    language: 'JavaScript',
    codeMirrorMode: 'jsx',
    options: [],
    generate: (arg) => `import { graphql } from 'graphql'

export const query = graphql\`
${getQuery(arg, 2)}
\`
`,
  };

  const snippets = [exampleSnippetOne, exampleSnippetTwo];

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
        plugins={[explorer, codeExporterPlugin({ snippets })]}
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
}
