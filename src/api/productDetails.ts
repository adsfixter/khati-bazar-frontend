// src/api/productDetails.ts

import axios from "axios";
import axiosInstance from "./axiosInstance";
import { IProduct } from "../types/product.interface";
import { IReview } from "../types/productDetails.interface";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

/**
 * Fetch Single Product Details By ID
 */
export const getProductById = async (productId: string): Promise<IProduct> => {
  try {
    const response = await axiosInstance.get(`/products/${productId}`);
    if (response.data?.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to fetch product details");
  } catch (error: unknown) {
    console.error("Error in getProductById API call:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || "Something went wrong");
    }
    throw error;
  }
};

/**
 * Fetch Product Reviews
 */
export const getProductReviews = async (productId: string): Promise<IReview[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch reviews from server");
    }
    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error("Error in getProductReviews API call:", error);
    return [];
  }
};

/**
 * Fetch Wishlist Items to Check Favorite Status
 */
export const getUserWishlist = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/wishlists/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error in getUserWishlist API call:", error);
    return null;
  }
};