

const QUERIES = {
  Cart: dedent`{
    cart(search: "earrings") {
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
  Products: dedent`{
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
  Stores: dedent`{
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
