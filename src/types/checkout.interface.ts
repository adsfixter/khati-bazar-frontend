export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  weight?: string;
  quantity: number;
}

export interface CheckoutOrderPayload {
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  appliedCoupons: string[];
  total: number;
}

export interface CustomerFormData {
  addressType: "Home" | "Office" | "Family" | "Others"; // 💡 নতুন
  fullName: string;
  phoneNumber: string;
  email: string;
  area: string;
  landmark: string;
  city: string;
  thana: string;
  postCode: string;
  additionalNotes: string;
  saveAsDefault: boolean;
}
// ---------- Cart / Order related types ----------
export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  weight?: string;
  quantity: number;
}

export interface CheckoutOrderPayload {
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  appliedCoupons: string[];
  total: number;
}

// ---------- Address related types ----------
export type AddressType = "Home" | "Office" | "Others";

export interface IAddress {
  _id: string;
  userId: string;
  addressType: AddressType;
  fullName: string;
  phone: string;
  email?: string;
  areaStreet: string;
  landmark?: string;
  cityDistrict: string;
  thanaUpazila: string;
  postCode?: string;
  additionalNotes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  weight?: string;
  quantity: number;
}
export interface AddressApiResponse {
  success: boolean;
  data: IAddress[];
}

// ---------- Payment ----------
export type PaymentMethod = "cod" | "bkash" | "nagad" | "card" | "ssl";

// ---------- Delivery slot selection (re-export friendly shape) ----------
export interface SelectedDeliverySlot {
  _id: string;
  slotName: string;
  startTime: string;
  endTime: string;
}

// ---------- Final payload sent on Place Order ----------
export interface PlaceOrderPayload {
  selectedAddress: IAddress | null;
  deliverySlot: SelectedDeliverySlot | null;
  paymentMethod: PaymentMethod;
  cart: CheckoutOrderPayload | null;
}


