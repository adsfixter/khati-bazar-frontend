import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import axiosInstance from '../api/axiosInstance';

// ১. সব প্রোডাক্ট গেট করার হুক (প্যাজিনেশন ও সার্চ ফিল্টার সাপোর্টসহ)
export const useGetAllProducts = (page: number = 1, limit: number = 10, searchTerm: string = '') => {
  return useQuery({
    queryKey: ['products', { page, limit, searchTerm }],
    queryFn: async () => {
      const response = await axiosInstance.get(`/products`, {
        params: { page, limit, searchTerm },
      });
      return response.data; // success, meta, data (products array)
    },
  });
};

// ২. সিঙ্গেল প্রোডাক্ট ডিটেইলস গেট করার হুক
export const useGetSingleProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/products/${productId}`);
      return response.data.data;
    },
    enabled: !!productId, 
  });
};

// ৩. নতুন প্রোডাক্ট ক্রিয়েট করার হুক (Admin)
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProductData: FormData) => {
      const response = await axiosInstance.post('/products', newProductData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      // প্রোডাক্ট লিস্ট ইনভ্যালিডেট করে ডাটা রি-ফেচ করানো
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// ৪. প্রোডাক্ট আপডেট করার হুক (Admin)
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await axiosInstance.patch(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
};

// ৫. প্রোডাক্ট ডিলিট করার হুক (Admin)
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await axiosInstance.delete(`/products/${productId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};