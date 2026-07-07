"use client"; // 👈 এটি অবশ্যই ক্লায়েন্ট কম্পোনেন্ট হতে হবে

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // প্রতি রিকোয়েস্টে যেন নতুন ক্লায়েন্ট তৈরি না হয়, সেজন্য useState ব্যবহার করা হয়েছে
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // ১ মিনিট পর্যন্ত ডাটা ফ্রেশ থাকবে
        refetchOnWindowFocus: false, // উইন্ডো ফোকাস করলে বারবার রিলোড হবে না
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}