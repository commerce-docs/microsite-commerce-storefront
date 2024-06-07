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
import { gql } from 'graphql-tag';
import dedent from 'dedent';

import 'graphiql/graphiql.min.css';
import './graphiql-overrides.css';
import './GraphiQLEditor.css';

// import cartQuery from './queries/cart.graphql';
// import productsQuery from './queries/products.graphql';
// import recommendationsQuery from './queries/recommendations.graphql';
// import storeConfigQuery from './queries/storeConfig.graphql';
// import wishlistQuery from './queries/wishlist.graphql';

// function prepareQuery(query) {
//   return gql(dedent`${query}`);
// }

let cartIdVar = 'Y8HrBP9pLdVhiWJ6gNyM5WmxjR97S7ra';
let skuVar = '24-WG080';

// Define default variables for each query
const VARIABLES = {
  cart: JSON.stringify({ cartId: cartIdVar }, null, 2),
  products: JSON.stringify({ sku: skuVar }, null, 2),
  recommendations: JSON.stringify(
    {
      pageType: 'Product',
      currentSku: '24-WG03',
      userViewHistory: [
        { date: '2024-06-05T18:19:52.730Z', sku: '24-WB06' },
        { date: '2024-06-05T18:23:22.712Z', sku: '24-UG07' },
        { date: '2024-06-06T15:05:31.836Z', sku: '24-WG03' },
      ],
      userPurchaseHistory: [],
    },
    null,
    2
  ),
  wishlist: JSON.stringify({ id: '5841', currentPage: 1 }, null, 2),
};

const QUERIES = {
  cart: dedent`query GUEST_CART_QUERY($cartId: String!) {
  cart(cart_id: $cartId) {
    id
    total_quantity
    is_virtual
    prices {
      subtotal_with_discount_excluding_tax {
        currency
        value
      }
      subtotal_including_tax {
        currency
        value
      }
      subtotal_excluding_tax {
        currency
        value
      }
      grand_total {
        currency
        value
      }
      applied_taxes {
        label
        amount {
          value
          currency
        }
      }
      discounts {
        amount {
          value
          currency
        }
        label
      }
    }
    shipping_addresses {
      country {
        code
      }
      region {
        code
      }
      postcode
    }
  }
}
  `,
  products: dedent`query ProductQuery($sku: String!) {
  products(skus: [$sku]) {
    externalId
    sku
    name
    description
    shortDescription
    urlKey
    inStock
    metaTitle
    metaKeyword
    metaDescription
    images(roles: []) {
      url
      label
      roles
    }
    attributes(roles: []) {
      name
      label
      value
      roles
    }
    ... on SimpleProductView {
      price {
        ...priceFields
      }
    }
    ... on ComplexProductView {
      options {
        id
        title
        required
        values {
          id
          title
          inStock
          ... on ProductViewOptionValueSwatch {
            type
            value
          }
        }
      }
      priceRange {
        maximum {
          ...priceFields
        }
        minimum {
          ...priceFields
        }
      }
    }
  }
}
fragment priceFields on ProductViewPrice {
  roles
  regular {
    amount {
      currency
      value
    }
  }
  final {
    amount {
      currency
      value
    }
  }
}
  `,
  recommendations: dedent`query GetRecommendations(
  $pageType: PageType!
  $category: String
  $currentSku: String
  $cartSkus: [String]
  $userPurchaseHistory: [PurchaseHistory]
  $userViewHistory: [ViewHistory]
) {
  recommendations(
    cartSkus: $cartSkus
    category: $category
    currentSku: $currentSku
    pageType: $pageType
    userPurchaseHistory: $userPurchaseHistory
    userViewHistory: $userViewHistory
  ) {
    results {
      displayOrder
      pageType
      productsView {
        name
        sku
        url
        images {
          url
        }
        externalId
        __typename
      }
      storefrontLabel
      totalProducts
      typeId
      unitId
      unitName
    }
    totalResults
  }
}`,
  storeConfig: dedent`query STORE_CONFIG_QUERY {
  storeConfig {
    minicart_display
    minicart_max_items
    cart_expires_in_days
    cart_summary_display_quantity
    default_country
    category_fixed_product_tax_display_setting
    product_fixed_product_tax_display_setting
    sales_fixed_product_tax_display_setting
    shopping_cart_display_zero_tax
  }
}`,
  wishlist: dedent`query getCustomerWishlist($id: ID!, $currentPage: Int) {
  customer {
    wishlist_v2(id: $id) {
      id
      items_v2(currentPage: $currentPage) {
        items {
          id
          ...WishlistItemFragment
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}
fragment WishlistItemFragment on WishlistItemInterface {
  id
  product {
    uid
    image {
      label
      url
      __typename
    }
    name
    price_range {
      maximum_price {
        final_price {
          currency
          value
          __typename
        }
        discount {
          amount_off
          __typename
        }
        __typename
      }
      __typename
    }
    sku
    stock_status
    ... on ConfigurableProduct {
      configurable_options {
        uid
        attribute_code
        attribute_id
        attribute_id_v2
        label
        values {
          uid
          default_label
          label
          store_label
          use_default_value
          value_index
          swatch_data {
            ... on ImageSwatchData {
              thumbnail
              __typename
            }
            value
            __typename
          }
          __typename
        }
        __typename
      }
      variants {
        attributes {
          uid
          code
          value_index
          __typename
        }
        product {
          uid
          stock_status
          small_image {
            url
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
  ... on ConfigurableWishlistItem {
    configurable_options {
      id
      option_label
      value_id
      value_label
      __typename
    }
    __typename
  }
  __typename
}`,
};

// const ENDPOINT =
//   'https://edge-sandbox-graph.adobe.io/api/3134367d-63c9-4b79-b243-05f871be7a99/graphql';
const ENDPOINT =
  'https://edge-sandbox-graph.adobe.io/api/18205ff7-6701-451b-916e-36372101e2fc/graphql';

console.log('ENDPOINT', ENDPOINT);

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
    <select
      id="location"
      name="location"
      className="query-selector h-full border-0 text-gray-900"
      defaultValue="Catalog Service"
    >
      <option>Catalog Service</option>
    </select>

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
      const start = performance.now();
      try {
        console.log('params', params);
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
  const [activeQueryKey, setActiveQueryKey] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [variables, setVariables] = useState(null);
  const [defaultVariables, setDefaultVariables] = useState(null);

  const { timedFetcher, responseTime, responseSize, error, setError } = useTimedFetcher(ENDPOINT);
  const pluginContext = usePluginContext();
  const PluginContent = pluginContext?.visiblePlugin?.content;

  const handleQueryClick = useCallback(
    async (key) => {
      setActiveQueryKey(key);
      setError(null);

      // Clear the variables and defaultVariables
      setVariables(null);
      setDefaultVariables(null);

      try {
        const selectedQuery = QUERIES[key];
        const selectedVariables = VARIABLES[key];
        const result = await timedFetcher({ query: selectedQuery, variables: selectedVariables });
        setVariables(selectedVariables);
        setDefaultVariables(selectedVariables);
        setQueryResult(result);
      } catch (err) {
        setError(err.message);
      }
    },
    [timedFetcher, setError]
  );

  const selectedVariables = useMemo(() => VARIABLES[activeQueryKey], [activeQueryKey]);
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
        defaultVariableEditorOpen={true}
        defaultVariables={selectedVariables}
        variables={selectedVariables}
        onEditVariables={(variables) => {
          console.log('onEditVariables', variables);
        }}
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

export default GraphiQLEditor;
