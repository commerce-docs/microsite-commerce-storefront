import React from 'react';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import GraphiQL from 'graphiql';

import 'graphiql/graphiql.css';
import './graphiql.css';

const defaultQuery = `
{
  country(code: "BR") {
    name
    native
    capital
    emoji
    currency
    languages {
      code
      name
    }
  }
}
`;

const explorer = explorerPlugin();

const fetcher = async (graphQLParams) => {
  console.log('Sending request with params:', graphQLParams);
  const response = await fetch('https://countries.trevorblades.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(graphQLParams),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('GraphQL request failed:', error);
    throw new Error('Network response was not ok: ' + response.statusText);
  }

  return await response.json();
};

const GraphiQLApp = () => {
  return (
    <div className="graphiql-container" style={{ height: '100vh' }}>
      <GraphiQL
        fetcher={fetcher}
        defaultQuery={defaultQuery}
        plugins={[explorer]}
        disableTabs={true}
      />
    </div>
  );
};

export default GraphiQLApp;
