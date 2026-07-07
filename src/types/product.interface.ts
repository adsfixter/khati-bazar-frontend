export interface IWeight {
  _id: string;
value?: string; 
  unit?: string;
}

export interface ICategoryPopulated {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  status: 'Active' | 'Inactive';
  subCategories?: {
    _id: string;
    title: string;
    status: 'Active' | 'Inactive';
  }[];
}

export interface IProductVariant {
  _id: string;
  weightId: string | IWeight;
  originalPrice: number;
  offerPrice?: number;
  stock: number;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  categoryId: string | ICategoryPopulated; 
  subCategoryId?: string;
  brandId?: string;
  images: string[];
  description: string;
  productType: 'Local' | 'International';
  variants: IProductVariant[];
  totalStock: number;
  soldCount: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}
// src/types/product.interface.ts ফাইলটি ওপেন করো এবং weightId এর টাইপটি নিশ্চিত করো:


export interface IVariant {
  weightId: IWeight; // অথবা সরাসরি অবজেক্ট ডিফাইন করতে পারো
  originalPrice: number;
  offerPrice: number;
  stock: number;
  _id: string;
}
export interface IBrandPopulated {
  _id: string;
  name: string;
  // তোমার ব্র্যান্ড অবজেক্টে অন্য কোনো ফিল্ড থাকলে এখানে যোগ করতে পারো
}
export interface DeliverySlotData {
  _id: string;
  slotName: string;
  startTime: string;
  endTime: string;
  insideBarishalCharge: number;
  outsideBarishalCharge: number;
  status: string;
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