/********************************************************************
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2025 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 *******************************************************************/

import { FunctionComponent, VNode, h } from 'preact';
import { HTMLAttributes } from 'preact/compat';
import { useCallback, useEffect, useState } from 'preact/hooks';

import { classes, VComponent } from '@adobe-commerce/elsie/lib';
import { Skeleton, SkeletonRow } from '@adobe-commerce/elsie/components';
import { useText } from 'preact-i18n';
import { fetchGraphQl } from '@adobe-commerce/fetch-graphql';

import { ProductItemCard } from '@/recommendations/components/ProductItemCard/ProductItemCard';
import './ProductList.css';

export interface ProductListProps extends HTMLAttributes<HTMLDivElement> {
  currentSku: string;
  pageType: string;
  routeProduct?: (product: any) => string;
}

export const ProductList: FunctionComponent<ProductListProps> = ({
  className,
  currentSku,
  pageType,
  routeProduct,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const translations = useText({
    headingText: 'recommended.heading',
    productType: 'recommended.productType',
    addToCartText: 'button.addToCart',
    optionsText: 'button.selectOptions',
  });

  const GET_RECOMMENDATIONS_QUERY = `
    query GetRecommendations(
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
            images {
              url
            }
            urlKey
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
    }
  `;

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchGraphQl(GET_RECOMMENDATIONS_QUERY, {
          variables: { currentSku, pageType },
        });

        if (result.data?.recommendations?.results) {
          setRecommendations(result.data.recommendations.results);
        } else {
          throw new Error('Invalid recommendation data received.');
        }
      } catch (err: any) {
        setError(err.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentSku, pageType]);

  const ProductsSection: VNode | null = recommendations?.length ? (
    <>
      <h1>{translations.headingText}</h1>
      {recommendations.map(({ unitId, unitName, productsView }) => (
        <div key={unitId} className="recommendation-item">
          <h2>{unitName}</h2>
          <div className="product-list">
            {productsView.map((product) => {
              const { sku, name, urlKey, images, __typename } = product;
              const imageSrc = images?.[0]?.url ?? '';
              const productUrl = routeProduct?.(product) ?? `/${urlKey}`;
              const isSimple = __typename === translations.productType;

              return (
                <ProductItemCard
                  key={sku}
                  image={<img src={imageSrc} alt={sku} />}
                  productName={<a href={productUrl}>{name}</a>}
                  actionButton={
                    isSimple ? (
                      <button>{translations.addToCartText}</button>
                    ) : (
                      <a href={productUrl}>{translations.optionsText}</a>
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      ))}
    </>
  ) : null;

  const ErrorMessage: VNode | null = error ? (
    <div>Error: {error}</div>
  ) : null;

  return (
    <div
      {...props}
      className={classes(['recommendations-product-list', className])}
    >
      {loading ? (
        <ProductListSkeleton />
      ) : ErrorMessage || ProductsSection}
    </div>
  );
};

const ProductListSkeleton: FunctionComponent = () => {
  return (
    <Skeleton
      data-testid="product-list-skeleton"
      className="product-list-skeleton"
      rowGap="medium"
    >
      {[...Array(2)].map((_, i) => (
        <SkeletonRow
          key={i}
          variant="row"
          size="large"
          fullWidth={true}
          lines={2}
          multilineGap="small"
        />
      ))}
    </Skeleton>
  );
};
