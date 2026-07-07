import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';

// সব একটিভ ক্যাটাগরি দেখার হুক
export const useGetCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosInstance.get('/category');
      return response.data.data;
    },
    staleTime: 0, 
    refetchOnMount: 'always',
    refetchOnWindowFocus: true, 
  });
};


export const useGetBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await axiosInstance.get('/brand');
      return response.data.data;
    },
    staleTime: 0, 
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};