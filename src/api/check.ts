import axiosInstance from "@/src/api/axiosInstance";
import {
  DBPaymentMethod,
  IAddress,
  IAddressUpdatePayload,
  IOrderPayload,
} from "../types/check.interface";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const getUserAddresses = async (userId: string): Promise<IAddress[]> => {
  try {
    const res = await axiosInstance.get(`/addresses/${userId}`);
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error("Failed to fetch user addresses:", error);
    return [];
  }
};

export const getActivePaymentMethods = async (): Promise<DBPaymentMethod[]> => {
  const res = await fetch(`${API_BASE_URL}/payment-methods/active-methods`);
  if (!res.ok) throw new Error("Failed to fetch payment methods");
  const data = await res.json();
  return data?.data || [];
};

export const submitCheckoutOrder = async (payload: IOrderPayload, token: string | null) => {
  const res = await fetch(`${API_BASE_URL}/orders/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return res;
};
export const getMyAddresses = async (userId: string, token: string): Promise<IAddress[]> => {
  const res = await fetch(`${API_BASE_URL}/addresses/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch addresses");
  const data = await res.json();
  return data?.data || [];
};

// ২. অ্যাড্রেস এডিট/আপডেট করা (PATCH)
export const updateAddress = async (id: string, payload: IAddressUpdatePayload, token: string) => {
  const res = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res;
};

// ৩. অ্যাড্রেস ডিলিট করা (DELETE)
export const deleteAddress = async (id: string, token: string) => {
  const res = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
};
