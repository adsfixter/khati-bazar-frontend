/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/src/config/api';

const ADDRESSES_URL = `${API_BASE_URL}/addresses`;

export const addressApi = {
  getMyAddresses: async (userId: string) => {
    if (!userId) return [];
    const res = await axios.get(`${ADDRESSES_URL}/${userId}`);
    return res.data?.data || [];
  },
  createAddress: async (data: any) => {
    const res = await axios.post(ADDRESSES_URL, data);
    return res.data;
  },
  updateAddress: async ({ id, userId, data }: { id: string; userId: string; data: any }) => {
    const res = await axios.patch(`${ADDRESSES_URL}/${id}`, { ...data, userId });
    return res.data;
  },
  deleteAddress: async (id: string) => {
    const res = await axios.delete(`${ADDRESSES_URL}/${id}`);
    return res.data;
  },
};

export const useAddress = (userId: string) => {
  const queryClient = useQueryClient();

  // ১. গেট অল অ্যাড্রেস কুয়েরি
  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses', userId],
    queryFn: () => addressApi.getMyAddresses(userId),
    enabled: !!userId,
  });

  // ২. ক্রিয়েট অ্যাড্রেস মিউটেশন
  const createAddressMutation = useMutation({
    mutationFn: addressApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
  });

  // ৩. আপডেট অ্যাড্রেস মিউটেশন
  const updateAddressMutation = useMutation({
    mutationFn: addressApi.updateAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
  });

  // ৪. ডিলিট অ্যাড্রেস মিউটেশন
  const deleteAddressMutation = useMutation({
    mutationFn: addressApi.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
  });

  return {
    addresses,
    isLoadingAddresses,
    createAddress: createAddressMutation.mutateAsync,
    updateAddress: updateAddressMutation.mutateAsync,
    deleteAddress: deleteAddressMutation.mutateAsync,
  };
};