import { IProduct } from "../types/product.interface";
import axiosInstance from "./axiosInstance";


interface IFreshDealTimer {
  _id: string;
  title?: string;
  status: "Active" | "Inactive";
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}
interface RelatedProductsResponse {
  success: boolean;
  message: string;
  data: IProduct[];
}

interface FreshDealsResponse {
  success: boolean;
  data: {
    timer: IFreshDealTimer | null; // 👈 'any' এর বদলে সঠিক ইন্টারফেস টাইপ দেওয়া হলো
    products: IProduct[]; 
  };
}

export const getFreshDealsProducts = async (): Promise<IProduct[]> => {
  try {
    const response = await axiosInstance.get<FreshDealsResponse>("/products/fresh-deals?page=1");
    
    if (response.data.success && response.data.data?.products) {
      return response.data.data.products.slice(0, 5);
    }
    return [];
  } catch (error) {
    console.error("Error in getFreshDealsProducts API:", error);
    return [];
  }
};

interface ApiMeta {
  page: number;
  limit: number;
  totalProducts: number;
  totalPages: number;
}

interface FeaturedProductsResponse {
  success: boolean;
  message: string;
  meta: ApiMeta;
  data: IProduct[]; 
}

export const getFeaturedProducts = async (page = 1, limit = 10): Promise<{ products: IProduct[]; meta: ApiMeta | null }> => {
  try {
    const response = await axiosInstance.get<FeaturedProductsResponse>(
      `/products/featured?page=${page}&limit=${limit}`
    );
    
    if (response.data.success) {
      return {
        products: response.data.data,
        meta: response.data.meta
      };
    }
    return { products: [], meta: null };
  } catch (error) {
    console.error("Error in getFeaturedProducts API:", error);
    return { products: [], meta: null };
  }
};

export const getRelatedProducts = async (productId: string): Promise<IProduct[]> => {
  try {
    // 💡 বানানটি 'related' রাখা হয়েছে যা আপনার ব্যাকএন্ড রাউটের সাথে মিলবে
    const response = await axiosInstance.get<RelatedProductsResponse>(`/products/related/${productId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error in getRelatedProducts API:", error);
    return [];
  }
};