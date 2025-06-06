export const ACCS_ENDPOINT =
  'https://edge-graph.adobe.io/api/489c8449-21a0-4155-9f95-7608d36970d6/graphql';

export const ACO_ENDPOINT =
  'https://na1-qa.api.commerce.adobe.com/LnjXjuam6uWmo5d2JLEgbA/graphql';

export const getEndpoint = (service) => {
  if (service === 'ACO') {
    return ACO_ENDPOINT;
  }
  return ACCS_ENDPOINT;
};
