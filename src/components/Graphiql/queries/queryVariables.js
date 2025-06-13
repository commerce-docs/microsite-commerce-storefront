export const ACCS_VARIABLES = {
  Cart: JSON.stringify({ cartId: 'xEd9DiX2zdJV7yo1K7AUb1q9CYw4jijj' }, null, 2),
  Products: JSON.stringify({ sku: 'ADB256' }, null, 2),
  Recommendations: JSON.stringify(
    {
      pageType: 'Product',
      currentSku: 'ADB256',
      userViewHistory: [
        { date: '2025-03-05T18:19:52.730Z', sku: 'ADB256' },
        { date: '2025-03-05T18:23:22.712Z', sku: 'ADB385' },
        { date: '2025-03-06T15:05:31.836Z', sku: 'ADB386' },
      ],
      userPurchaseHistory: [],
    },
    null,
    2
  ),
  StoreConfig: JSON.stringify({}, null, 2),
  Wishlist: JSON.stringify({ id: '5841', currentPage: 1 }, null, 2),
  Default: JSON.stringify({}, null, 2),
};

export const ACO_VARIABLES = {
  Default: JSON.stringify({}, null, 2),
  ProductSearch: JSON.stringify({
    pageSize: 10,
    currentPage: 1,
    sort: [
      {
        attribute: "position",
        direction: "ASC"
      }
    ],
    phrase: "",
    filter: [
      {
        attribute: "inStock",
        eq: "true"
      },
      {
        attribute: "categoryPath",
        eq: "apparel"
      }
    ],
    categoryId: "39"
  }, null, 2),
  Products: JSON.stringify({ skus: ["ADB256"] }, null, 2),
};

export const getVariables = (service) => {
  if (service === 'ACO') {
    return ACO_VARIABLES;
  }
  return ACCS_VARIABLES;
};
