"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IProduct, IWeight } from "@/src/types/product.interface";

import { toast } from "react-toastify";
import axiosInstance from "@/src/api/axiosInstance";
import { HeartIcon, StarIcon } from "@/src/svgIcon/svg";

const getUserIdFromToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const decoded = JSON.parse(jsonPayload);
    return decoded._id || decoded.id || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
interface ProductCardProps {
  product: IProduct;
  onQuickView?: (product: IProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const firstVariant = product.variants?.[0];
  const originalPrice = firstVariant?.originalPrice || 0;
  const currentPrice = firstVariant?.offerPrice || originalPrice;

  let discountLabel = "";
  if (firstVariant?.offerPrice && firstVariant.offerPrice < originalPrice) {
    const calcDiscount = Math.round(
      ((originalPrice - firstVariant.offerPrice) / originalPrice) * 100,
    );
    discountLabel = `${calcDiscount}% OFF`;
  }

  const isOutOfStock =
    product.totalStock <= 0 || (firstVariant && firstVariant.stock <= 0);
  const productImg = product.images?.[0] || "/img/card.png";

  const getWeightDisplay = (): string => {
    if (
      firstVariant &&
      typeof firstVariant.weightId === "object" &&
      firstVariant.weightId !== null
    ) {
      const weight = firstVariant.weightId as IWeight;
      return `${weight.value}${weight.unit}` || "1kg";
    }

    return "1kg";
  };

  // 💡 ১. পেজ লোডের সময় টোকেন ডিকোড করে অটোমেটিক ইনিশিয়াল উইশলিস্ট স্টেট চেক
  useEffect(() => {
    const fetchUserWishlist = async () => {
      const userId = getUserIdFromToken();
      if (!userId) return; // টোকেন না থাকলে চেক করার দরকার নেই

      try {
        const res = await axiosInstance.get(`/wishlists/${userId}`);
        if (res.data?.success && res.data?.data?.products) {
          // any-র বদলে টাইপ ডিফাইন করে দেওয়া হলো যেনproductId চেক করা যায়
          const exist = res.data.data.products.some(
            (item: { productId?: { _id?: string } | string }) => {
              const prodId =
                typeof item.productId === "object"
                  ? item.productId?._id
                  : item.productId;

              return (prodId || "").toString() === product._id.toString();
            },
          );
          setIsFavorite(exist);
        }
      } catch (error) {
        console.error("Initial wishlist fetch failed:", error);
      }
    };

    fetchUserWishlist();
  }, [product._id]);

  // 💡 ২. হার্ট বাটন টগল হ্যান্ডলার (টোকেন বেজড ডাইনামিক লজিক)
  const handleWishlistToggle = async () => {
    if (loading) return;

    // টোকেন থেকে আইডি নেওয়া হচ্ছে
    const userId = getUserIdFromToken();

    // যদি টোকেন না থাকে বা এক্সপায়ারড হয়
    if (!userId) {
      toast.error("Please log in first to add products to your wishlist!");
      return;
    }

    try {
      setLoading(true);

      // ব্যাকএন্ডে রিকোয়েস্ট পাঠানো
      const res = await axiosInstance.post("/wishlists/toggle", {
        productId: product._id,
        userId: userId,
      });

      if (res.data?.success) {
        setIsFavorite((prev) => !prev);
        if (!isFavorite) {
          toast.success("Added to wishlist!");
        } else {
          toast.info("Removed from wishlist!");
        }
      } else {
        toast.error(res.data?.message || "Failed to update wishlist");
      }
    } catch (error) {
      // 💡 ১. 'any' রিমুভ করে টাইপস্ক্রিপ্টের ডিফল্ট 'unknown' রাখা হলো
      console.error("Wishlist error:", error);

      // 💡 ২. টাইপ সেফ উপায়ে Axios এরর অবজেক্ট হ্যান্ডেল করার জন্য কাস্টম টাইপ কাস্টিং করা হলো
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };

      toast.error(
        axiosError.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const CART_STORAGE_KEY = "cart";

interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  weight?: string;
  quantity: number;
}

const handleAddToCart = () => {
  if (isOutOfStock || !firstVariant) return;

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const existingCart: CartItem[] = raw ? JSON.parse(raw) : [];

    const newItem: CartItem = {
      productId: product._id,
      variantId: firstVariant._id,
      name: product.name,
      image: productImg,
      price: currentPrice,
      weight: getWeightDisplay(),
      quantity: 1,
    };

    const existingIndex = existingCart.findIndex(
      (item) => item.productId === newItem.productId && item.variantId === newItem.variantId,
    );

    let updatedCart: CartItem[];
    if (existingIndex !== -1) {
      updatedCart = existingCart.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item,
      );
    } else {
      updatedCart = [...existingCart, newItem];
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));

    // 💡 অন্য কম্পোনেন্ট (cart icon count, cart page) sync রাখার জন্য একটা কাস্টম ইভেন্ট ফায়ার করা হচ্ছে
    window.dispatchEvent(new Event("cartUpdated"));

    toast.success(`${product.name} added to cart!`);
  } catch (error) {
    console.error("Failed to add to cart:", error);
    toast.error("Something went wrong. Please try again.");
  }
};

  return (
    <div className="flex h-[313px] w-full max-w-[243px] flex-col gap-2 rounded-xl border border-[var(--Color-stroke,#E9E9E9)] bg-[var(--Color-Surface-primary,#FFFFFF)] p-4 shadow-[0px_4px_16px_0px_#0000000F]">
      {/* ---------- Image + hover overlay ---------- */}
      <div className="group relative h-[140px] w-full overflow-hidden rounded-lg">
        <Image
          src={productImg}
          alt={product.name}
          fill
          className="object-cover"
          unoptimized={productImg.startsWith("http")}
        />

        {/* Discount badge */}
        {discountLabel && (
          <span className="absolute left-2 top-2 rounded-md bg-[#1E1E1E] px-2 py-1 text-[11px] font-montserrat font-medium text-white">
            {discountLabel}
          </span>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-[14px] font-semibold text-white">
              Out of stock
            </span>
          </div>
        )}

        {/* Quick view - hover e show hobe */}
        <button
          onClick={() => onQuickView?.(product)}
          className="absolute bottom-0 left-1/2 flex h-[29px] w-[209px] -translate-x-1/2 translate-y-full items-center justify-center gap-2.5 rounded-b-lg border-b border-[var(--Color-Primary-bg-100,#C1CFB8)] bg-[var(--Color-Primary-bg-50,#EBF0E8)] px-2.5 py-1.5 text-[13px] font-medium text-[#274813] opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Quick View
        </button>
      </div>

      {/* ---------- Meta ---------- */}
      <div className="flex items-center justify-between text-[12px] text-[#6B6B6B]">
        <span className="subtext-medium">
          {product.productType === "International" ? "Imported" : "Local"}
        </span>
        <span className="flex items-center gap-1">
          <StarIcon />
          4.8 (78)
        </span>
      </div>

      {/* ---------- Title + unit ---------- */}
      <div className="flex items-center justify-between">
        <p
          className="body-medium font-semibold text-[#1E1E1E] truncate max-w-[130px]"
          title={product.name}
        >
          {product.name}
        </p>
        <span className="subtext-medium text-[#6B6B6B]">
          {getWeightDisplay()}
        </span>
      </div>

      {/* ---------- Price ---------- */}
      <div className="flex items-center gap-2">
        <span className="body-large-semibold font-semibold text-[#37651B]">
          ৳{currentPrice}
        </span>
        {firstVariant?.offerPrice && (
          <span className="text-[13px] font-montserrat text-[#A0A0A0] line-through">
            ৳{originalPrice}
          </span>
        )}
      </div>

      {/* ---------- Actions ---------- */}
      <div className="mt-auto flex items-center gap-2">
        {/* হার্ট বাটন */}
        <button
          onClick={handleWishlistToggle}
          disabled={loading}
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--Color-stroke,#E9E9E9)] transition-colors duration-200 ${
            isFavorite
              ? "bg-red-50 border-red-200 text-red-500 fill-red-500"
              : "bg-white text-inherit"
          } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <HeartIcon />
        </button>
<button
  onClick={handleAddToCart}
  disabled={isOutOfStock}
  className="flex h-9 flex-1 items-center justify-center rounded-lg bg-[var(--Color-Primary-bg-500,#37651B)] subtext-large-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
>
  Add to Cart
</button>
      </div>
    </div>
  );
};

export default ProductCard;
