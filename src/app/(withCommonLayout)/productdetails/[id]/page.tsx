"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axiosInstance from "@/src/api/axiosInstance";

// Types Imports
import { IProduct, IProductVariant, IWeight } from "@/src/types/product.interface";
import { CartItem } from "@/src/types/checkout.interface";
import { ICartItem, IReview, TabKey } from "@/src/types/productDetails.interface";

// API Imports
import { getProductById, getProductReviews, getUserWishlist } from "@/src/api/productDetails";

import {
  BagIcon,
  CartIcon,
  ChevronLeft,
  ChevronRight,
  HeartIcon,
  StarIcon,
  TruckIcon,
} from "@/src/svgIcon/svg";
import {
  buildSingleItemCheckoutPayload,
  proceedToCheckout,
} from "@/src/utils/checkoutFlow";
import RelatedPructs from "@/src/components/home/RelatedProduct";

// ───────────────────────────────────────────
//  Helpers
// ───────────────────────────────────────────
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
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded._id || decoded.id || null;
  } catch {
    return null;
  }
};

const formatSoldCount = (count: number): string => {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  return `${count}`;
};

// ───────────────────────────────────────────
//  Page Component
// ───────────────────────────────────────────
const ProductDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<TabKey>("Description");

  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);
  const [buyNowLoading, setBuyNowLoading] = useState<boolean>(false);
  const [isInCart, setIsInCart] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  // Reviews
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
  const [avgRating, setAvgRating] = useState<number>(4.8);

  // ── Fetch product by _id ──
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(err.message || "Could not load product details.");
        } else {
          toast.error("Could not load product details.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // ── Fetch reviews ──
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?._id) return;
      setReviewsLoading(true);
      try {
        const list = await getProductReviews(product._id);
        setReviews(list);
        if (list.length > 0) {
          const avg = list.reduce((sum, r) => sum + (r.rating || 0), 0) / list.length;
          setAvgRating(Number(avg.toFixed(1)));
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [product?._id]);

  // ── Cart sync helpers ──
  const getCartItemFromStorage = useCallback(
    (variantId: string): ICartItem | null => {
      if (typeof window === "undefined" || !product) return null;
      try {
        const existingCart: ICartItem[] = JSON.parse(
          localStorage.getItem("cart") || "[]"
        );
        return (
          existingCart.find(
            (item) => item.productId === product._id && item.variantId === variantId
          ) || null
        );
      } catch {
        return null;
      }
    },
    [product]
  );

  // ── Single Unified Cart Sync Effect ──
  useEffect(() => {
    const handleCartSync = () => {
      if (!product?.variants?.length) return;

      const variant = product.variants[selectedVariantIdx];
      if (!variant) return;

      const item = getCartItemFromStorage(variant._id);
      setIsInCart(!!item);
      setQuantity(item ? item.quantity : 1);
    };

    handleCartSync();

    window.addEventListener("storage", handleCartSync);
    window.addEventListener("cartUpdate", handleCartSync);

    return () => {
      window.removeEventListener("storage", handleCartSync);
      window.removeEventListener("cartUpdate", handleCartSync);
    };
  }, [product, selectedVariantIdx, getCartItemFromStorage]);

  // ── Wishlist check ──
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!product?._id) return;
      const userId = getUserIdFromToken();
      if (!userId) return;
      try {
        const resData = await getUserWishlist(userId);
        if (resData?.success && resData?.data?.products) {
          const exist = resData.data.products.some(
            (item: { productId?: { _id?: string } | string }) => {
              const prodId = typeof item.productId === "object" ? item.productId?._id : item.productId;
              return (prodId || "").toString() === product._id.toString();
            }
          );
          setIsFavorite(exist);
        }
      } catch (err) {
        console.error("Wishlist fetch failed:", err);
      }
    };
    fetchWishlist();
  }, [product?._id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 animate-pulse">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="h-[400px] bg-gray-100 rounded-2xl" />
          <div className="flex flex-col gap-4">
            <div className="h-6 w-1/3 bg-gray-100 rounded" />
            <div className="h-8 w-2/3 bg-gray-100 rounded" />
            <div className="h-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-[15px] text-[#7F8482]">Product not found.</p>
      </div>
    );
  }

  const gallery = product.images && product.images.length > 0 ? product.images : ["/img/card.png"];
  const currentVariant = product.variants?.[selectedVariantIdx] || product.variants?.[0];
  const originalPrice = currentVariant?.originalPrice || 0;
  const currentPrice = currentVariant?.offerPrice || originalPrice;

  let discountLabel = "";
  if (currentVariant?.offerPrice && currentVariant.offerPrice < originalPrice) {
    const calcDiscount = Math.round(((originalPrice - currentVariant.offerPrice) / originalPrice) * 100);
    discountLabel = `${calcDiscount}% OFF`;
  }

  const isOutOfStock = product.totalStock <= 0 || (currentVariant && currentVariant.stock <= 0);

  const getWeightDisplay = (variant: IProductVariant): string => {
    if (variant?.weightId && typeof variant.weightId === "object") {
      const w = variant.weightId as IWeight;
      return `${w.value || ""}${w.unit || ""}`;
    }
    return "";
  };

  const categoryName = typeof product.categoryId === "object"
    ? (product.categoryId as { _id: string; name: string }).name
    : "";

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
        const existingCart: ICartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
        const idx = existingCart.findIndex(
          (item) => item.productId === product._id && item.variantId === currentVariant._id
        );
        if (idx > -1) {
          existingCart[idx].quantity = newQty;
          localStorage.setItem("cart", JSON.stringify(existingCart));
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("cartUpdate"));
        }
      } catch (err) {
        console.error("Error updating quantity:", err);
      }
    }
  };

  const handleCartAction = () => {
    if (!currentVariant) return;
    try {
      let existingCart: ICartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
      const weightText = getWeightDisplay(currentVariant);

      if (isInCart) {
        existingCart = existingCart.filter(
          (item) => !(item.productId === product._id && item.variantId === currentVariant._id)
        );
        localStorage.setItem("cart", JSON.stringify(existingCart));
        setIsInCart(false);
        setQuantity(1);
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("cartUpdate"));
        toast.info(`${product.name} (${weightText}) removed from cart!`);
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
          quantity,
        };
        existingCart.push(cartItem);
        localStorage.setItem("cart", JSON.stringify(existingCart));
        setIsInCart(true);
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("cartUpdate"));
        toast.success(`${product.name} (${weightText}) added to cart!`);
      }
    } catch (err) {
      console.error("Cart localstorage error:", err);
      toast.error("Failed to update cart.");
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock || !currentVariant) return;
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
    } finally {
      setBuyNowLoading(false);
    }
  };

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
        userId,
      });
      if (res.data?.success) {
        setIsFavorite((prev) => !prev);
        toast[isFavorite ? "info" : "success"](
          isFavorite ? "Removed from wishlist!" : "Added to wishlist!"
        );
      } else {
        toast.error(res.data?.message || "Failed to update wishlist");
      }
    } catch (err: unknown) {
      interface IAxiosErrorLike {
        response?: { data?: { message?: string } };
      }
      const axiosError = err as IAxiosErrorLike;
      toast.error(axiosError.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const tabs: TabKey[] = ["Description", "Origin", "Storage & Shipping Info", "Reviews"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* ── Breadcrumb ── */}
      <div className="mb-5 flex items-center gap-1.5 text-[13px] text-[#7F8482]">
        <Link href="/" className="hover:text-[#37651B]">Home</Link>
        <span>&gt;</span>
        {categoryName && (
          <>
            <Link href="/shopnow" className="hover:text-[#37651B]">{categoryName}</Link>
            <span>&gt;</span>
          </>
        )}
        <span className="text-[#1E1E1E] font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* ── Left: Gallery ── */}
        <div className="flex flex-col gap-3">
          <div className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-[#FAFAFA] border border-[#F2F2F2]">
            <Image
              src={gallery[activeImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized={gallery[activeImageIndex].startsWith("http")}
            />
          </div>

          <div className="flex items-center gap-2">
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
        </div>

        {/* ── Right: Info ── */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {categoryName && (
              <span className="rounded-full bg-[#F4F8F1] px-3 py-1 text-[12px] font-medium text-[#37651B]">
                {categoryName}
              </span>
            )}
            {product.productType === "Local" && (
              <span className="rounded-full bg-[#F4F8F1] px-3 py-1 text-[12px] font-medium text-[#37651B]">
                Local Farm
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                isOutOfStock ? "bg-red-50 text-red-500" : "bg-[#F4F8F1] text-[#37651B]"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </span>
          </div>

          <h1 className="!text-left !text-[28px] font-semibold text-[#1E1E1E] mb-2">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#7F8482] mb-4">
            <div className="flex items-center gap-0.5 text-[#FFB321]">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} />
              ))}
            </div>
            <span className="font-semibold text-[#1E1E1E] text-[14px]">{avgRating}</span>
            <span className="subtext-regular text-[#7F8482]">({reviews.length} reviews)</span>
            {product.soldCount !== undefined && (
              <>
                <span className="text-[#E9E9E9]">|</span>
                <span className="subtext-regular text-[#7F8482]">
                  {formatSoldCount(product.soldCount)} sold
                </span>
              </>
            )}
          </div>

          {/* Weight / Size */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-4">
              <h4 className="body-large-semibold !text-left text-[#1E1E1E] mb-2">Weight / Size</h4>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v: IProductVariant, idx: number) => {
                  const isSelected = selectedVariantIdx === idx;
                  return (
                    <button
                      key={v._id}
                      onClick={() => setSelectedVariantIdx(idx)}
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

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[32px] font-bold text-[#37651B] font-aeonik">৳{currentPrice}</span>
            {currentVariant?.offerPrice && currentVariant.offerPrice < originalPrice && (
              <span className="text-[18px] text-[#A0A0A0] line-through font-aeonik">৳{originalPrice}</span>
            )}
            {discountLabel && (
              <span className="rounded-md bg-[#FFEDE8] px-2 py-0.5 text-[12px] font-semibold text-[#FF5533]">
                {discountLabel}
              </span>
            )}
          </div>

          {/* Quantity */}
          <div className="mb-5">
            <h4 className="body-large-semibold !text-left text-[#1E1E1E] mb-2">Quantity</h4>
            <div className="flex items-center gap-1 rounded-xl border border-[#E9E9E9] w-fit p-1 bg-[#FAFAFA]">
              <button
                onClick={() => updateQuantity(quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[18px] text-[#6B6B6B] border border-transparent hover:border-[#E9E9E9]"
              >
                −
              </button>
              <span className="w-10 text-center font-aeonik text-[15px] font-semibold text-[#1E1E1E]">{quantity}</span>
              <button
                onClick={() => updateQuantity(quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[18px] text-[#6B6B6B] border border-transparent hover:border-[#E9E9E9]"
              >
                +
              </button>
            </div>
          </div>

          {/* Delivery banner */}
          <div className="flex items-center justify-between rounded-xl bg-[#F4F8F1] px-4 py-3.5 border border-[#E1ECD8] mb-5">
            <div className="flex items-center gap-2.5">
              <div className="text-[#37651B]"><TruckIcon /></div>
              <div>
                <p className="subtext-large-medium text-[#274813]">Same Day Delivery if ordered before 12 PM</p>
                <p className="text-[11px] text-[#55694c]">Delivery in Barishal</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#7F8482]">Estimated:</p>
              <p className="text-[12px] font-semibold text-[#274813]">Today, 6-8 PM</p>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCartAction}
              disabled={isOutOfStock && !isInCart}
              className={`flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-all shadow-md ${
                isInCart
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-[#37651B] hover:bg-[#2c5215] text-white"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <CartIcon />
              {isInCart ? "Remove from Cart" : "Add to Cart"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || buyNowLoading}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#37651B] bg-white text-[15px] font-semibold text-[#37651B] hover:bg-[#FBFDF9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BagIcon />
              {buyNowLoading ? "..." : "Buy Now"}
            </button>

            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border ${
                isFavorite ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-[#E9E9E9]"
              }`}
            >
              <HeartIcon filled={isFavorite} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs Section ── */}
      <div className="mt-10">
        <div className="flex items-center gap-6 border-b border-[#E9E9E9] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative whitespace-nowrap pb-3 text-[14px] font-semibold transition-colors ${
                activeTab === tab ? "text-[#37651B]" : "text-[#7F8482] hover:text-[#1E1E1E]"
              }`}
            >
              {tab === "Reviews" ? `Reviews (${reviews.length})` : tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#37651B] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === "Description" && (
            <div
              className="body-sm-regular text-[#6B6B6B] leading-relaxed max-w-3xl [&>p]:mb-2 last:[&>p]:mb-0"
              dangerouslySetInnerHTML={{ __html: product.description || "" }}
            />
          )}

          {activeTab === "Origin" && (
            <div className="max-w-3xl">
              <p className="body-sm-regular font-semibold text-[#1E1E1E] flex items-center gap-1.5 mb-2">
                {product.productType === "International" ? "🌐 Imported" : "🇧🇩 Local Farm"}
              </p>
              <p className="body-sm-regular text-[#6B6B6B] leading-relaxed">
                Sourced from premium trusted fields, 100% natural, eco-friendly processing.
              </p>
            </div>
          )}

          {activeTab === "Storage & Shipping Info" && (
            <div className="max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#E9E9E9] p-4">
                <p className="body-large-semibold !text-left text-[#1E1E1E] mb-1.5">Storage</p>
                <p className="body-sm-regular text-[#6B6B6B]">
                  Store in a cool, dry place away from direct sunlight.
                </p>
              </div>
              <div className="rounded-xl border border-[#E9E9E9] p-4">
                <p className="body-large-semibold !text-left text-[#1E1E1E] mb-1.5">Shipping</p>
                <p className="body-sm-regular text-[#6B6B6B]">
                  Same day delivery available in Barishal.
                </p>
              </div>
            </div>
          )}

          {activeTab === "Reviews" && (
            <div className="max-w-3xl flex flex-col gap-4">
              {reviewsLoading ? (
                <div className="flex flex-col gap-3 animate-pulse">
                  <div className="h-20 bg-gray-100 rounded-xl" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-[13px] text-[#7F8482]">No reviews yet for this product.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="rounded-xl border border-[#E9E9E9] p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[14px] font-semibold text-[#1E1E1E]">{review.userId?.name || "Anonymous"}</p>
                      <span className="text-[11px] text-[#7F8482]">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-[#FFB321] mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < review.rating ? "" : "opacity-25"}><StarIcon /></span>
                      ))}
                    </div>
                    <p className="body-sm-regular text-[#6B6B6B]">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div className="flex flex-wrap items-center gap-3 mt-2 mb-10">
        <span className="flex items-center gap-1.5 rounded-full bg-[#F4F8F1] px-3 py-1.5 text-[12px] font-medium text-[#37651B]">
          ✅ 100% Organic
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#F4F8F1] px-3 py-1.5 text-[12px] font-medium text-[#37651B]">
          🌱 Farm Fresh
        </span>
      </div>
      <RelatedPructs></RelatedPructs>
    </div>
  );
};

export default ProductDetailsPage;