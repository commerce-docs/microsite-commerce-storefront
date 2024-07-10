import dedent from 'dedent';

export const QUERIES = {
  Cart: dedent`query GUEST_CART_QUERY($cartId: String!) {
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
  Products: dedent`query ProductQuery($sku: String!) {
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
  Recommendations: dedent`query GetRecommendations(
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
  StoreConfig: dedent`query STORE_CONFIG_QUERY {
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
  /*
  Wishlist: dedent`query getCustomerWishlist($id: ID!, $currentPage: Int) {
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
*/
};
