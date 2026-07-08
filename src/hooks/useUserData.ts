import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { API_BASE_URL } from '@/src/config/api';

const USERS_URL = `${API_BASE_URL}/users`;

// 💡 টোকেন ডিকোড করার হেল্পার ফাংশন (userId এবং এক্সপায়ারি চেক করার জন্য)
const getUserIdFromToken = (token: string): string | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.id || decoded._id || decoded.userId || null;
  } catch {
    return null;
  }
};

export const useUserData = () => {
  const queryClient = useQueryClient();

  // 💡 সেশন বাদ দিয়ে সরাসরি localStorage থেকে টোকেন রিড করা (Lazy Initializer)
  const [token] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token") || localStorage.getItem("refreshToken");
  });

  // হেডার কনফিগুরেশন
  const getAuthHeaders = () => {
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // প্রোফাইল ডেটা গেট করা
  const { data, isLoading: isQueryLoading, isError } = useQuery({
    // queryKey-তে টোকেন রাখায় টোকেন চেঞ্জ হলে অটোমেটিক রি-ফেচ হবে
    queryKey: ['my-profile', token], 
    queryFn: async () => {
      if (!token) return null;
      
      try {
        const res = await axios.get(`${USERS_URL}/my-profile`, getAuthHeaders());
        console.log("🎯 Backend User Data Response:", res.data);
        return res.data;
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || "";
        const errorStatus = err?.response?.status;

        // টোকেন এক্সপায়ারড বা আনঅথরাইজড হলে লোকাল স্টোরেজ ক্লিয়ার করে সাইন-ইন পেজে রিডাইরেক্ট করবে
        if (
          errorStatus === 401 || 
          errorStatus === 500 || 
          errorMsg.includes('expired') || 
          errorMsg.includes('token')
        ) {
          console.warn("⚠️ Token expired or invalid! Force clearing storage...");
          if (typeof window !== "undefined") {
            window.sessionStorage.clear();
            window.localStorage.clear();
            window.location.href = "/signin";
          }
        }
        throw err;
      }
    },
    // শুধুমাত্র তখনই রিকোয়েস্ট যাবে যখন লোকাল স্টোরেজে টোকেন থাকবে
    enabled: !!token, 
    retry: false,
  });

  // প্রোফাইল ইনফরমেশন ও প্রিফারেন্সেস আপডেট করা
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: FormData | Record<string, any>) => {
      const headers = payload instanceof FormData 
        ? { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data' }
        : getAuthHeaders().headers;

      const res = await axios.patch(`${USERS_URL}/update-profile`, payload, { headers });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });

  // পাসওয়ার্ড চেঞ্জ করা
  const changePasswordMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const res = await axios.patch(`${USERS_URL}/change-password`, payload, getAuthHeaders());
      return res.data;
    },
  });

  // সেশন টার্মিনেট
  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await axios.delete(`${USERS_URL}/terminate-session/${sessionId}`, getAuthHeaders());
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });

  // অ্যাকাউন্ট ডিলিট করা
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`${USERS_URL}/delete-account`, getAuthHeaders());
      return res.data;
    },
  });

  // ব্যাকএন্ড রেসপন্স থেকে ইউজার অবজেক্ট এক্সট্রাক্ট করা
  const backendUser = data?.data || data?.user || (data?.success ? data : null);

  // প্রয়োজনে ব্যবহারের জন্য userId ও আলাদাভাবে বের করে রাখা হলো
  const userId = token ? getUserIdFromToken(token) : null;

  return {
    user: backendUser,
    userId, // 💡 এক্সট্রা সুবিধা: প্রোপার্টি হিসেবে userId-ও পেয়ে যাবেন সরাসরি
    token,
    isLoading: isQueryLoading,
    isError,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    terminateSession: terminateSessionMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,
  };
};