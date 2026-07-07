/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance'; // আপনার এক্সিওস ইনস্ট্যান্স পাথ দিন

const API_BASE_URL = '/delivery-slots'; // ব্যাকএন্ড প্রিফিক্স অনুযায়ী অ্যাডজাস্ট করুন

export const deliverySlotApi = {
  getActiveSlots: async () => {
    const res = await axiosInstance.get(`${API_BASE_URL}/active`);
    return res.data?.data || [];
  },
  getAllSlots: async () => {
    const res = await axiosInstance.get(`${API_BASE_URL}/all`);
    return res.data?.data || [];
  },
};

export const useDeliverySlot = () => {
  // শুধুমাত্র অ্যাক্টিভ স্লটগুলো ফেচ করার কুয়েরি
  const { data: activeSlots = [], isLoading: isLoadingActiveSlots } = useQuery({
    queryKey: ['delivery-slots', 'active'],
    queryFn: deliverySlotApi.getActiveSlots,
  });

  // অ্যাডমিন বা অন্য রিকোয়ারমেন্টের জন্য সব স্লট ফেচ করার কুয়েরি
  const { data: allSlots = [], isLoading: isLoadingAllSlots } = useQuery({
    queryKey: ['delivery-slots', 'all'],
    queryFn: deliverySlotApi.getAllSlots,
  });

  return {
    activeSlots,
    allSlots,
    isLoadingSlots: isLoadingActiveSlots || isLoadingAllSlots,
  };
};