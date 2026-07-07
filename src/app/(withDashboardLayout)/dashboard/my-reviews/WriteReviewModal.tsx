"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Star, UploadCloud, Loader2 } from "lucide-react";
import Swal from "sweetalert2"; 
import { useAddReview, useUpdateReview } from "@/src/hooks/useReviewData";

interface WriteReviewModalProps {
  userId: string;
  product: any;
  editData?: any; 
  onClose: () => void;
}

export default function WriteReviewModal({ userId, product, editData, onClose }: WriteReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);
  
  // 📸 ইমেজের জন্য স্টেটসমূহ
  const [existingImages, setExistingImages] = useState<string[]>([]); // 👈 ডাটাবেজে থাকা আগের ইমেজগুলোর জন্য
  const [selectedImages, setSelectedImages] = useState<File[]>([]);   // 👈 নতুন সিলেক্ট করা ফাইলের জন্য
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);   // 👈 নতুন ফাইলের ব্লব প্রিভিউ URL
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addReviewMutation = useAddReview();
  const updateReviewMutation = useUpdateReview();

  // 🎯 এডিট মোড চালু থাকলে পুরানো ডাটা এবং ইমেজ প্রি-ফিল করার লজিক
  useEffect(() => {
    if (editData) {
      setRating(editData.rating || 0);
      setRecommend(editData.isRecommended !== false);
      
      // ব্যাকএন্ড থেকে আসা আগের ইমেজ অ্যারে সেট করা (URL সমূহের অ্যারে)
      if (editData.images && Array.isArray(editData.images)) {
        setExistingImages(editData.images);
      }

      const rawComment = editData.comment || "";
      if (rawComment.startsWith("[")) {
        const closeBracketIdx = rawComment.indexOf("]");
        if (closeBracketIdx !== -1) {
          setReviewTitle(rawComment.slice(1, closeBracketIdx));
          setComment(rawComment.slice(closeBracketIdx + 1).trim());
          return;
        }
      }
      setComment(rawComment);
    }
  }, [editData]);

  // নতুন ডিভাইস ইমেজ সিলেক্ট করার হ্যান্ডলার
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // আগের এবং নতুন ইমেজ মিলিয়ে যেন ৫টির বেশি না হয়
      if (existingImages.length + selectedImages.length + filesArray.length > 5) {
        Swal.fire("Warning!", "You can upload a maximum of 5 images in total.", "warning");
        return;
      }

      setSelectedImages((prev) => [...prev, ...filesArray]);

      const previewsArray = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previewsArray]);
    }
  };

  // ❌ আগের (ডাটাবেজের) কোনো ইমেজ রিমুভ করার হ্যান্ডলার
  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ❌ নতুন সিলেক্ট করা কোনো ইমেজ রিমুভ করার লজিক
  const removeNewImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      Swal.fire("Warning!", "Please select a rating star!", "warning");
      return;
    }
    if (!comment.trim()) {
      Swal.fire("Warning!", "Please enter your review details.", "warning");
      return;
    }

    const formData = new FormData();
    const finalComment = reviewTitle ? `[${reviewTitle}] ${comment}` : comment;
    
    const reviewObj: any = {
      rating: rating,
      comment: finalComment,
      isRecommended: recommend !== false,
    };

    // নতুন ইমেজ ফাইলগুলো অ্যাপেন্ড করা
    selectedImages.forEach((imageFile) => {
      formData.append("images", imageFile); 
    });

    if (editData) {
      // 🎯 এডিট মোডে থাকলে ইউজার আগের যেসব ইমেজ রেখে দিয়েছে তাও ব্যাকএন্ডে পাঠাতে হবে
      reviewObj.existingImages = existingImages; 

      const reviewId = editData._id || editData.$oid;
      formData.append("data", JSON.stringify(reviewObj));

      updateReviewMutation.mutate({ reviewId, formData }, {
        onSuccess: () => {
          Swal.fire({ title: "Updated!", text: "Your review has been updated.", icon: "success", confirmButtonColor: "#4E612B" });
          imagePreviews.forEach((url) => URL.revokeObjectURL(url));
          onClose();
        },
        onError: (err: any) => {
          Swal.fire("Error!", err?.message || "Failed to update review.", "error");
        }
      });
    } else {
      // ক্রিয়েট মোড
      reviewObj.userId = userId;
      reviewObj.productId = product?._id || product;
      formData.append("data", JSON.stringify(reviewObj));

      addReviewMutation.mutate(formData, {
        onSuccess: () => {
          Swal.fire({ title: "Submitted!", text: "Your review has been added.", icon: "success", confirmButtonColor: "#4E612B" });
          imagePreviews.forEach((url) => URL.revokeObjectURL(url));
          onClose();
        },
        onError: (err: any) => {
          Swal.fire("Error!", err?.message || "Failed to submit review.", "error");
        }
      });
    }
  };

  const isLoading = addReviewMutation.isPending || updateReviewMutation.isPending;
  const productName = product?.name || "Premium Product";
  const productImg = product?.images?.[0] || "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=100";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] text-[#1E1E1E] overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">
            {editData ? "Edit Review" : "Write a Review"}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 scrollbar-none flex-1">
          
          <div className="flex items-center gap-4 bg-gray-50/70 border border-gray-100 p-3 rounded-xl">
            <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-200/60 bg-white shrink-0">
              <Image src={productImg} alt={productName} fill className="object-cover" />
            </div>
            <div>
              <h4 className="font-bold text-[15px] text-gray-800 leading-tight">{productName}</h4>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {editData ? "Modify your current rating and review" : "Share Your Experience"}
              </p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-bold text-gray-700 block">
              How would you rate this product? <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 hover:scale-110 cursor-pointer transition-transform"
                  >
                    <Star
                      size={28}
                      className={starValue <= (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[14px] font-bold text-gray-700 block">Review Title <span className="text-[12px] text-gray-400 font-normal">(Optional)</span></label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] focus:outline-hidden focus:border-[#4E612B] bg-white transition-all"
            />
          </div>

          {/* Comment Message */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[14px] font-bold text-gray-700">Your Review <span className="text-rose-500">*</span></label>
              <span className="text-[11px] text-gray-400 font-medium">{comment.length} / 500</span>
            </div>
            <textarea
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other customers about product quality, freshness, packaging and delivery experience."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] focus:outline-hidden focus:border-[#4E612B] bg-white resize-none transition-all"
            />
          </div>

          {/* 📸 ইমেজ সেকশন (আগের ইমেজ এবং নতুন ইমেজ গ্রিড সহ) */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-bold text-gray-700 block">
              Add Photo <span className="text-[12px] text-gray-400 font-normal">(Optional · max 5)</span>
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-[#4E612B]/60 rounded-2xl p-6 text-center bg-gray-50/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all"
            >
              <UploadCloud size={20} className="text-gray-400" />
              <div>
                <p className="text-[14px] font-bold text-gray-700">Upload product photos</p>
                <p className="text-[12px] text-gray-400 mt-0.5">Click to open device files · JPG, PNG</p>
              </div>
            </div>

            {/* 📸 কম্বাইন্ড প্রিভিউ এরিয়া (আগের ইমেজ ও নতুন ইমেজের জন্য আলাদা ব্যাজ) */}
            {(existingImages.length > 0 || imagePreviews.length > 0) && (
              <div className="flex flex-wrap gap-3 mt-3">
                
                {/* ১. ডাটাবেজে আগে থেকে থাকা ছবিসমূহ */}
                {existingImages.map((url, index) => (
                  <div key={`exist-${index}`} className="w-16 h-16 relative rounded-xl border-2 border-emerald-500/40 overflow-hidden bg-gray-50 group">
                    <img src={url} alt="existing-preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-bold text-center py-0.5 uppercase tracking-tighter">Saved</span>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* ২. নতুনভাবে সিলেক্ট করা ডিভাইস ছবিসমূহ */}
                {imagePreviews.map((previewUrl, index) => (
                  <div key={`new-${index}`} className="w-16 h-16 relative rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 group">
                    <img src={previewUrl} alt="new-preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-rose-600 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

              </div>
            )}
          </div>

          {/* Recommend section */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-gray-700 block">Would you recommend this product?</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRecommend(true)}
                className={`px-5 py-2 rounded-xl border text-[13px] font-bold cursor-pointer flex items-center gap-1.5 transition-all ${recommend === true ? "bg-[#4E612B]/10 border-[#4E612B] text-[#4E612B]" : "bg-white border-gray-200 text-gray-600"}`}
              >
                👍 Yes, recommend
              </button>
              <button
                type="button"
                onClick={() => setRecommend(false)}
                className={`px-5 py-2 rounded-xl border text-[13px] font-bold cursor-pointer flex items-center gap-1.5 transition-all ${recommend === false ? "bg-rose-50 border-rose-500 text-rose-600" : "bg-white border-gray-200 text-gray-600"}`}
              >
                👎 Not really
              </button>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-[14px] font-bold text-gray-600 cursor-pointer hover:bg-gray-50">Cancel</button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#4E612B] hover:bg-[#3e4d22] text-white rounded-xl text-[14px] font-bold flex items-center gap-1.5 cursor-pointer shadow-3xs disabled:opacity-50"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {editData ? "Update Review" : "Add Review"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}