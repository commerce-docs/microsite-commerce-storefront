export const ACCS_QUERY_HEADERS = {
  "Magento-Customer-Group": "b6589fc6ab0dc82cf12099d1c2d40ab994e8410c",
  "Magento-Environment-Id": "0a9ae65d-c1a5-49f6-af64-1ec1ff47ab52",
  "Magento-Store-Code": "main_website_store",
  "Magento-Store-View-Code": "default",
  "Magento-Website-Code": "base",
  "Content-Type": "application/json"
}

export const ACO_QUERY_HEADERS = {
  "Content-Type": "application/json",
  "AC-Environment-Id": "LnjXjuam6uWmo5d2JLEgbA",
  "AC-Scope-Locale": "tx"
}

export const getQueryHeaders = (service) => {
  if (service === 'ACO') {
    return ACO_QUERY_HEADERS;
  }
  return ACCS_QUERY_HEADERS;
}