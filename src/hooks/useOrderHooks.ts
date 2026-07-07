/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import axiosInstance from '../api/axiosInstance';

// ১. নতুন অর্ডার ইনিশিয়েট করার হুক (COD / SSLCommerz)
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (orderPayload: any) => {
      const response = await axiosInstance.post('/orders/create-order', orderPayload);
      return response.data; // এখানে রিডাইরেক্ট ইউআরএল বা অর্ডার অবজেক্ট থাকবে
    },
  });
};

// ২. লগইন করা ইউজারের নিজের সব অর্ডার দেখার হুক
export const useGetMyOrders = () => {
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await axiosInstance.get('/orders/my-orders'); // ব্যাকএন্ড রুট অনুযায়ী এডজাস্ট করুন
      return response.data.data;
    },
  });
};

// ৩. অ্যাডমিনের জন্য সিস্টেমের সব অর্ডার দেখার হুক (Admin Only)
export const useGetAllOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await axiosInstance.get('/orders');
      return response.data.data;
    },
  });
};

// ৪. অর্ডারের স্ট্যাটাস বা পেমেন্ট আপডেট করার হুক (Admin Only)
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const response = await axiosInstance.patch(`/orders/${id}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};