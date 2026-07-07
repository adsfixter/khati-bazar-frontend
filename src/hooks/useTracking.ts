import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance'; // আপনার এক্সিওস ইনস্ট্যান্স পাথ

export const useGetOrderTracking = (orderId: string) => {
  return useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await axiosInstance.get(`/tracking/${orderId}`);
      return response.data.data; // ব্যাকএন্ড থেকে আসা ট্র্যাকিং অবজেক্ট
    },
    enabled: !!orderId,
  });
};