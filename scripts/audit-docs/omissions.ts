/********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 * Copyright 2026 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 *******************************************************************/

/**
 * Props that are present in the TypeScript type but deliberately not documented
 * because the container does not expose them as a public API surface.
 * Key format: "dropin-key/ContainerName/propName"
 */
export const KNOWN_PROP_OMISSIONS = new Set([
  'storefront-order/CustomerDetails/withHeader',
  'storefront-account/AddressForm/handleRenderForm',
]);

/**
 * Functions that are re-export aliases of another documented function.
 * The registry extracts both the canonical name and the alias; the alias is
 * documented inline within the canonical function's page, so flagging it as
 * missing would be a false positive.
 * Key format: "dropin-key/functionName"
 */
export const KNOWN_FUNCTION_ALIASES = new Set([
  'storefront-checkout/setShippingMethodsOnCart', // alias of setShippingMethods
]);

/**
 * Functions and events that exist in the drop-in source code but are not yet
 * picked up by the registry extractor. The docs are correct; these entries
 * should not be flagged as phantom until the extractor is fixed.
 * Key format: "dropin-key/name"
 */
export const KNOWN_EXTRACTOR_GAPS_FUNCTIONS = new Set(['storefront-company-management/initialize']);

export const KNOWN_EXTRACTOR_GAPS_EVENTS = new Set<string>();

export const KNOWN_EXTRACTOR_GAPS_SLOTS = new Set<string>();
