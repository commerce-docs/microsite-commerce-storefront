import React, { useState, useRef, useEffect } from 'react';
import { GraphiQL } from 'graphiql';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import './graphiql.css';

const defaultQuery = `{
  country( code: "US" ) {
    name
    capital
    currency 
  }
}
`;

const getProduct = `{
  country( code: "CA" ) {
    name
    capital
    currency 
  }
}
`;

const getCustomer = `{
  country( code: "GB" ) {
    name
    capital
    currency 
  }
}
`;

const getCategories = `{
  country( code: "FR" ) {
    name
    capital
    currency 
  }
}
`;

const explorer = explorerPlugin();

const GraphiQLComponent = (props) => {
  const [query, setQuery] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const graphiqlRef = useRef(null);
  const startTime = useRef(null);
  const executeButtonRef = useRef(null);

  const customLogo = () => null;

  useEffect(() => {
    executeButtonRef.current = document.querySelector('.graphiql-execute-button');
  }, []);

  const fetcher = async (graphQLParams) => {
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
      // Handle errors appropriately for your application
      console.error('Error fetching data:', error);
      throw error; // Rethrow the error to be handled by GraphiQL or other components
    }
  };

  return (
    <div>
      <div class="queries-bar">
        <button className="button-39" onClick={() => setQuery(getProduct)}>
          getProduct
        </button>
        <button className="button-39" onClick={() => setQuery(getCustomer)}>
          getCustomer
        </button>
        <button className="button-39" onClick={() => setQuery(getCategories)}>
          getCategories
        </button>
        <div className="execution-time">Execution Time: {executionTime} ms</div>
      </div>
      <GraphiQL
        ref={graphiqlRef}
        {...props}
        defaultEditorToolsVisibility="false"
        isHeadersEditorEnabled={false}
        showPersistHeadersSettings={false}
        disableTabs="true"
        plugins={[explorer]}
        fetcher={fetcher}
        query={query}
        onEditQuery={() => {}} // Prevents automatic execution on query change
      >
        <GraphiQL.Logo>{customLogo}</GraphiQL.Logo>
      </GraphiQL>
    </div>
  );
};

export default GraphiQLComponent;
