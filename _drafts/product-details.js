import { bridge } from '../../scripts/bridge/bridge.js';
import { events } from '@dropins/tools/event-bus.js';
import { initializers } from '@dropins/tools/initializer.js';
import * as productApi from '@dropins/storefront-pdp/api.js';
import { ProductDetails } from '@dropins/storefront-pdp/containers/ProductDetails.js';
import { render as productRenderer } from '@dropins/storefront-pdp/render.js';
import { getConfigValue, getStoreCode } from '../../scripts/configs.js';
import { getSkuFromUrl, getUrlKeyFromUrl, getCurrentLocale, performMonolithGraphQLQuery } from '../../scripts/commerce.js';
import {
    DESCRIPTION_ATTRIBUTES_IDS, SUSTAINABILITY_ATTRIBUTES_IDS, DIRECTIONS_ATTRIBUTES_IDS, FAQS_ATTRIBUTES_IDS,
    SIZE_GUIDE_ATTRIBUTES_IDS, INGREDIENTS_ATTRIBUTE_IDS,
    NUTRITION_ATTRIBUTE_IDS
} from './attributes-mapper.js';
import { fetchPlaceholders, sampleRUM } from '../../scripts/aem.js';

// Slots
import Title from './slots/Title.js';
import Options from './slots/Options.js';
import RegularPrice from './slots/RegularPrice.js';
import SpecialPrice from './slots/SpecialPrice.js';
import Actions from './slots/Actions.js';
import Quantity from './slots/Quantity.js';
import Content from './slots/Content.js';
import GalleryContent from './slots/GalleryContent.js';
import InfoContent from './slots/InfoContent.js';
import { cartApi } from "../../scripts/minicart/api.js";

const productSku = getSkuFromUrl();
const currentStoreCode = window.location.pathname.split('/')[1];
const placeholders = await fetchPlaceholders(currentStoreCode);
const locale = getCurrentLocale();

const imageRoles = ['main', 'image_2', 'image_3', 'image_4', 'image_5', 'image_6', 'image_7', 'image_8', 'image_9'];

const VARIANT_QUERY = `query VariantQuery($urlKey: String!) {
    products(
      filter: { url_key: { eq: $urlKey } }
      pageSize: 20
      currentPage: 1
    ) {
      items {
        ... on ConfigurableProduct {
          variants {
            attributes {
              uid
            }
            product {
              sku
              ean
              special_to_date
              stock_status
              price_range {
                minimum_price {
                  final_price {
                    value
                    currency
                  }
                  regular_price {
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  }`;

export default async function decorate(block) {
    console.log('decorating');
    // Define configuration
    const commerceEndpoint = await getConfigValue('commerce-endpoint');

    productApi.setEndpoint(commerceEndpoint);

    const graphqlHeaders = {
        'Content-Type': 'application/json',
        'Magento-Environment-Id': await getConfigValue('commerce-environment-id'),
        'Magento-Website-Code': await getConfigValue('commerce-website-code'),
        'Magento-Store-View-Code': await getConfigValue('commerce-store-view-code'),
        'Magento-Store-Code': await getConfigValue('commerce-store-code'),
        'Magento-Customer-Group': await getConfigValue('commerce-customer-group'),
        'x-api-key': await getConfigValue('commerce-x-api-key'),
    };

    const groupId = bridge.getCustomerGroup();
    if (groupId !== 0) {
        graphqlHeaders['Magento-Customer-Group'] = groupId || '0';
    }

    productApi.setFetchGraphQlHeaders(graphqlHeaders);

    if (!productSku) {
        await errorGettingProduct();
    }

    const product = await window.document.getProduct;
    const urlKeyFromUrl = getUrlKeyFromUrl();
    const storeCode = getStoreCode();
    const storePath = storeCode ? `${storeCode}/` : '';
    if(product && product.urlKey !== urlKeyFromUrl){
        window.location.href = `/${storePath}products/${product.urlKey}/${product.sku.toLowerCase()}${window.location.search}`;
    }

    // TODO - remove this once the API is updated to return the correct data
    // Currently, there is an edge case where a configurable product shows up as in stock,
    // but all the simple products are out of stock. This is a temporary fix to handle that edge case.
    // if all the option values have inStock false, then make the whole product out of stock
    if (product?.options?.every(option => option?.values?.every(value => !value.inStock))) {
        product.inStock = false;
    }
    // END TODO

    if (!product) {
        await errorGettingProduct();
    }

    // Create Notification Bar
    const productDetailsWrapper = document.querySelector('.product-details-wrapper');
    const notificationBar = document.createElement('div');
    notificationBar.classList.add('notification-bar', 'notification-bar__hidden');
    notificationBar.tabIndex = -1;
    if (product) {
        productDetailsWrapper.insertAdjacentElement('afterbegin', notificationBar);
    }

    // Get labels from placeholders sheet
    const languagePack = {
        PDP: {
            Product: {
                AddToCart: { label: placeholders.pdpAddToCart },
                OutOfStock: { label: placeholders.pdpOos },
                Reviews: { label: placeholders.pdpReviews },
                WriteReview: { label: placeholders.pdpWritereview },
                CustomerReviews: { label: placeholders.pdpCustomerreviews },
                Description: { label: placeholders.pdpDescription },
                SizeGuide: { label: placeholders.pdpSizeguide },
                Sustainability: { label: placeholders.pdpSustainability },
                Directions: { label: placeholders.pdpDirections },
                Ingredients: { label: placeholders.pdpIngredients },
                Nutrition: { label: placeholders.pdpNutrition },
                Faqs: { label: placeholders.pdpFaqs },
                HowItsMade: { label: placeholders.pdpHowItsMade },
                ProductTitleSticker : {label: placeholders.pdpProductTitleSticker},
                Purpose: { label: placeholders.pdpPurpose },
                Benefits: { label: placeholders.pdpBenefits },
                RelatedProducts: { label: placeholders.pdpRelatedProducts },
                SuitableFor: { label: placeholders.pdpSuitableFor },
                Storage: { label: placeholders.pdpStorage },
                AdvisoryInformation: { label: placeholders.pdpAdvisoryInformation },
                NutritionIntro: { label: placeholders.pdpNutritionIntro },
                Allergens: { label: placeholders.pdpAllergens },
                ActiveIngredients: { label: placeholders.pdpActiveIngredients },
                Serving: { label: placeholders.pdpServing },
            },
            Price: {
                Discount: { label: placeholders.pdpPriceDiscount },
                Was: { label: placeholders.pdpPriceWas },
            },
        },
    };

    // Language Definitions – override default
    const langDefinitions = { default: languagePack };

    const models = {
        ProductDetails: {
            initialData: { ...product, optionsUIDs: getDefaultOptions(product) },

            transform: (data) => {
                if (data.hasOwnProperty('images')) {
                    data.images = data.images.filter(img => img.roles.some(role => imageRoles.includes(role)));
                }

                data?.options?.forEach(option => {
                    // alphabetically sort bp_flavour
                    if (option.id === 'bp_flavour') {
                        option.items.sort((a, b) => a.label < b.label ? -1 : 1);
                    }

                    // bp_size displayed as text swatch
                    if (option.id === 'bp_size') {
                        option.type = 'text';
                    }

                    // add " - out of stock" label on the selector
                    if (option.id === 'bp_flavour' || option.id === 'bp_qty') {
                        option.items?.forEach(item => {
                            // Since we require that flavours be selectable even if out of stock,
                            // we manually set the inStock property to true
                            // Leaving it as is will cause the item to be disabled (not clickable)
                            item.label = item.inStock ? item.label : `${item.label} - ${languagePack?.PDP?.Product?.OutOfStock?.label?.toLowerCase()}`;
                            item.inStock = true;
                        });
                    }
                });

                return data;
            },

            fallbackData: (parentProduct, refinedData) => {
                const refinedDataRoles = new Set(refinedData.images.flatMap(img => img.roles));

                refinedData.images = refinedData.images.filter(img => img.roles.some(role => imageRoles.includes(role)));

                imageRoles.forEach(role => {
                    if (!refinedDataRoles.has(role)) {
                        const parentImage = parentProduct.images.find(img => img.roles.includes(role));
                        if (parentImage) {
                            refinedData.images.push(parentImage);
                            refinedDataRoles.add(role);
                        }
                    }
                });

                if (refinedData.images.length === 0) {
                    // if no images are found, add a placeholder image
                    refinedData.images.push({
                        url: '/images/Bulk-no-image-logo-small.png',
                        roles: ['main']
                    });
                }

                refinedData.images.sort((a, b) => {
                    const roleA = imageRoles.indexOf(a.roles[0]);
                    const roleB = imageRoles.indexOf(b.roles[0]);
                    return roleA - roleB;
                });

                // blocks to be used from parent product (configurable product)
                const fallbackAttributes = [
                    ...DESCRIPTION_ATTRIBUTES_IDS,
                    ...SUSTAINABILITY_ATTRIBUTES_IDS,
                    ...DIRECTIONS_ATTRIBUTES_IDS,
                    ...FAQS_ATTRIBUTES_IDS,
                    ...SIZE_GUIDE_ATTRIBUTES_IDS
                ];

                fallbackAttributes.forEach(attribute => {
                    setAttribute(parentProduct, refinedData, attribute);
                });

                // fallback to configurable product ingredients block if the simple (refined) product does not have any data
                if (isEmptyAttributeBlock(refinedData, INGREDIENTS_ATTRIBUTE_IDS)) {
                    INGREDIENTS_ATTRIBUTE_IDS.forEach(attribute => {
                        setAttribute(parentProduct, refinedData, attribute);
                    });
                }

                // fallback to configurable product nutrition block if the simple (refined) product does not have any data
                if (isEmptyAttributeBlock(refinedData, NUTRITION_ATTRIBUTE_IDS)) {
                    NUTRITION_ATTRIBUTE_IDS.forEach(attribute => {
                        setAttribute(parentProduct, refinedData, attribute);
                    });
                }

                // fallback to configurable sale_text
                // only the sale_text at the configurable level is taken into account
                const defaultSaleText = parentProduct.attributes.find(attr => attr.name === 'sale_text');
                const validDefaultSaleText = defaultSaleText && defaultSaleText.value && defaultSaleText.value.trim() !== '';
                const index = refinedData.attributes.findIndex(attr => attr.id === 'sale_text');

                if (validDefaultSaleText) {
                    const saleTextAttr = {
                        id: 'sale_text',
                        label: defaultSaleText.label,
                        roles: defaultSaleText.roles,
                        value: defaultSaleText.value
                    };
                    if (index !== -1) {
                        refinedData.attributes[index] = saleTextAttr;
                    } else {
                        refinedData.attributes.push(saleTextAttr);
                    }
                }

                // fallback to configurable sale_text_start
                const defaultSaleStart = parentProduct.attributes.find(attr => attr.name === 'sale_text_start');
                const saleStartIndex = refinedData.attributes.findIndex(attr => attr.id === 'sale_text_start');
                if (defaultSaleStart) {
                    const saleStartAttr = {
                        id: 'sale_text_start',
                        label: defaultSaleStart.label,
                        roles: defaultSaleStart.roles,
                        value: defaultSaleStart.value
                    };

                    if (saleStartIndex !== -1) {
                        refinedData.attributes[saleStartIndex] = saleStartAttr;
                    } else {
                        refinedData.attributes.push(saleStartAttr);
                    }
                } else {
                    if (saleStartIndex !== -1) {
                        refinedData.attributes.splice(saleStartIndex, 1);
                    }
                }

                // fallback to configurable sale_text_end
                const defaultSaleEnd = parentProduct.attributes.find(attr => attr.name === 'sale_text_end');
                const saleEndIndex = refinedData.attributes.findIndex(attr => attr.id === 'sale_text_end');
                if (defaultSaleEnd) {
                    const saleEndAttr = {
                        id: 'sale_text_end',
                        label: defaultSaleEnd.label,
                        roles: defaultSaleEnd.roles,
                        value: defaultSaleEnd.value
                    };

                    if (saleEndIndex !== -1) {
                        refinedData.attributes[saleEndIndex] = saleEndAttr;
                    } else {
                        refinedData.attributes.push(saleEndAttr);
                    }

                } else {
                    if (saleEndIndex !== -1) {
                        refinedData.attributes.splice(saleEndIndex, 1);
                    }
                }

                setMetaTags(refinedData);

                return refinedData;
            }

        }
    };

    // Define Carousel Configuration
    const carouselConfig = {
        controls: 'thumbnailsColumn',
        arrowsOnMainImage: true,
        mobile: true,
        loopable: false,
        peak: {
            mobile: true,
            desktop: false
        },
        gap: 'small',
        imageParams: {
            width: 1080,
            "resize-filter": "bicubic"
        },
        thumbnailParams: {
            width: 256,
            height: 256,
            "resize-filter": "bicubic"
        }
    };

    // Register Initializers
    initializers.register(productApi.initialize, {
        langDefinitions,
        defaultLocale: locale,
        models
    });

    const shoppingCartContext = await cartApi.getShoppingCartContext();

    // Wait for LCP
    events.on('eds/lcp', () => {
        // observe the block for RUM
        sampleRUM.observe(block.querySelectorAll('img'));
        if (!window.matchMedia("(min-width: 1025px)").matches) {
            // block does not intersect on mobile because of relative positioning
            // observe sub element to still trigger the viewblock checkpoint
            sampleRUM.observe(block.querySelectorAll('.pdp-carousel'));
        }

        if (!product) {
            return;
        }

        // Set Data Collection Context
        const productContext = {
            productId: parseInt(product.externalId, 10) || 0,
            topLevelSku: product.sku ?? null,
            ...product
        };

        window.adobeDataLayer.push((dl) => {
            dl.push({ productContext: productContext});
            dl.push({ shoppingCartContext: shoppingCartContext});
            dl.push({ event: 'product-page-view', eventInfo: { ...dl.getState() } });
        });
    }, { eager: true });

    events.on('eds/lazy', () => {
        if (!product) {
            return;
        }

        // Push Google Tag Manager Data (GTM)
        const price = product?.priceRange ? product.priceRange.minimum.final.amount.value : product?.price.final.amount;
        const currency = product?.priceRange ? product.priceRange.minimum.final.amount.currency : product?.price.final.currency;

        window.dataLayer.push({
            event: 'view_item',
            ecommerce: {
                currency: currency,
                value: price,
                items: [{
                    item_name: product.name,
                    item_id: product.sku,
                    price: price,
                    item_brand: 'Bulk',
                    quantity: 1
                }]
            }
        });
    }, { eager: true });

    // Render the PDP dropin
    return new Promise((resolve) => {
        setTimeout(async () => {
            try {
                await productRenderer.render(ProductDetails, {
                    sku: product.sku,
                    hideSku: true,
                    hideQuantity: false,
                    hideShortDescription: true,
                    hideDescription: true,
                    hideAttributes: true,
                    hideURLParams: true,
                    hideSelectedOptionValue: true,
                    slots: {
                        Title: (ctx) => Title(ctx, block),
                        RegularPrice: (ctx) => RegularPrice(ctx, block),
                        SpecialPrice: (ctx) => SpecialPrice(ctx, block),
                        GalleryContent: (ctx) => GalleryContent(ctx, block, carouselConfig, product),
                        Options: (ctx) => Options(ctx, block),
                        Actions: (ctx) => Actions(ctx, block),
                        Quantity: (ctx) => Quantity(ctx, block),
                        InfoContent: (ctx) => InfoContent(ctx, block),
                        Content: (ctx) => Content(ctx, block, product),
                    },
                    carousel: carouselConfig,
                    optionsConfig: {
                        anchorOptions: ['bp_flavour']
                    }
                })(block);
            } catch (e) {
                await errorGettingProduct();
            } finally {
                resolve();
            }
        }, 0);
    });

}

// Initialize the accordion section on page load
/**
 * Utility Methods –––––––––––––––
 */
// Error Handling (404)
async function errorGettingProduct(code = 404) {
    const htmlText = await fetch(`/${code}.html`).then((response) => {
        if (response.ok) {
            return response.text();
        }
        throw new Error(`Error getting ${code} page`);
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Replace body and head content
    document.body.innerHTML = doc.body.innerHTML;
    document.head.innerHTML = doc.head.innerHTML;

    // Add noindex, nofollow meta tag to the head if not already present
    if (!document.head.querySelector('meta[name="robots"]')) {
        const metaTag = document.createElement('meta');
        metaTag.name = 'robots';
        metaTag.content = 'noindex, nofollow';
        document.head.appendChild(metaTag);
    }

    // Re-execute scripts from the fetched document
    Array.from(doc.head.querySelectorAll('script'))
        .filter(c => c.textContent && c.type !== 'importmap')
        .forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(({ name, value }) => {
                newScript.setAttribute(name, value);
            });
            newScript.textContent = oldScript.textContent;
            document.head.appendChild(newScript);
        });
}

export function setMetaTags(product) {
    if (!product) {
        return;
    }

    let title = product.metaTitle ?? '';
    if (!title) {
        title = product.name;
    }

    const beforeElement = document.head.querySelector('link[rel="canonical"]');

    document.title = title;

    // name tags
    createMetaTag('title', title, 'name', beforeElement);
    createMetaTag('description', product.metaDescription, 'name', beforeElement);
    createMetaTag('keywords', product.metaKeyword, 'name', beforeElement);

    // Open Graph tags
    createMetaTag('og:type', 'og:product', 'property', beforeElement);
    createMetaTag('og:title', title, 'property', beforeElement);
    createMetaTag('og:description', product.metaDescription, 'property', beforeElement);

    createMetaTag('og:url', window.location.href, 'property', beforeElement);
    const mainImage = product?.images?.filter(image => image.roles.includes('main'))[0];
    const metaImage = mainImage?.url || product?.images[0]?.url;
    createMetaTag('og:image', metaImage, 'property', beforeElement);
    createMetaTag('og:image:secure_url', metaImage, 'property', beforeElement);
    createMetaTag('og:product:price:amount', product.prices?.final?.amount, 'property', beforeElement);
    createMetaTag('og:product:price:currency', product.prices?.final?.currency, 'property', beforeElement);

    // twitter tags
    createMetaTag('twitter:card', product.metaDescription, 'name', beforeElement);
    createMetaTag('twitter:title', title, 'name', beforeElement);
    createMetaTag('twitter:image', metaImage, 'name', beforeElement);
}

export function setProductRichSnippet(product, yotpoApiKey) {
    setBaseJson(product);
    if (product['__typename'] !== 'SimpleProductView') {
        setOffersJson(product);
    }
    setRatingsJson(product, yotpoApiKey);
}

function setBaseJson(product) {
    const { sku, name, metaDescription, images, attributes } = product;
    const mainImage = images.filter(image => image.roles.includes('main'))[0];
    const gtin = attributes.filter(attr => attr?.name === 'ean')[0];

    let data = {
        '@context': 'http://schema.org',
        '@type': 'Product',
        sku,
        name,
        'image': mainImage?.url || images[0]?.url,
        'description': metaDescription,
        'gtin': gtin && gtin.value !== 'Does Not Apply' ? gtin.value : '',
        '@id': window.location.origin + window.location.pathname,
    }

    //if the product is simple, set the price as well
    if (product.__typename === 'SimpleProductView') {
        const specialDateTo = attributes.filter(attr => attr?.name === 'special_to_date')[0];
        data.offers = [
            {
                '@type': 'Offer',
                price: product?.price?.final?.amount?.value,
                priceCurrency: product?.price?.final?.amount?.currency,
                availability: product?.inStock ? 'http://schema.org/InStock' : 'http://schema.org/OutOfStock',
                url: window.location.origin + window.location.pathname,
                name,
                sku,
                priceValidUntil: getPriceValidUntil(
                    product?.price?.final?.amount?.value,
                    specialDateTo ? specialDateTo.value : '',
                    product?.price?.regular?.amount?.value,
                ),
                priceSpecification: getPriceSpecification(
                    product?.price?.final?.amount?.value,
                    product?.price?.regular?.amount?.value,
                    product?.price?.final?.amount?.currency
                ),
            }
        ]
    }
    setHtmlProductJsonLd(data);
}

function setOffersJson(product) {
    performMonolithGraphQLQuery(VARIANT_QUERY, { urlKey: product.urlKey }).then((response) => {
        const variants = response?.data?.products?.items[0]?.variants;
        const data = variants?.map(variant => {
            return {
                '@type': 'Offer',
                price: variant.product.price_range.minimum_price.final_price.value,
                priceCurrency: variant.product.price_range.minimum_price.final_price.currency,
                availability: variant.product.stock_status === "IN_STOCK" ? 'http://schema.org/InStock' : 'http://schema.org/OutOfStock',
                sku: variant.product.sku,
                gtin: variant.product?.ean ?? '',
                priceValidUntil: getPriceValidUntil(
                    variant.product.price_range.minimum_price.final_price.value,
                    variant.product.special_to_date,
                    variant.product.price_range.minimum_price.regular_price.value
                ),
                priceSpecification: getPriceSpecification(
                    variant.product.price_range.minimum_price.final_price.value,
                    variant.product.price_range.minimum_price.regular_price.value,
                    variant.product.price_range.minimum_price.final_price.currency
                ),
                url: getVariantUrl(product, variant)
            }
        });
        setHtmlProductJsonLd({offers: data});
    });
}

function setRatingsJson(product, yotpoApiKey) {
    try {
        fetch(`https://api.yotpo.com/products/${yotpoApiKey}/${product.externalId}/bottomline`).then(e => e.ok ? e.json() : {}).then(body => {
            const { average_score, total_reviews } = body?.response?.bottomline || {};
            setHtmlProductJsonLd({
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: average_score || 0,
                    reviewCount: total_reviews || 0,
                }
            });

            events.emit('eds/pdp/ratings', {average: average_score, total: total_reviews});
        });
    } catch (error) {
        console.log(`Error fetching product ratings: ${error}`);
        setHtmlProductJsonLd({
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: 0,
                reviewCount: 0,
            }
        });

        events.emit('eds/pdp/ratings', {average: 0, total: 0});
    }
}

function getVariantUrl(product, variant) {
    const mappedOptions = variant.attributes.map(attr => {
        const decodedUid = atob(attr.uid);
        let option = decodedUid?.replace('configurable/', '');
        option = option?.replace('/', '-');
        return option;
    });

    return window.location.origin + window.location.pathname+'?o=' + btoa(mappedOptions.join(','));
}

function getPriceSpecification(specialPrice,regularPrice,priceCurrency){
    if (specialPrice){
        return [
            {
                '@type': 'UnitPriceSpecification',
                priceType: 'https://schema.org/ListPrice',
                price: regularPrice,
                priceCurrency: priceCurrency
            },
        ];
    }
    else return '';
}
function getPriceValidUntil(specialPrice, specialToDate, regularPrice) {
    let date = '';
    if (specialPrice) {
        if (specialPrice < regularPrice) {
            if (specialToDate) {
                let today = new Date();
                let specialPriceToDate = new Date(specialToDate);
                if (specialPriceToDate >= today.setHours(0, 0, 0, 0)) {
                    date = specialToDate.substring(0, specialToDate.indexOf(' '));
                }
            }
        }
    }
    return date;
}

function setHtmlProductJsonLd(data) {
    const existingScript = document.head.querySelector(`script[data-name="product"]`);
    const existingData = existingScript?.innerHTML;
    let scriptData;

    if (existingData) {
        scriptData = {
            ...JSON.parse(existingData),
            ...data
        };
    } else {
        scriptData = data;
    }

    if (existingScript) {
        existingScript.innerHTML = JSON.stringify(scriptData);
        return;
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';

    script.innerHTML = JSON.stringify(scriptData);
    script.dataset.name = 'product';
    document.head.appendChild(script);
}

function createMetaTag(property, content, type, beforeElement = null) {
    if (!property || !type) {
        return;
    }
    let meta = document.head.querySelector(`meta[${type}="${property}"]`);
    if (meta) {
        meta.setAttribute(type, property);
        meta.setAttribute('content', content);
        return;
    }
    meta = document.createElement('meta');
    meta.setAttribute(type, property);
    meta.setAttribute('content', content);
    if (beforeElement) {
        beforeElement.parentNode.insertBefore(meta, beforeElement.nextSibling);
    } else {
        document.head.appendChild(meta);
    }
}

// Default Options
function getDefaultOptions(data) {
    // if 'o' parameter is present, decode the default options
    const directOptionsHash = new URL(window.location).searchParams.get('o');
    if (directOptionsHash) {
        try {
            // first, base64 decode the options
            const decodedOptions = atob(directOptionsHash);
            // the string should now look something like this: option1-value1,option2-value2
            // split the string by comma and return the array
            const optionValuesPairs = decodedOptions?.split(',');

            if (optionValuesPairs?.length) {
                return optionValuesPairs.map(optionValue => {
                    const [option, value] = optionValue.split('-');

                    if (option && value) {
                        return btoa(`configurable/${option}/${value}`);
                    }
                });
            }
        } catch (e) {
            // let the regular default options flow
        }
    }
    const defaultOptions = data?.attributes?.filter((attr) => attr.name === 'default_simple_sku_options').map((attr) => attr.value);

    if (defaultOptions?.length) {
        //check if the data is also an array
        if (defaultOptions[0] && Array.isArray(defaultOptions[0])) {
            return defaultOptions[0];
        }
        return defaultOptions;
    }

    return data?.options?.map(option => {
        // first sort the picker options
        if (option.id === 'bp_flavour') {
            option.values?.sort((a, b) => a.title < b.title ? -1 : 1);
        }
        return option;
    }).map(option => option?.values?.find(value => value?.inStock)?.id)
        .filter(Boolean); // this removes any undefined or null values
}

// Attributes Fallback Functions
function setAttribute(parentData, refinedData, attributeId) {
    const defaultValue = parentData.attributes.find((attribute) => attribute.name === attributeId);
    if (!defaultValue) return;
    if (isAttributeEmpty(refinedData, attributeId)) {
        refinedData.attributes.push({
            id: attributeId,
            label: defaultValue?.label,
            value: defaultValue?.value
        });
    }
}

function isAttributeEmpty(data, attributeId) {
    const attribute = data.attributes.find((attr) => attr.id === attributeId);
    return !attribute?.value;
}

function isEmptyAttributeBlock(data, ...attributeIds) {
    return attributeIds.every(attributeId => isAttributeEmpty(data, attributeId));
}
