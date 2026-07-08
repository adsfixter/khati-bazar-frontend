import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/src/config/api";

// 1️⃣ প্রোডাক্টের আইডি দিয়ে সব একটিভ রিভিউ গেট করার হুক
export const useGetProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ["reviews", "product", productId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      return data.data;
    },
    enabled: !!productId,
  });
};

// 2️⃣ 💡 নতুন যুক্ত করা হুক: নির্দিষ্ট ইউজার আইডি দিয়ে তার সব রিভিউ গেট করা
export const useGetUserReviews = (userId: string) => {
  return useQuery({
    // queryKey-তে userId থাকায় এটি প্রতিটি ইউজারের জন্য ইউনিক ক্যাশ মেইনটেইন করবে
    queryKey: ["reviews", "user", userId], 
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/reviews/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user reviews");
      const data = await res.json();
      return data.data; // ব্যাকএন্ডের { success: true, data: [...] } থেকে ডাটা রিটার্ন করছে
    },
    // শুধুমাত্র তখনই রিকোয়েস্ট ট্রিগার হবে যখন userId এভেইলেবল থাকবে
    enabled: !!userId, 
  });
};


// export const useUpdateReview = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ reviewId, formData }: { reviewId: string; formData: FormData }) => {
//       const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
//         method: "PATCH", // অথবা আপনার ব্যাকএন্ডের রিকোয়ারমেন্ট অনুযায়ী PUT / PATCH ব্যবহার করুন
//         body: formData,
//       });
//       if (!res.ok) throw new Error("Failed to update review");
//       return res.json();
//     },
//     onSuccess: (data, variables) => {
//       // ক্যাশ ইনভ্যালিডেট করে পেজ অটো-রিফ্রেশ করা
//       queryClient.invalidateQueries({ queryKey: ["reviews"] });
//     },
//   });
// };


// export const useDeleteReview = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (reviewId: string) => {
//       const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) throw new Error("Failed to delete review");
//       return res.json();
//     },
//     onSuccess: () => {
//       // ডিলিট সফল হলে রিভিউর সব ক্যাশ লিস্ট আপডেট হবে
//       queryClient.invalidateQueries({ queryKey: ["reviews"] });
//     },
//   });
// };


// export const useAddReview = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (formData: FormData) => { // এখানে সাধারণ অবজেক্টের বদলে FormData আসবে
//       const res = await fetch(`${API_BASE_URL}/reviews`, {
//         method: "POST",
//         // ⚠️ লক্ষ্য করুন: এখানে কোনো Content-Type হেডার দেওয়া যাবে না!
//         body: formData, 
//       });
//       if (!res.ok) throw new Error("Failed to add review");
//       return res.json();
//     },
//     onSuccess: (_, variables) => {
//       // FormData থেকে প্রোডাক্ট এবং ইউজার আইডি বের করে ক্যাশ রিফ্রেশ করা
//       const productId = variables.get("product") as string;
//       const userId = variables.get("user") as string;

//       if (productId) queryClient.invalidateQueries({ queryKey: ["reviews", "product", productId] });
//       if (userId) queryClient.invalidateQueries({ queryKey: ["reviews", "user", userId] });
//       if (productId) queryClient.invalidateQueries({ queryKey: ["product", productId] });
//     },
//   });
// };


// 4️⃣ রিভিউ আপডেট (Edit) করার হুক
export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, formData }: { reviewId: string; formData: FormData }) => {
      const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update review");
      return res.json();
    },
    onSuccess: () => {
      // 🎯 ফিক্স: exact: false দেওয়ায় "reviews" দিয়ে শুরু হওয়া সব কুয়েরি (user, product) একসাথে আপডেট হবে
      queryClient.invalidateQueries({ 
        queryKey: ["reviews"], 
        exact: false 
      });
    },
  });
};

// 5️⃣ রিভিউ ডিলিট করার হুক
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete review");
      return res.json();
    },
    onSuccess: () => {
      // 🎯 ফিক্স: ডিলিট করলেও যেন ইউজার এবং প্রোডাক্ট পেজের সব রিভিউ রিলোড ছাড়া আপডেট হয়
      queryClient.invalidateQueries({ 
        queryKey: ["reviews"], 
        exact: false 
      });
    },
  });
};

// ৩. নতুন রিভিউ সাবমিট করার হুক
export const useAddReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        body: formData, 
      });
      if (!res.ok) throw new Error("Failed to add review");
      return res.json();
    },
    onSuccess: () => {
      // 🎯 ফিক্স: এখানে নির্দিষ্ট করে খোঁজার চেয়ে গ্লোবালি সব রিভিউ ক্যাশ ইনভ্যালিড করা সবচেয়ে সেফ ও চমৎকার কাজ করে
      queryClient.invalidateQueries({ 
        queryKey: ["reviews"], 
        exact: false 
      });
      // প্রাইজ বা রেটিং চেঞ্জের জন্য প্রোডাক্ট কুয়েরি রিফ্রেশ
      queryClient.invalidateQueries({ 
        queryKey: ["product"], 
        exact: false 
      });
    },
  });
};