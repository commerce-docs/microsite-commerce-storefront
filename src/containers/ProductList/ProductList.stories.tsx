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

import type { Meta, StoryObj } from '@storybook/preact';
import { ProductList, ProductListProps } from '@/recommendations/containers/ProductList';

const meta: Meta<ProductListProps> = {
  title: 'Containers/ProductList',
  component: ProductList,
  tags: ['autodocs'],
  argTypes: {
    currentSku: {
      control: 'text',
      description: 'Current SKU for recommendation context',
      table: {
        type: { summary: 'string' },
      },
    },
    pageType: {
      control: 'text',
      description: 'Page type where recommendations are rendered (e.g., PDP)',
      table: {
        type: { summary: 'string' },
      },
    },
    className: {
      control: 'text',
      description: 'Custom CSS class for styling',
      table: {
        type: { summary: 'string' },
      },
    },
    routeProduct: {
      description: 'Function to build product route URL',
      table: {
        type: { summary: '(product: any) => string' },
      },
      control: false,
    },
    children: {
      control: 'text',
      description: 'Optional children (e.g., heading)',
      table: {
        type: { summary: 'preact component or string' },
      },
    },
  },
};

export default meta;

type Story = StoryObj<ProductListProps>;

export const Default: Story = {
  args: {
    currentSku: 'CTEAPB',
    pageType: 'Product',
    className: 'storybook-product-list',
    routeProduct: (product: any) => `/${product?.urlKey || product?.sku}`,
    children: 'Recommended Products',
  },
  render: (args) => <ProductList {...args} />,
};
