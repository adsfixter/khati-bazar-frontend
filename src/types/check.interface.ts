// import { DeliverySlotData } from "@/src/types/product.interface";

// export type AddressType = "Home" | "Office" | "Others";

// export interface CartItem {
//   productId: string;
//   variantId: string;
//   name: string;
//   image: string;
//   price: number;
//   weight?: string;
//   quantity: number;
// }

// export interface CheckoutOrderPayload {
//   items: CartItem[];
//   subtotal: number;
//   deliveryCharge: number;
//   discount: number;
//   appliedCoupons?: string[];
//   total: number;
// }



// export type DBPaymentMethod = {
//   _id: string;
//   name: string;
//   logo?: string;
//   status: "Active" | "Inactive";
// };

// export type DeliverySlotWithDateType = DeliverySlotData & { 
//   dateType?: string; 
// };

// export type PaymentUIInfo = {
//   icon: React.ReactNode;
//   subLabel: string;
//   comingSoon?: boolean;
// };

// export interface IDecodedToken {
//   id?: string;
//   _id?: string;
//   userId?: string;
// }

// export interface IOrderPayload {
//   products: {
//     productId: string;
//     variantId: string;
//     quantity: number;
//     price: number;
//     name: string;
//     weight?: string;
//     image: string;
//   }[];
//   addressId: string;
//   deliverySlotId: string;
//   deliveryDateType: string;
//   paymentMethodId: string;
//   couponCode?: string;
//   additionalNotes: string;
// }


import { DeliverySlotData } from "@/src/types/product.interface";

export type AddressType = "Home" | "Office" | "Others";

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
  appliedCoupons?: string[];
  total: number;
}

export interface CustomerFormData {
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

export interface IAddressPayload {
  userId: string;
  addressType: string;
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
}

export interface IOrderPayload {
  products: {
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
    name: string;
    weight?: string;
    image: string;
  }[];
  addressId: string;
  deliverySlotId: string;
  deliveryDateType: string;
  paymentMethodId: string;
  couponCode?: string;
  additionalNotes: string;
}

export type DBPaymentMethod = {
  _id: string;
  name: string;
  logo?: string;
  status: "Active" | "Inactive";
};

export type DeliverySlotWithDateType = DeliverySlotData & { 
  dateType?: string; 
};

export type PaymentUIInfo = {
  icon: React.ReactNode;
  subLabel: string;
  comingSoon?: boolean;
};
// export interface IAddress {
//   _id: string;
//   userId: string;
//   fullName: string;
//   phone: string;
//   addressType: AddressType;
//   areaStreet: string;
//   cityDistrict: string;
//   postCode: string;
//   isDefault: boolean;
// }
// আপনার বিদ্যমান টাইপগুলোর সাথে নিচে এই টাইপগুলো যুক্ত করে নিন
export interface IAddress {
  _id: string;
  userId: string;
  addressType: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface IAddressUpdatePayload {
  fullName: string;
  phone: string;
  email?: string;
  areaStreet: string;
  landmark?: string;
  cityDistrict: string;
  thanaUpazila: string;
  postCode?: string;
  additionalNotes?: string;
}

export interface AddressEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressData: IAddress | null;
  onUpdateSuccess: (updatedAddress: IAddress) => void;
  token: string;
}