/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/src/config/api';

const WISHLISTS_URL = `${API_BASE_URL}/wishlists`;

// API Methods
export const wishlistApi = {
  // নির্দিষ্ট ইউজারের উইশলিস্ট ডাটা নিয়ে আসা
  getMyWishlist: async (userId: string) => {
    if (!userId) return null;
    const res = await axios.get(`${WISHLISTS_URL}/${userId}`);
    // ব্যাকএন্ড যদি সরাসরি অবজেক্ট দেয় অথবা রেসপন্সের ডাটার ভেতর ডাটা (.data.data) পাঠায়
    return res.data?.data || res.data;
  },

  // প্রোডাক্ট উইশলিস্টে যোগ/বিয়োগ করা (Toggle)
  toggleWishlist: async ({ userId, productId }: { userId: string; productId: string }) => {
    const res = await axios.post(`${WISHLISTS_URL}/toggle`, { userId, productId });
    return res.data;
  },

  // উইশলিস্ট থেকে নির্দিষ্ট একটি প্রোডাক্ট ডিলিট করা
  removeSingleItem: async ({ userId, productId }: { userId: string; productId: string }) => {
    const res = await axios.patch(`${WISHLISTS_URL}/remove-item`, { userId, productId });
    return res.data;
  },

  // পুরো উইশলিস্ট এক ক্লিকে খালি করা
  clearWishlist: async (userId: string) => {
    const res = await axios.delete(`${WISHLISTS_URL}/clear/${userId}`);
    return res.data;
  }
};

// Custom Hook
export const useWishlist = (userId: string) => {
  const queryClient = useQueryClient();

  // ১. গেট উইশলিস্ট কুয়েরি
  const { data: wishlistData = null, isLoading: isLoadingWishlist, error, refetch } = useQuery<any>({
    queryKey: ['wishlist', userId],
    queryFn: () => wishlistApi.getMyWishlist(userId),
    enabled: !!userId, // ইউজার আইডি লোড হওয়ার পরেই কেবল এপিআই এক্সিকিউট হবে
    staleTime: 0,      // ক্যাশ ডাটা যেন ইনস্ট্যান্ট ব্যাকএন্ডের সাথে সিন্ক থাকে
  });

  // ২. টগল মিউটেশন
  const toggleWishlistMutation = useMutation({
    mutationFn: wishlistApi.toggleWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
  });

  // ৩. সিঙ্গেল আইটেম ডিলিট মিউটেশন
  const removeSingleItemMutation = useMutation({
    mutationFn: wishlistApi.removeSingleItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
  });

  // ৪. ক্লিয়ার অল মিউটেশন
  const clearWishlistMutation = useMutation({
    mutationFn: wishlistApi.clearWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
  });

  return {
    wishlistData,
    isLoadingWishlist,
    error,
    refetch,
    toggleWishlist: toggleWishlistMutation.mutateAsync,
    removeSingleItem: removeSingleItemMutation.mutateAsync,
    clearWishlist: clearWishlistMutation.mutateAsync,
  };
};