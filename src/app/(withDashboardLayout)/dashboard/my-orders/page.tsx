/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { ChevronLeft, ChevronRight, Loader2, Eye, Truck, ShoppingBag } from "lucide-react";
import { useGetMyOrders } from "@/src/hooks/useOrderHooks"; 
import OrderDetailsPage from "./OrderDetailsPage"; 

type OrderFilter = "All" | "Pending" | "Packed" | "Shipped" | "Out for delivery" | "Delivered" | "Cancelled" | "Returned";

// 💡 টোকেন থেকে userId ডিকোড করার হেল্পার ফাংশন
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

export default function MyOrdersPage() {
  const router = useRouter(); 
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null); 
  const itemsPerPage = 4; 

  const [userId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token") || localStorage.getItem("refreshToken");
    return token ? getUserIdFromToken(token) : null;
  });

  const { data: rawOrders = [], isLoading } = useGetMyOrders();

  const filterOptions: OrderFilter[] = ["All", "Pending", "Packed", "Shipped", "Out for delivery", "Delivered", "Cancelled"];

  const selectedOrderData = rawOrders.find((o: any) => o._id === activeOrderId);

  const handleOrderAgain = () => {
    router.push('/shopnow');
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "Packed":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Shipped":
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "Out for delivery":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "Delivered":
        return "bg-[#EBF5EE] text-[#2D4A3E] border-[#2D4A3E]/10";
      case "Cancelled":
      case "Canceled":
        return "bg-[#FDF2F2] text-[#E02424] border-[#E02424]/10";
      case "Returned":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  if (activeOrderId && selectedOrderData) {
    return (
      <OrderDetailsPage 
        orderData={selectedOrderData} 
        onBack={() => setActiveOrderId(null)} 
      />
    );
  }

  if (!userId) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-6">
        <p className="text-[14px] font-medium text-gray-500">Please log in to view your orders.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-gray-100 p-6">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E612B]" />
        <p className="text-[12px] text-gray-400">Loading your orders...</p>
      </div>
    );
  }

  const sortedOrders = [...rawOrders].sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredOrders = sortedOrders.filter((order: any) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Cancelled" && (order.orderStatus === "Canceled" || order.orderStatus === "Cancelled")) return true;
    return order.orderStatus?.toLowerCase() === activeFilter.toLowerCase();
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 p-2 md:p-6 text-[#1E1E1E]">
      
      {/* 💳 HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-6">
        <div>
          <p className="font-montserrat font-semibold text-[24px] md:text-[28px] text-[#1E1E1E] tracking-tight">
            My Orders
          </p>
          <p className="text-[13px] md:text-[14px] text-gray-400 mt-0.5">
            {filteredOrders.length} total orders
          </p>
        </div>

        {/* 🔘 TOP FILTERS (📱 মোবাইলে ফ্লেক্স গ্রিড সিস্টেমে ২ লাইনে এবং ডেস্কটপে সিঙ্গেল লাইনে থাকবে) */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:flex md:items-center gap-1.5 md:gap-2 w-full xl:w-auto">
          {filterOptions.map((filter) => {
            // "Out for delivery" বড় টেক্সট হওয়ায় ২ কলামের জায়গা নিবে মোবাইলে যাতে কাটাকাটি না হয়
            const isLongText = filter === "Out for delivery";
            return (
              <button
                key={filter}
                onClick={() => { setActiveFilter(filter); setCurrentPage(1); }}
                className={`px-2 py-2 md:px-4 md:py-2 rounded-xl text-[11px] md:text-[13px] font-bold transition-all border text-center cursor-pointer truncate ${
                  isLongText ? "col-span-2 md:col-span-1" : "col-span-1"
                } ${
                  activeFilter === filter
                    ? "bg-[#4E612B] text-white border-[#4E612B]"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* 📦 ORDERS CONTAINER CARD */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
        {currentOrders.length === 0 ? (
          <div className="text-center py-16 text-[14px] text-gray-400">
            No orders found matching this status.
          </div>
        ) : (
          currentOrders.map((order: any, idx: number) => {
            const firstTwoProducts = order.products?.slice(0, 2) || [];
            const extraProductsCount = order.products?.length > 2 ? order.products.length - 2 : 0;

            const mainProductName = order.products?.[0]?.productId?.name || "Premium Product";
            const productDisplayTitle = order.products?.length > 1 
              ? `${mainProductName} and ${order.products.length - 1} more` 
              : mainProductName;

            const orderDate = order.createdAt 
              ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : "30 Jun 2026";

            return (
              <div 
                key={order._id || idx}
                className={`p-4 md:p-6 flex flex-col gap-4 transition-all hover:bg-gray-50/40 ${
                  idx !== currentOrders.length - 1 ? "border-b border-gray-200/80" : ""
                }`}
              >
                {/* 📌 TOP INFOBAR */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Order ID</p>
                      <p className="text-[13px] font-bold text-gray-800 mt-0.5">#{order._id?.slice(-8).toUpperCase() || "KB-10265"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Placed On</p>
                      <p className="text-[13px] font-medium text-gray-700 mt-0.5">{orderDate}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Payment Method</p>
                      <p className="text-[13px] font-medium text-gray-700 mt-0.5">{order.paymentMethodId?.name || "Nagad"}</p>
                    </div>
                  </div>
                  
                  <span className={`self-start sm:self-center px-2.5 py-1 rounded-md text-[12px] font-semibold tracking-wide border ${getStatusBadgeStyle(order.orderStatus)}`}>
                    {order.orderStatus || "Pending"}
                  </span>
                </div>

                {/* 🛒 BODY & ACTIONS SECTION */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-3.5 flex-1 w-full">
                    <div className="flex items-center -space-x-2 overflow-hidden shrink-0">
                      {firstTwoProducts.map((p: any, i: number) => {
                        const rawImg = p?.productId?.images?.[0];
                        const imgUrl = typeof rawImg === "string" ? rawImg : rawImg?.url || "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=80";
                        return (
                          <div key={i} className="w-12 h-12 md:w-14 md:h-14 relative rounded-xl border-2 border-white bg-gray-50 shadow-xs overflow-hidden">
                            <Image src={imgUrl} alt="product" fill className="object-cover" />
                          </div>
                        );
                      })}
                      {extraProductsCount > 0 && (
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center shadow-xs z-10">
                          <p className="text-[13px] font-bold text-gray-500">+{extraProductsCount}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-[15px] md:text-[16px] font-semibold text-gray-800 hover:text-[#4E612B] transition-colors cursor-pointer truncate">
                        {productDisplayTitle}
                      </p>
                      <p className="text-[12px] md:text-[13px] text-gray-400 font-normal truncate">
                        📍 {order.addressId?.areaStreet || order.addressId?.addressLine || "Gulshan 2, Dhaka"}
                      </p>
                    </div>
                  </div>

                  {/* PRICE & BUTTONS */}
                  <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-center gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] font-medium text-gray-400 uppercase">Total Amount</p>
                      <p className="text-[16px] md:text-[18px] font-extrabold text-[#1E1E1E] mt-0.5">৳{order.totalAmount || "0"}</p>
                    </div>

                    <div className="flex items-center gap-1.5 md:gap-2">
                      <button 
                        onClick={() => setActiveOrderId(order._id)} 
                        className="flex items-center gap-1 px-3 py-2 md:px-4 md:py-2 rounded-xl border border-gray-200 text-[13px] md:text-[14px] font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-2xs transition-colors"
                      >
                        <Eye size={15} className="text-gray-500" /> Details
                      </button>
                      
                      { order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && order.orderStatus !== "Canceled" && order.orderStatus !== "Returned" ? (
                        <button 
                          onClick={() => setActiveOrderId(order._id)} 
                          className="flex items-center gap-1 px-3 py-2 md:px-4 md:py-2 rounded-xl bg-[#4E612B] text-[13px] md:text-[14px] font-semibold text-white hover:bg-[#3d4d22] cursor-pointer shadow-xs transition-all"
                        >
                          <Truck size={15} /> Track
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleOrderAgain()} 
                          className={`flex items-center gap-1 px-3 py-2 md:px-4 md:py-2 rounded-xl border text-[13px] md:text-[14px] font-semibold cursor-pointer shadow-2xs transition-all ${
                            order.orderStatus === "Cancelled" || order.orderStatus === "Canceled"
                              ? "border-rose-200 text-rose-700 bg-rose-50/30 hover:bg-rose-50"
                              : "border-[#4E612B]/25 text-[#4E612B] bg-[#4E612B]/5 hover:bg-[#4E612B]/10"
                          }`}
                        >
                          <ShoppingBag size={14} /> Again
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 🎯 FOOTER PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-[13px] md:text-[14px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors bg-white"
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-xl text-[13px] md:text-[14px] font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#4E612B] text-white shadow-xs"
                      : "text-gray-500 border border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-[13px] md:text-[14px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-colors bg-white"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

    </div>
  );
}