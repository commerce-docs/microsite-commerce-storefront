type OrderDataModel = {
  id: string;
  orderStatusChangeDate?: string;
  number: string;
  email?: string;
  token?: string;
  status: string;
  isVirtual: boolean;
  totalQuantity: number;
  shippingMethod?: string;
  carrier?: string;
  coupons: {
    code: string;
  }[];
  payments: {
    code: string;
    name: string;
  }[];
  shipping?: { code: string; amount: number; currency: string };
  shipments: ShipmentsModel[];
  items: OrderItemModel[];
  grandTotal: MoneyProps;
  subtotal: MoneyProps;
  totalTax: MoneyProps;
  shippingAddress: OrderAddressModel;
  billingAddress: OrderAddressModel;
  availableActions: AvailableActionsProps[];
};
