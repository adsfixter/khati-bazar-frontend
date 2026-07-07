"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getFeaturedProducts } from "@/src/api/product";
import { IProduct } from "@/src/types/product.interface";
import ShopnowModal from "../Shopnow/ShopnowModal";


// ---------- Section ----------
const FeatureProducts: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        // ১. এপিআই রেসপন্স থেকে সরাসরি products অবজেক্টটি আলাদা করে নেওয়া হলো
        const { products: fetchedProducts } = await getFeaturedProducts();

        // ২. এখন অ্যারেটি সরাসরি স্টেটে সেট হবে
        setProducts(fetchedProducts || []);
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
          <h4 className="text-[28px] font-bold text-[#1E1E1E]">
            Featured Products
          </h4>
        </div>
        <a
          href="#"
          className="flex items-center gap-1 body-medium font-medium text-[#37651B]"
        >
          See all
          <span>&rarr;</span>
        </a>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} onQuickView={handleQuickView} />
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

export default FeatureProducts;
