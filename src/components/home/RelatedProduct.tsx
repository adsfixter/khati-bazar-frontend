"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; 
import ProductCard from "./ProductCard";
import { IProduct } from "@/src/types/product.interface";
import ShopnowModal from "../Shopnow/ShopnowModal";
import { getRelatedProducts } from "@/src/api/product"; 

const RelatedProducts: React.FC = () => {
  const params = useParams();
  const currentProductId = params?.id as string;

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!currentProductId) return; 
      
      try {
        setLoading(true);
        const data = await getRelatedProducts(currentProductId); 
        setProducts(data);
      } catch (err) {
        console.error("Error fetching related products:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRelated();
  }, [currentProductId]);

  const handleQuickView = (product: IProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-[28px] font-bold text-[#1E1E1E]">
            Related Products
          </h4>
        </div>
      </div>

      {/* ---------- Cards ---------- */}
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

export default RelatedProducts;