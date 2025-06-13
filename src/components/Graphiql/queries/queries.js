import dedent from 'dedent';

export const ACCS_QUERIES = {
  Cart: dedent`query GUEST_CART_QUERY(
      $cartId: String!
      $pageSize: Int! = 100
      $currentPage: Int! = 1
      $itemsSortInput: QuoteItemsSortInput! = { field: CREATED_AT, order: DESC }
    ) {
      cart(cart_id: $cartId) {
        ...CART_FRAGMENT
      }
    }

    fragment CART_FRAGMENT on Cart {
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
        grand_total_excluding_tax {
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
          coupon {
            code
          }
          applied_to
        }
      }
      applied_coupons {
        code
      }
      itemsV2(
        pageSize: $pageSize
        currentPage: $currentPage
        sort: $itemsSortInput
      ) {
        items {
          ...CART_ITEM_FRAGMENT
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
    fragment CART_ITEM_FRAGMENT on CartItemInterface {
      __typename
      uid
      quantity
      is_available
      not_available_message
      errors {
        code
        message
      }
      prices {
        price {
          value
          currency
        }
        discounts {
          amount {
            value
            currency
          }
          label
        }
        total_item_discount {
          value
          currency
        }
        row_total {
          value
          currency
        }
        row_total_including_tax {
          value
          currency
        }
        price_including_tax {
          value
          currency
        }
        fixed_product_taxes {
          amount {
            value
            currency
          }
          label
        }
        original_item_price {
          value
          currency
        }
        original_row_total {
          value
          currency
        }
      }
      product {
        name
        sku
        thumbnail {
          url
          label
        }
        url_key
        canonical_url
        categories {
          url_path
          url_key
          name
        }
        custom_attributesV2(filters: { is_visible_on_front: true }) {
          items {
            code
            ... on AttributeValue {
              value
            }
            ... on AttributeSelectedOptions {
              selected_options {
                value
                label
              }
            }
          }
        }
        only_x_left_in_stock
        stock_status
        price_range {
          ...PRICE_RANGE_FRAGMENT
        }
      }
      ... on SimpleCartItem {
        customizable_options {
          ...CUSTOMIZABLE_OPTIONS_FRAGMENT
        }
      }
      ... on ConfigurableCartItem {
        configurable_options {
          configurable_product_option_uid
          option_label
          value_label
        }
        configured_variant {
          uid
          sku
          only_x_left_in_stock
          stock_status
          thumbnail {
            label
            url
          }
          price_range {
            ...PRICE_RANGE_FRAGMENT
          }
        }
        customizable_options {
          ...CUSTOMIZABLE_OPTIONS_FRAGMENT
        }
      }
      ... on BundleCartItem {
        bundle_options {
          uid
          label
          values {
            uid
            label
          }
        }
      }
      ... on GiftCardCartItem {
        message
        recipient_email
        recipient_name
        sender_email
        sender_name
        amount {
          currency
          value
        }
        is_available
      }
    }

    fragment PRICE_RANGE_FRAGMENT on PriceRange {
      minimum_price {
        regular_price {
          value
          currency
        }
        final_price {
          value
          currency
        }
        discount {
          percent_off
          amount_off
        }
      }
      maximum_price {
        regular_price {
          value
          currency
        }
        final_price {
          value
          currency
        }
        discount {
          percent_off
          amount_off
        }
      }
    }

    fragment CUSTOMIZABLE_OPTIONS_FRAGMENT on SelectedCustomizableOption {
      type
      customizable_option_uid
      label
      is_required
      values {
        label
        value
        price {
          type
          units
          value
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

export const ACO_QUERIES = {
  AttributeMetadata: dedent`query attributeMetadata {
  attributeMetadata {
    filterableInSearch {
      label
      attribute
    }
    sortable {
      label
      attribute
    }
  }
  }`,
  ProductSearch: dedent`query ProductSearch(
  $currentPage: Int = 1
  $pageSize: Int = 20
  $phrase: String = ""
  $sort: [ProductSearchSortInput!] = []
  $filter: [SearchClauseInput!] = []
  $categoryId: String!
) {
  categories(ids: [$categoryId]) {
    name
    urlKey
    urlPath
  }
  productSearch(
    current_page: $currentPage
    page_size: $pageSize
    phrase: $phrase
    sort: $sort
    filter: $filter
  ) {
    facets {
      title
      type
      attribute
      buckets {
        title
        __typename
        ... on RangeBucket {
          count
          from
          to
        }
        ... on ScalarBucket {
          count
          id
        }
        ... on StatsBucket {
          max
          min
        }
      }
    }
    items {
      productView {
        id
        name
        sku
        urlKey
        images(roles: "thumbnail") {
          url
        }
        __typename
        ... on SimpleProductView {
          price {
            ...priceFields
          }
        }
        ... on ComplexProductView {
          priceRange {
            minimum {
              ...priceFields
            }
            maximum {
              ...priceFields
            }
          }
        }
      }
    }
    page_info {
      current_page
      total_pages
      page_size
    }
    total_count
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
  Products: dedent`
    query GET_PRODUCT_DATA($skus: [String]) {
      products(skus: $skus) {
        ...PRODUCT_FRAGMENT
      }
    }
    fragment PRODUCT_FRAGMENT on ProductView {
      __typename
      id
      sku
      name
      shortDescription
      metaDescription
      metaKeyword
      metaTitle
      description
      inStock
      addToCartAllowed
      url
      urlKey
      externalId
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
          roles
          regular {
            amount {
              value
              currency
            }
          }
          final {
            amount {
              value
              currency
            }
          }
        }
      }
      ... on ComplexProductView {
        options {
          ...PRODUCT_OPTION_FRAGMENT
        }
        ...PRICE_RANGE_FRAGMENT
      }
    }
    fragment PRODUCT_OPTION_FRAGMENT on ProductViewOption {
      id
      title
      required
      multi
      values {
        id
        title
        inStock
        __typename
        ... on ProductViewOptionValueProduct {
          title
          quantity
          isDefault
          __typename
          product {
            sku
            shortDescription
            metaDescription
            metaKeyword
            metaTitle
            name
            price {
              final {
                amount {
                  value
                  currency
                }
              }
              regular {
                amount {
                  value
                  currency
                }
              }
              roles
            }
          }
        }
        ... on ProductViewOptionValueSwatch {
          id
          title
          type
          value
          inStock
        }
      }
    }
    fragment PRICE_RANGE_FRAGMENT on ComplexProductView {
      priceRange {
        maximum {
          final {
            amount {
              value
              currency
            }
          }
          regular {
            amount {
              value
              currency
            }
          }
          roles
        }
        minimum {
          final {
            amount {
              value
              currency
            }
          }
          regular {
            amount {
              value
              currency
            }
          }
          roles
        }
      }
    }
  `
};

export const getQueries = (service) => {
  if (service === 'ACO') {
    return ACO_QUERIES;
  }
  return ACCS_QUERIES;
};
