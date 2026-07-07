"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Loader2, Star, Trash2, Edit3 } from "lucide-react";
import Swal from "sweetalert2";
import { useGetMyOrders } from "@/src/hooks/useOrderHooks"; 
import WriteReviewModal from "./WriteReviewModal"; 
import { useGetUserReviews, useDeleteReview } from "@/src/hooks/useReviewData";

type StarFilter = "All" | "5 Star" | "4 Star" | "3 Star" | "2 Star" | "1 Star";

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

export default function MyReviewsPage() {
  const [activeFilter, setActiveFilter] = useState<StarFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editReviewData, setEditReviewData] = useState<any>(null); // 👈 এডিট ডাটা ট্র্যাক করার জন্য স্টেট
  const itemsPerPage = 5;

  const [userId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token") || localStorage.getItem("refreshToken");
    return token ? getUserIdFromToken(token) : null;
  });

  const { data: orders = [], isLoading: ordersLoading } = useGetMyOrders();
  const { data: reviews = [], isLoading: reviewsLoading } = useGetUserReviews(userId || "");
  const deleteReviewMutation = useDeleteReview();

  const filterOptions: StarFilter[] = ["All", "5 Star", "4 Star", "3 Star", "2 Star", "1 Star"];

  if (!userId) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-6">
        <p className="text-[14px] font-medium text-gray-500">Please log in to view your reviews.</p>
      </div>
    );
  }

  if (ordersLoading || reviewsLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-gray-100 p-6">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E612B]" />
        <p className="text-[13px] text-gray-400">Loading your data...</p>
      </div>
    );
  }

  const getCleanId = (obj: any): string => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    if (obj.$oid) return obj.$oid;
    if (obj._id) return typeof obj._id === "object" ? obj._id.$oid || obj._id : obj._id;
    return "";
  };

  const handleDeleteReview = (reviewId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this review!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4E612B",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "rounded-2xl" }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteReviewMutation.mutate(reviewId, {
          onSuccess: () => {
            Swal.fire({
              title: "Deleted!",
              text: "Your review has been deleted.",
              icon: "success",
              confirmButtonColor: "#4E612B"
            });
          },
          onError: () => {
            Swal.fire("Error!", "Failed to delete the review.", "error");
          }
        });
      }
    });
  };

  const deliveredProductsList: any[] = [];

  orders.forEach((order: any) => {
    if (order.orderStatus === "Deliverd" || order.orderStatus === "Delivered") {
      const formattedDate = order.updatedAt 
        ? new Date(order.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
        : "June 12, 2026";
        
      const shortOrderId = order.transactionId 
        ? order.transactionId.split('-')[1]?.slice(0, 8).toUpperCase() 
        : order._id?.slice(-8).toUpperCase() || "KB-10245";

      order.products?.forEach((item: any) => {
        if (item.productId) {
          deliveredProductsList.push({
            product: item.productId,
            quantity: item.quantity || 1,
            orderId: shortOrderId,
            deliveredDate: formattedDate
          });
        }
      });
    }
  });

  const fullDisplayItems = deliveredProductsList.map((item) => {
    const targetProdId = getCleanId(item.product);
    const existingReview = reviews.find((rev: any) => getCleanId(rev.productId || rev.product) === targetProdId);

    return {
      ...item,
      hasReview: !!existingReview,
      reviewData: existingReview || null,
    };
  });

  const filteredItems = fullDisplayItems.filter((item) => {
    if (activeFilter === "All") return true;
    if (!item.hasReview) return false; 
    const targetRating = parseInt(activeFilter.split(" ")[0]);
    return item.reviewData?.rating === targetRating;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full bg-white rounded-2xl p-2 md:p-6 text-[#1E1E1E]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p className="font-montserrat font-semibold text-[32px] text-[#0A1128] tracking-tight">My Reviews</p>
          <p className="text-[13px] text-gray-400 mt-0.5">{filteredItems.length} Saved Address</p>
        </div>

        {/* TOP FILTER TABS */}
        <div className="flex flex-wrap items-center gap-2">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => { setActiveFilter(filter); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all border cursor-pointer ${
                activeFilter === filter
                  ? "bg-[#4E612B] text-white border-[#4E612B]"
                  : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ITEMS CONTAINER LIST */}
      <div className="space-y-4">
        {currentItems.length === 0 ? (
          <div className="text-center py-16 text-[14px] text-gray-400 border border-dashed border-gray-200 rounded-2xl">
            No items found matching this filter.
          </div>
        ) : (
          currentItems.map((item: any, idx: number) => {
            const { product, quantity, orderId, deliveredDate, hasReview, reviewData } = item;
            
            const productName = typeof product === 'object' ? product?.name : "Premium Product";
            const productWeight = typeof product === 'object' ? product?.variants?.[0]?.weightId?.name || "1kg" : "1kg";
            const imgUrl = (typeof product === 'object' && product?.images?.[0]) || "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=150";

            return (
              <div key={idx} className="p-5 border border-gray-100 rounded-xl bg-white flex flex-col sm:flex-row gap-4 items-start justify-between">
                
                {/* Left Column: Product Thumbnail & Meta Details */}
                <div className="flex gap-4 items-start flex-1 w-full">
                  <div className="w-[72px] h-[72px] relative rounded-lg border border-gray-100 overflow-hidden bg-gray-50 shrink-0">
                    <Image src={imgUrl} alt={productName} fill className="object-cover" />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div>
                      <p className="font-bold text-[15px] text-gray-800 leading-none">
                        {productName} · <span className="font-normal text-gray-400 text-[14px]">{productWeight}</span>
                      </p>
                      <p className="text-[12px] text-gray-400 mt-1">
                        Qty: {quantity} - Order #{orderId}
                      </p>
                    </div>

                    {/* Stars Block & Badges Layer */}
                    {hasReview ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, sIdx) => (
                              <Star 
                                key={sIdx} 
                                size={14} 
                                className={sIdx < reviewData?.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} 
                              />
                            ))}
                          </div>
                          <span className="text-[13px] font-bold text-gray-800 ml-0.5">{reviewData?.rating?.toFixed(1)}</span>
                          
                          {/* Recommended Tag */}
                          <span className={`text-[12px] font-medium px-2 py-0.5 rounded border ${
                            reviewData?.isRecommended !== false 
                              ? "bg-[#F4F8F1] text-[#4E612B] border-[#4E612B]/10" 
                              : "bg-rose-50 text-rose-600 border-rose-100"
                          }`}>
                            {reviewData?.isRecommended !== false ? "👍 Recommended" : "👎 Not Recommended"}
                          </span>
                        </div>

                        {/* Comment Body */}
                        <p className="text-[13.5px] text-gray-500 font-normal leading-relaxed max-w-2xl">
                          {reviewData?.comment}
                        </p>
                      </div>
                    ) : (
                      /* 🎯 যখন রিভিউ থাকবে না, তখন ৫টি খালি স্টার বাটন এর ঠিক বামে স্ক্রিনশটের মতো এলাইন থাকবে */
                      <div className="flex items-center gap-0.5 pt-1">
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <Star key={sIdx} size={16} className="text-gray-300" />
                        ))}
                      </div>
                    )}

                    <p className="text-[12px] text-[#4E612B] font-medium pt-0.5">
                      Delivered on {deliveredDate}
                    </p>
                  </div>
                </div>

                {/* Right Column: Controls, Actions, Badges */}
                <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                  
                  {hasReview ? (
                    <>
                      {/* Status label based on design image */}
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border uppercase tracking-wide ${
                        reviewData?.status === "Active" || reviewData?.status === "Approved" ? "bg-[#EBF5EE] text-[#2D4A3E] border-[#2D4A3E]/10" :
                        reviewData?.status === "Rejected" ? "bg-rose-50 text-rose-600 border-rose-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {reviewData?.status === "Active" ? "Approved" : reviewData?.status || "Pending"}
                      </span>

                      {/* Action buttons (Edit / Delete) */}
                      <div className="flex items-center gap-2 sm:mt-8">
                        {/* 🎯 Edit এ ক্লিক করলে ডাটা সহ মোডাল লোড হবে */}
                        <button 
                          onClick={() => { setSelectedProduct(product); setEditReviewData(reviewData); setIsModalOpen(true); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteReview(getCleanId(reviewData))}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold border border-rose-100 rounded-lg text-rose-600 hover:bg-rose-50/50 cursor-pointer transition-colors"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    /* 🎯 রাইট সাইডে বাটন প্লেসেমেন্ট যখন কোনো রিভিউ এড করা হয়নি */
                    <button 
                      onClick={() => { setSelectedProduct(product); setEditReviewData(null); setIsModalOpen(true); }}
                      className="px-4 py-1.5 text-[13px] font-bold border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-3xs sm:mt-1"
                    >
                      Write Review
                    </button>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 text-[12px] font-semibold disabled:opacity-40 cursor-pointer mr-1"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-lg font-bold text-[12px] transition-all cursor-pointer ${
                currentPage === i + 1 ? "bg-[#4E612B] text-white" : "border border-gray-100 text-gray-400 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 text-[12px] font-semibold cursor-pointer ml-1"
          >
            Next
          </button>
        </div>
      )}

      {/* Write Review Modal Mount */}
      {isModalOpen && selectedProduct && (
        <WriteReviewModal 
          userId={userId}
          product={selectedProduct} 
          editData={editReviewData} // 👈 এডিট ডেটা মোডালে পাস করা হচ্ছে
          onClose={() => { setIsModalOpen(false); setSelectedProduct(null); setEditReviewData(null); }} 
        />
      )}
    </div>
  );
}