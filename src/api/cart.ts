import axiosInstance from "@/src/api/axiosInstance";
import { ICoupon } from "@/src/types/cart.interface";
import { DBPaymentMethod, IAddressPayload, IOrderPayload } from "../types/check.interface";


export const getAvailableCoupons = async (): Promise<ICoupon[]> => {
  const res = await axiosInstance.get("coupons/available-coupons");
  const resData = res.data?.data || res.data?.coupons || (Array.isArray(res.data) ? res.data : []);
  
  if (Array.isArray(resData)) {
    return resData.filter(
      (c: ICoupon) => c && c.status && c.status.toLowerCase() === "active"
    );
  }
  return [];
};

// User Address চেক করা
export const checkUserAddress = async (userId: string): Promise<boolean> => {
  try {
    const res = await axiosInstance.get(`/addresses/${userId}`);
    const resData = res.data?.data || res.data || [];
    return Array.isArray(resData) && resData.length > 0;
  } catch (error) {
    console.error("Address checking failed:", error);
    return false; // Error হলে বা না থাকলে false যাবে
  }
};



const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// ১. একটিভ পেমেন্ট মেথডগুলো নিয়ে আসা
export const getActivePaymentMethods = async (): Promise<DBPaymentMethod[]> => {
  const res = await fetch(`${API_BASE_URL}/payment-methods/active-methods`);
  if (!res.ok) throw new Error("Failed to fetch payment methods");
  const data = await res.json();
  return data?.data || [];
};

// ২. নতুন এড্রেস তৈরি বা সেভ করা
export const createUserAddress = async (payload: IAddressPayload, token: string) => {
  const res = await fetch(`${API_BASE_URL}/addresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res;
};

// ৩. চেকআউট বা অর্ডার প্লেস করা
export const submitCheckoutOrder = async (payload: IOrderPayload, token: string) => {
  const res = await fetch(`${API_BASE_URL}/orders/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res;
};