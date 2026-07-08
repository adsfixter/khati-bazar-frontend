import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/src/config/api';

const NOTIFICATIONS_URL = `${API_BASE_URL}/notifications`;

export const useNotification = (userId: string, page: number = 1) => {
  const queryClient = useQueryClient();

  // নোটিফিকেশন লিস্ট গেট করা
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', userId, page],
    queryFn: async () => {
      if (!userId) return null;
      const res = await axios.get(`${NOTIFICATIONS_URL}/${userId}?page=${page}`);
      return res.data;
    },
    enabled: !!userId,
  });

  // ১. অল নোটিফিকেশন রিড করা
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.patch(`${NOTIFICATIONS_URL}/mark-all-read`, { userId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  
  const markSingleReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await axios.patch(`${NOTIFICATIONS_URL}/${notificationId}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  // ৩. সিঙ্গেল নোটিফিকেশন ডিলিট করা
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await axios.delete(`${NOTIFICATIONS_URL}/${notificationId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  return {
    notifications: data?.data || [],
    meta: data?.meta || { page: 1, totalPages: 1, totalUnread: 0, totalNotifications: 0 },
    isLoading,
    markAllAsRead: markAllReadMutation.mutateAsync,
    markSingleAsRead: markSingleReadMutation.mutateAsync, // এক্সপোর্ট করা হলো
    deleteNotification: deleteNotificationMutation.mutateAsync,
  };
};