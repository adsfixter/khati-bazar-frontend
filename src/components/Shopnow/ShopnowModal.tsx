"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  IProduct,
  IProductVariant,
  IWeight,
} from "@/src/types/product.interface";
import {
  BagIcon,
  CartIcon,
  ChevronLeft,
  ChevronRight,
  CloseIcon,
  HeartIcon,
  StarIcon,
  TruckIcon,
} from "@/src/svgIcon/svg";
import { toast } from "react-toastify";
import axiosInstance from "@/src/api/axiosInstance";
import { useRouter } from "next/navigation";

import {
  buildSingleItemCheckoutPayload,
  proceedToCheckout,
} from "@/src/utils/checkoutFlow";
import { CartItem } from "@/src/types/checkout.interface";
import Link from "next/link";

interface ICartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  price: number;
  weight: string;
  quantity: number;
}

interface ShopnowModalProps {
  product: IProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

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

const ShopnowModal: React.FC<ShopnowModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !product) return null;

  return (
    <ShopnowModalContent
      key={product._id}
      product={product}
      onClose={onClose}
    />
  );
};

interface ShopnowModalContentProps {
  product: IProduct;
  onClose: () => void;
}

const stripHtml = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
};

const ShopnowModalContent: React.FC<ShopnowModalContentProps> = ({
  product,
  onClose,
}) => {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : ["/img/card.png"];

  const currentVariant =
    product.variants?.[selectedVariantIdx] || product.variants?.[0];
  const originalPrice = currentVariant?.originalPrice || 0;
  const currentPrice = currentVariant?.offerPrice || originalPrice;

  // 💡 কার্ট আইটেম খোঁজার হেল্পার ফাংশন
  const getCartItemFromStorage = useCallback(
    (variantId: string): ICartItem | null => {
      if (typeof window === "undefined") return null;
      try {
        const existingCart: ICartItem[] = JSON.parse(
          localStorage.getItem("cart") || "[]",
        );
        return (
          existingCart.find(
            (item) =>
              item.productId === product._id && item.variantId === variantId,
          ) || null
        );
      } catch {
        return null;
      }
    },
    [product._id],
  );

  // 💡 Lazy State Initialization: ফার্স্ট রেন্ডারেই সরাসরি লোকাল স্টোরেজ থেকে ভ্যালু সেট হবে
  const [isInCart, setIsInCart] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const existingCart: ICartItem[] = JSON.parse(
        localStorage.getItem("cart") || "[]",
      );
      const targetVariantId = product.variants?.[0]?._id || "";
      return existingCart.some(
        (item) =>
          item.productId === product._id && item.variantId === targetVariantId,
      );
    } catch {
      return false;
    }
  });

  const [quantity, setQuantity] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const existingCart: ICartItem[] = JSON.parse(
        localStorage.getItem("cart") || "[]",
      );
      const targetVariantId = product.variants?.[0]?._id || "";
      const matched = existingCart.find(
        (item) =>
          item.productId === product._id && item.variantId === targetVariantId,
      );
      return matched ? matched.quantity : 1;
    } catch {
      return 1;
    }
  });

  // 💡 ভ্যারিয়েন্ট চেঞ্জ হ্যান্ডলার (যা ক্লিক ইভেন্টের মাধ্যমে ডিরেক্ট স্টেট আপডেট করবে, ইফেক্ট ছাড়া)
  const handleVariantChange = (idx: number) => {
    setSelectedVariantIdx(idx);
    const targetVariant = product.variants?.[idx];
    if (targetVariant) {
      const item = getCartItemFromStorage(targetVariant._id);
      setIsInCart(!!item);
      setQuantity(item ? item.quantity : 1);
    }
  };

  // 💡 এক্সটার্নাল সিস্টেম (যেমন অন্য কম্পোনেন্ট থেকে স্টোরেজ আপডেট হলে) সিঙ্ক করার সাবস্ক্রিপশন ইফেক্ট
  useEffect(() => {
    const handleCartSync = () => {
      if (!currentVariant) return;
      const item = getCartItemFromStorage(currentVariant._id);
      setIsInCart(!!item);
      setQuantity(item ? item.quantity : 1);
    };

    window.addEventListener("storage", handleCartSync);
    window.addEventListener("cartUpdate", handleCartSync);
    return () => {
      window.removeEventListener("storage", handleCartSync);
      window.removeEventListener("cartUpdate", handleCartSync);
    };
  }, [currentVariant, getCartItemFromStorage]);

  let discountLabel = "";
  if (currentVariant?.offerPrice && currentVariant.offerPrice < originalPrice) {
    const calcDiscount = Math.round(
      ((originalPrice - currentVariant.offerPrice) / originalPrice) * 100,
    );
    discountLabel = `-${calcDiscount}% OFF`;
  }

  const isOutOfStock =
    product.totalStock <= 0 || (currentVariant && currentVariant.stock <= 0);

  const getWeightDisplay = (variant: IProductVariant): string => {
    if (variant?.weightId && typeof variant.weightId === "object") {
      const w = variant.weightId as IWeight;
      return `${w.value || ""}${w.unit || ""}`;
    }
    return "";
  };

  const formatSoldCount = (count: number): string => {
    if (count >= 1000)
      return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
    return `${count}`;
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const updateQuantity = (newQty: number) => {
    if (newQty < 1) return;

    setQuantity(newQty);

    if (isInCart && currentVariant) {
      try {
        const existingCart: ICartItem[] = JSON.parse(
          localStorage.getItem("cart") || "[]",
        );
        const existingItemIdx = existingCart.findIndex(
          (item) =>
            item.productId === product._id &&
            item.variantId === currentVariant._id,
        );

        if (existingItemIdx > -1) {
          existingCart[existingItemIdx].quantity = newQty;
          localStorage.setItem("cart", JSON.stringify(existingCart));

          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("cartUpdate"));
        }
      } catch (error) {
        console.error("Error updating dynamic quantity in cart:", error);
      }
    }
  };
  const handleCartAction = (silent = false) => {
    if (!currentVariant) return;
    try {
      let existingCart: ICartItem[] = JSON.parse(
        localStorage.getItem("cart") || "[]",
      );
      const weightText = getWeightDisplay(currentVariant);

      if (isInCart) {
        // 💡 এখানে currentVariant.id বাদ দিয়ে শুধু currentVariant._id রাখা হয়েছে
        existingCart = existingCart.filter(
          (item) =>
            !(
              item.productId === product._id &&
              item.variantId === currentVariant._id
            ),
        );
        localStorage.setItem("cart", JSON.stringify(existingCart));
        setIsInCart(false);
        setQuantity(1);

        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("cartUpdate"));

        if (!silent) {
          toast.info(`${product.name} (${weightText}) removed from cart!`);
        }
      } else {
        if (isOutOfStock) {
          toast.error("Product is out of stock!");
          return;
        }

        const cartItem: ICartItem = {
          productId: product._id,
          variantId: currentVariant._id || "",
          name: product.name,
          image: gallery[0],
          price: currentPrice,
          weight: weightText,
          quantity: quantity,
        };

        existingCart.push(cartItem);
        localStorage.setItem("cart", JSON.stringify(existingCart));
        setIsInCart(true);

        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("cartUpdate"));

        if (!silent) {
          toast.success(`${product.name} (${weightText}) added to cart!`);
        }
      }
    } catch (error) {
      console.error("Cart localstorage error:", error);
      toast.error("Failed to update cart.");
    }
  };
  const handleBuyNow = async () => {
    if (isOutOfStock || !currentVariant) return;

    // 💡 শুধু এই একটা প্রোডাক্ট — cart-এর অন্য কোনো আইটেম এখানে যুক্ত হচ্ছে না
    const singleItem: CartItem = {
      productId: product._id,
      variantId: currentVariant._id,
      name: product.name,
      image: gallery[0],
      price: currentPrice,
      weight: getWeightDisplay(currentVariant),
      quantity,
    };

    try {
      setBuyNowLoading(true);
      const payload = buildSingleItemCheckoutPayload(singleItem);
      await proceedToCheckout(payload, router);
      onClose();
    } finally {
      setBuyNowLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserWishlist = async () => {
      const userId = getUserIdFromToken();
      if (!userId) return;

      try {
        const res = await axiosInstance.get(`/wishlists/${userId}`);
        if (res.data?.success && res.data?.data?.products) {
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

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;

    const userId = getUserIdFromToken();

    if (!userId) {
      toast.error("Please log in first to add products to your wishlist!");
      return;
    }

    try {
      setWishlistLoading(true);

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
      console.error("Wishlist error:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const plainDescription = stripHtml(product.description || "");
  const needsTruncation = plainDescription.length >= 90;
  const truncatedPlainText = needsTruncation
    ? `${plainDescription.slice(0, 90)}...`
    : plainDescription;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[95vh] w-full max-w-[1100px] overflow-y-auto rounded-[24px] bg-white p-6 md:p-9 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F5] text-[#1E1E1E] transition-colors hover:bg-[#E9E9E9]"
        >
          <CloseIcon />
        </button>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Left Side: Product Gallery & Badges */}
          <div className="flex flex-col gap-5">
            <div className="relative flex h-[400px] w-full items-center justify-center rounded-2xl bg-[#FAFAFA] p-4 border border-[#F2F2F2]">
              <Image
                src={gallery[activeImageIndex]}
                alt={product.name}
                fill
                className="object-contain p-4 transition-all duration-300"
                unoptimized={gallery[activeImageIndex].startsWith("http")}
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <button
                onClick={handlePrevImage}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#E9E9E9] bg-white transition-colors hover:bg-[#FAFAFA]"
              >
                <ChevronLeft />
              </button>

              <div className="flex flex-1 gap-2 overflow-x-auto no-scrollbar py-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-[64px] w-[64px] flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      activeImageIndex === idx
                        ? "border-[#37651B] scale-105"
                        : "border-[#E9E9E9] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name}-${idx}`}
                      fill
                      className="object-cover"
                      unoptimized={img.startsWith("http")}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextImage}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#E9E9E9] bg-white transition-colors hover:bg-[#FAFAFA]"
              >
                <ChevronRight />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#E9E9E9] p-3 text-center bg-white">
                <div className="text-[#37651B]">
                  <TruckIcon />
                </div>
                <p className="subtext-large-medium text-[#1E1E1E]">
                  Same Day Delivery
                </p>
                <p className="text-[11px] text-[#7F8482]">In Barishal</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#E9E9E9] p-3 text-center bg-white">
                <div className="text-[#37651B]">
                  <BagIcon />
                </div>
                <p className="subtext-large-medium text-[#1E1E1E]">
                  Cash on Delivery
                </p>
                <p className="text-[11px] text-[#7F8482]">Available</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#E9E9E9] p-3 text-center bg-white">
                <div className="text-[#37651B]">
                  <BagIcon />
                </div>
                <p className="subtext-large-medium text-[#1E1E1E]">
                  100% Fresh & Natural
                </p>
                <p className="text-[11px] text-[#7F8482]">Guarantee</p>
              </div>
            </div>
          </div>

          {/* Right Side: Product Configuration Info */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="title-medium font-semibold text-[#1E1E1E] not-italic mb-1.5">
                {product.name}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#7F8482]">
                <div className="flex items-center gap-0.5 text-[#FFB321]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <span className="font-semibold text-[#1E1E1E] text-[14px]">
                  4.8
                </span>
                <span className="subtext-regular text-[#7F8482]">
                  (78 reviews)
                </span>
                {product.soldCount !== undefined && (
                  <>
                    <span className="text-[#E9E9E9]">|</span>
                    <span className="subtext-regular text-[#7F8482]">
                      {formatSoldCount(product.soldCount)} sold
                    </span>
                  </>
                )}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-[32px] font-bold text-[#37651B] font-aeonik">
                  ৳{currentPrice}
                </span>
                {currentVariant?.offerPrice && (
                  <span className="text-[18px] text-[#A0A0A0] line-through font-aeonik">
                    ৳{originalPrice}
                  </span>
                )}
                {discountLabel && (
                  <span className="rounded-md bg-[#FFEDE8] px-2 py-0.5 text-[12px] font-semibold text-[#FF5533]">
                    {discountLabel}
                  </span>
                )}
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="mt-5">
                  <h4 className="body-large-semibold !text-left text-[#1E1E1E] mb-2">
                    Weight / Size
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v: IProductVariant, idx: number) => {
                      const isSelected = selectedVariantIdx === idx;
                      return (
                        <button
                          key={v._id}
                          onClick={() => handleVariantChange(idx)} // 💡 চাইল্ড ক্লিক অ্যাকশনেই সরাসরি স্টেট সিঙ্ক হবে
                          className={`rounded-xl px-5 py-2 text-[14px] font-medium transition-all border ${
                            isSelected
                              ? "border-[#37651B] bg-[#37651B] text-white shadow-sm"
                              : "border-[#E9E9E9] bg-white text-[#3C3C3C] hover:border-[#37651B]"
                          }`}
                        >
                          {getWeightDisplay(v)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Quantity Controller */}
              <div className="mt-5">
                <h4 className="body-large-semibold !text-left text-[#1E1E1E] mb-2">
                  Quantity
                </h4>
                <div className="flex items-center gap-1 rounded-xl border border-[#E9E9E9] w-fit p-1 bg-[#FAFAFA]">
                  <button
                    onClick={() => updateQuantity(quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[18px] text-[#6B6B6B] transition-colors border border-transparent hover:border-[#E9E9E9] active:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-aeonik text-[15px] font-semibold text-[#1E1E1E]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[18px] text-[#6B6B6B] transition-colors border border-transparent hover:border-[#E9E9E9] active:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#F5F5F5] pt-5 sm:grid-cols-2">
                <div>
                  <h4 className="body-large-semibold !text-left text-[#1E1E1E] mb-1.5">
                    Product Description
                  </h4>

                  {showFullDescription ? (
                    <div
                      className="body-sm-regular text-[#6B6B6B] leading-relaxed [&>p]:mb-1.5 last:[&>p]:mb-0"
                      dangerouslySetInnerHTML={{
                        __html: product.description || "",
                      }}
                    />
                  ) : (
                    <p className="body-sm-regular text-[#6B6B6B] leading-relaxed">
                      {truncatedPlainText}
                    </p>
                  )}

                  {needsTruncation && (
                    <button
                      onClick={() => setShowFullDescription((p) => !p)}
                      className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-[#37651B] transition-all hover:underline"
                    >
                      {showFullDescription ? "Show less ↑" : "Read more ↓"}
                    </button>
                  )}
                </div>

                <div className="sm:border-l sm:border-[#F2F2F2] sm:pl-4">
                  <h4 className="body-large-semibold !text-left text-[#1E1E1E] mb-1.5">
                    Origin
                  </h4>
                  <p className="body-sm-regular font-semibold text-[#1E1E1E] flex items-center gap-1.5">
                    {product.productType === "International"
                      ? "🌐 Imported"
                      : "🇧🇩 Local Farm"}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#7F8482]">
                    Sourced from premium trusted fields, 100% natural,
                    eco-friendly processing.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Area */}
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCartAction(false)}
                  disabled={isOutOfStock && !isInCart}
                  className={`flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-all shadow-md ${
                    isInCart
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/10"
                      : "bg-[#37651B] hover:bg-[#2c5215] text-white shadow-[#37651b]/10"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <CartIcon />
                  {isInCart ? "Remove from Cart" : "Add to Cart"}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || buyNowLoading}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#37651B] bg-white text-[15px] font-semibold text-[#37651B] transition-all hover:bg-[#FBFDF9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <BagIcon />
                  {buyNowLoading ? "..." : "Buy Now"}
                </button>

                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 ${
                    isFavorite
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white border-[#E9E9E9] text-[#6B6B6B] hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                  } ${wishlistLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <HeartIcon filled={isFavorite} />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#F4F8F1] px-4 py-3.5 border border-[#E1ECD8]">
                <div className="flex items-center gap-2.5">
                  <div className="text-[#37651B]">
                    <TruckIcon />
                  </div>
                  <div>
                    <p className="subtext-large-medium text-[#274813]">
                      Delivery within 2 - 4 hours in Dhaka
                    </p>
                    <p className="text-[11px] text-[#55694c]">
                      Order before 4PM for same day shipment
                    </p>
                  </div>
                </div>
                <span className="text-[#37651B] font-bold text-[14px]">
                  &gt;
                </span>
              </div>
              <Link href={`/productdetails/${product._id}`}>
                <button className="flex items-center justify-center gap-1 text-[14px] font-semibold text-[#37651B] self-end mt-1 hover:underline">
                  View Full Product Details
                  <span className="text-[16px]">&rarr;</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopnowModal;
