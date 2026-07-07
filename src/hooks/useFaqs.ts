import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance'; // 🎯 আপনার প্রজেক্টের axiosInstance পাথ অনুযায়ী চেক করে নিবেন

export interface IFaq {
  _id?: string;
  question: string;
  answer: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

// সব একটিভ FAQ দেখার হুক
export const useFaqs = () => {
  const { data: faqs = [], isLoading, error } = useQuery<IFaq[]>({
    queryKey: ['faqs'],
    queryFn: async () => {
      const response = await axiosInstance.get('/faq');
      return response.data?.data || response.data;
    },
    staleTime: 0, 
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  return {
    faqs,
    isLoading,
    error,
  };
};