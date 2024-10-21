type CartModel {
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
