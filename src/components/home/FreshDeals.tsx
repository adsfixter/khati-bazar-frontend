"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { IProduct } from "@/src/types/product.interface";
import ShopnowModal from "../Shopnow/ShopnowModal";
import { getActiveFreshDealWithProducts } from "@/src/types/FreshDeals.interface";

const ClockIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 4.5V8L10.5 9.5M14.5 8A6.5 6.5 0 1 1 1.5 8A6.5 6.5 0 0 1 14.5 8Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const useCountdown = (targetDate: string | null) => {
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");

  useEffect(() => {

    if (!targetDate) return;

    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const hrs = Math.floor(difference / (1000 * 60 * 60));
      const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    };

    calculateTime(); 
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

// ---------- Section ----------
const FreshDeals: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [endDate, setEndDate] = useState<string | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🎯 ডাইনামিক কাউন্টডাউন হুক কল
  const timeLeft = useCountdown(endDate);

  // 💡 ব্যাকএন্ড থেকে টাইমার এবং প্রোডাক্ট গেট করার লজিক
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const { timer, products: fetchedProducts } = await getActiveFreshDealWithProducts();
        
        setProducts(fetchedProducts);
        if (timer?.endDate) {
          setEndDate(timer.endDate); // 👈 ডাইনামিক এ্যান্ড ডেট সেট করা হলো
        }
      } catch (err) {
        console.error("Error fetching fresh deals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const handleQuickView = (product: IProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // ডাটা লোড হওয়ার আগ পর্যন্ত লেআউট ভাঙা থেকে বাঁচাতে সেফ ব্ল্যাঙ্ক কন্ডিশন
  if (loading || products.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 min-h-[420px]" />
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10">
      {/* ---------- Header ---------- */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-[28px] font-bold text-[#1E1E1E]">Fresh Deals</h4>
          <span className="flex items-center gap-1 body-large-medium font-medium text-[#D88A2C]">
            <ClockIcon />
            Ends in {timeLeft} {/* 👈 ডাইনামিক টাইম শো হবে */}
          </span>
        </div>
        <a href="#" className="flex items-center gap-1 body-medium font-medium text-[#37651B]">
          See all
          <span>&rarr;</span>
        </a>
      </div>

      {/* ---------- Cards ---------- */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((p) => (
          <ProductCard
            key={p._id}
            product={p}
            onQuickView={handleQuickView}
          />
        ))}
      </div>
      <ShopnowModal
        key={selectedProduct?._id}
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default FreshDeals;