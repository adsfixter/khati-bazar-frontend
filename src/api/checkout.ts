import { AddressApiResponse, IAddress } from "../types/checkout.interface";
import axiosInstance from "./axiosInstance";


// 💡 ইউজারের সব সেভ করা address আনার জন্য
export const getUserAddresses = async (userId: string): Promise<IAddress[]> => {
  try {
    const res = await axiosInstance.get<AddressApiResponse>(`/addresses/${userId}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch user addresses:", error);
    return [];
  }
};

// 💡 ভবিষ্যতে address delete করার জন্য (আপাতত placeholder, backend route অনুযায়ী আপডেট করবেন)
export const deleteAddress = async (addressId: string): Promise<boolean> => {
  try {
    const res = await axiosInstance.delete(`/addresses/${addressId}`);
    return !!res.data?.success;
  } catch (error) {
    console.error("Failed to delete address:", error);
    return false;
  }
};

// 💡 ভবিষ্যতে নতুন order placement এর জন্য (আপাতত placeholder)
export const placeOrder = async (payload: unknown): Promise<boolean> => {
  try {
    const res = await axiosInstance.post("/orders", payload);
    return !!res.data?.success;
  } catch (error) {
    console.error("Failed to place order:", error);
    return false;
  }
};