export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  weight?: string;
  quantity: number;
}

export interface ICoupon {
  _id: string;
  code: string;
  discountPercentage: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  expiryDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDecodedToken {
  id?: string;
  _id?: string;
  userId?: string;
}

export interface ICheckoutPayload {
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  appliedCoupons: string[];
  total: number;
}