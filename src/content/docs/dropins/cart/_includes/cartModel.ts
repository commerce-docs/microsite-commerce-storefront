export interface CartModel {
  id: string;
  totalQuantity: number;
  errors?: ItemError[];
  items: Item[];
  miniCartMaxItems: Item[];
  total: {
    includingTax: Price;
    excludingTax: Price;
  };
  discount?: Price;
  subtotal: {
    excludingTax: Price;
    includingTax: Price;
    includingDiscountOnly: Price;
  };
  appliedTaxes: TotalPriceModifier[];
  totalTax?: Price;
  appliedDiscounts: TotalPriceModifier[];
  shipping?: Price;
  isVirtual?: boolean;
  addresses: {
    shipping?: {
      countryCode: string;
      zipCode?: string;
      regionCode?: string;
    }[];
  };
  isGuestCart?: boolean;
  hasOutOfStockItems?: boolean;
  hasFullyOutOfStockItems?: boolean;
  appliedCoupons?: Coupon[];
}

interface TotalPriceModifier {
  amount: Price;
  label: string;
  coupon?: Coupon;
}

interface FixedProductTax {
  amount: Price;
  label: string;
}

export interface Item {
  taxedPrice: Price;
  rowTotal: Price;
  rowTotalIncludingTax: Price;
  itemType: string;
  uid: string;
  url: ItemURL;
  quantity: number;
  sku: string;
  name: string;
  image: ItemImage;
  links?: ItemLinks;
  price: Price;
  total: Price;
  discountedTotal?: Price;
  discount?: Price;
  regularPrice: Price;
  discounted: boolean;
  bundleOptions?: { [key: string]: any };
  selectedOptions?: { [key: string]: any };
  customizableOptions?: { [key: string]: any };
  message?: string;
  recipient?: string;
  recipientEmail?: string;
  sender?: string;
  senderEmail?: string;
  lowInventory?: boolean;
  insufficientQuantity?: boolean;
  onlyXLeftInStock?: number | null;
  outOfStock?: boolean;
  notAvailableMessage?: string;
  stockLevel?: String;
  discountPercentage?: number;
  savingsAmount?: Price;
  productAttributes?: Attribute[];
  fixedProductTaxes?: FixedProductTax[];
}

interface ItemError {
  id: string;
  text: string;
}

interface ItemImage {
  src: string;
  alt: string;
}

export interface Price {
  value: number;
  currency: string;
}

interface ItemURL {
  urlKey: string;
  categories: string[];
}

interface ItemLinks {
  count: number;
  result: string;
}

interface AttributeOption {
  value: string;
  label: string;
}

interface Attribute {
  code: string;
  value?: string;
  selected_options?: AttributeOption[];
}

interface Coupon {
  code: string;
}