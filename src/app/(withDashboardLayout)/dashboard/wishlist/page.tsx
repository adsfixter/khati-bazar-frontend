/* eslint-disable @typescript-eslint/no-explicit-any */


"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Trash2, Star, Loader2 } from "lucide-react";
import { useWishlist } from "@/src/hooks/useWishlistData";
import { useGetAllProducts } from "@/src/hooks/useProductHooks";
import { toast } from "react-toastify";


type FilterType = "All" | "Available" | "OutOfStock";

const CART_STORAGE_KEY = "cart";

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

export default function WishlistPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const [userId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const token =
      localStorage.getItem("token") || localStorage.getItem("refreshToken");
    return token ? getUserIdFromToken(token) : null;
  });

  const { wishlistData, isLoadingWishlist, removeSingleItem } = useWishlist(userId || "");
  const { data: allProductsData, isLoading: isLoadingProducts } = useGetAllProducts(1, 100, ""); 

  if (!userId) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Please log in to view your wishlist items.</p>
      </div>
    );
  }

  if (isLoadingWishlist || isLoadingProducts) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-10 h-10 animate-spin text-[#2D4A3E]" />
        <p className="body-medium text-[#2D4A3E]/70">Loading your wishlist items...</p>
      </div>
    );
  }

  const wishlistItems = wishlistData?.products || [];
  const allProducts = allProductsData?.data || allProductsData || [];

  const items = wishlistItems.map((wItem: any) => {
    const rawProductId = typeof wItem.productId === "object" ? wItem.productId?._id : wItem.productId;
    const fullProductDetails = allProducts.find((p: any) => p._id === rawProductId);
    return {
      ...wItem,
      productId: fullProductDetails || wItem.productId, 
    };
  }).filter((item: any) => item.productId); 

  const filteredItems = items.filter((item: any) => {
    const product = item?.productId;
    const variant = product?.variants?.[0];
    const isAvailable = variant ? variant.stock > 0 : product?.totalStock > 0;
    
    if (activeFilter === "Available") return isAvailable;
    if (activeFilter === "OutOfStock") return !isAvailable;
    return true;
  });

  const handleDeleteItem = async (productId: string) => {
    try {
      await removeSingleItem({ userId, productId });
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  // 🎯 উইশলিস্ট থেকে কার্ট-এ ট্রান্সফার করার মেইন লজিক
  const handleAddToCartFromWishlist = async (product: any, variant: any) => {
    try {
      // ১. লোকাল স্টোরেজ থেকে কার্টের কারেন্ট ডাটা তুলে আনা
      const rawCart = localStorage.getItem(CART_STORAGE_KEY);
      const currentCart = rawCart ? JSON.parse(rawCart) : [];

      // ২. নতুন প্রোডাক্ট পেলোড সাজানো (CartPage এর সাথে মিল রেখে)
      const cartItemPayload = {
        productId: product._id,
        variantId: variant?._id || "",
        name: product.name,
        price: variant ? variant.offerPrice : 0,
        image: product.images?.[0] || "",
        weight: variant?.weightId?.name || "1kg",
        quantity: 1, // ডিফল্ট ১ টি আইটেম যোগ হবে
      };

      // ৩. কার্টে এই প্রোডাক্ট এবং ভ্যারিয়েন্ট অলরেডি আছে কিনা চেক করা
      const existingItemIndex = currentCart.findIndex(
        (item: any) =>
          item.productId === cartItemPayload.productId &&
          item.variantId === cartItemPayload.variantId
      );

      let updatedCart;
      if (existingItemIndex > -1) {
        // থাকলে জাস্ট কোয়ান্টিটি ১ বাড়িয়ে দেওয়া
        updatedCart = currentCart.map((item: any, idx: number) =>
          idx === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // না থাকলে নতুন অবজেক্ট পুশ করা
        updatedCart = [...currentCart, cartItemPayload];
      }

      // ৪. কার্ট লোকাল স্টোরেজে সেভ এবং অন্য সব জায়গায় সিঙ্ক করার জন্য ইভেন্ট ফায়ার করা
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("storage"));
      
      toast.success(`${product.name} added to cart!`);

      // ৫. ডাটাবেজের উইশলিস্ট কালেকশন থেকে এই প্রোডাক্টটি রিমুভ করা
      await removeSingleItem({ userId, productId: product._id });

    } catch (error) {
      console.error("Error moving item from wishlist to cart:", error);
      toast.error("Failed to add item to cart.");
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 p-2 md:p-6 text-[#1A2E22]">
      
      {/* TOP BAR / HEADER BLOCK */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="font-montserrat font-semibold text-2xl md:text-3xl tracking-tight text-[#1A2E22]">
            My Wishlist
          </p>
          <p className="subtext-regular text-gray-400 mt-1">
            {items.length} items on wishlist
          </p>
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex items-center gap-2 self-start sm:self-auto font-sans text-xs font-medium">
          {(["All", "Available", "OutOfStock"] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                activeFilter === filter
                  ? "bg-[#2D4A3E] text-white border-[#2D4A3E]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter === "OutOfStock" ? "Out of Stock" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCT GRID */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <p className="body-medium text-gray-400">No items found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredItems.map((item: any) => {
            const product = item?.productId;
            if (!product) return null;

            const variant = product?.variants?.[0];
            const price = variant ? variant.offerPrice : 0;
            const oldPrice = variant ? variant.originalPrice : 0;
            const stock = variant ? variant.stock : product.totalStock || 0;
            const isOutOfStock = stock <= 0;
            
            const discount = oldPrice && price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;

            return (
              <div
                key={product._id}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col justify-between shadow-xs relative group transition-all duration-300 hover:shadow-md"
              >
                {/* IMAGE BLOCK */}
                <div className="w-full aspect-[4/3] rounded-xl bg-gray-50 relative overflow-hidden mb-4 shrink-0">
                  <Image
                    src={product.images?.[0] || "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400"}
                    alt={product.name || "Product Image"}
                    fill
                    sizes="(max-w-768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {discount && !isOutOfStock && (
                    <div className="absolute top-2.5 left-2.5 bg-[#1A2E22] text-white font-sans text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                      {discount}% OFF
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] flex items-center justify-center">
                      <span className="font-montserrat font-medium text-white text-sm md:text-base tracking-wide bg-black/20 px-4 py-2 rounded-lg">
                        Out of stock
                      </span>
                    </div>
                  )}
                </div>

                {/* INFO CONTENT */}
                <div className="flex flex-col grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="subtext-medium text-gray-400 font-normal capitalize">
                      {product.productType || "Local"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={12} fill="currentColor" className="text-amber-400" />
                      <span className="text-[11px] font-bold font-sans text-gray-700">
                        {product.rating || "4.8"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-start gap-2 mb-2">
                    <p className="font-montserrat font-semibold text-sm md:text-base text-[#1A2E22] line-clamp-1">
                      {product.name || "Unknown Product"}
                    </p>
                    <span className="text-xs font-sans text-gray-400 shrink-0 mt-0.5">
                      {variant?.weightId?.name || "1kg"}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4 font-sans">
                    <span className="text-base md:text-lg font-bold text-[#1A2E22]">
                      ৳{price}
                    </span>
                    {oldPrice > price && (
                      <span className="text-xs text-gray-400 line-through">
                        ৳{oldPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* ACTION CONTROLLERS */}
                <div className="flex items-center gap-2 mt-auto w-full pt-1">
                  <button
                    onClick={() => handleDeleteItem(product._id)}
                    className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>

                  {/* 🎯 কার্ট বাটনে ফাংশনটি ট্রিগার করা হলো */}
                  <button
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCartFromWishlist(product, variant)}
                    className={`grow flex items-center justify-center font-sans text-xs font-bold py-3 px-4 rounded-xl transition-all duration-200 tracking-wide ${
                      isOutOfStock
                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                        : "bg-[#2D4A3E] text-white hover:bg-[#1A2E22] shadow-xs cursor-pointer active:scale-[0.98]"
                    }`}
                  >
                    Add to Cart
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}