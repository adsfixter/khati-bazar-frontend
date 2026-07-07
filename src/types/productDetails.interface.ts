// src/types/productDetails.interface.ts

export interface ICartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  weight: string;
  quantity: number;
}

export interface IReview {
  _id: string;
  rating: number;
  comment: string;
  userId?: { 
    name?: string; 
    avatar?: string; 
  };
  createdAt: string;
}

export type TabKey = "Description" | "Origin" | "Storage & Shipping Info" | "Reviews";