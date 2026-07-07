"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackArrowIcon, PinIcon, TrashIcon } from "@/src/svgIcon/svg";

// Separate Imports
import { CartItem, ICoupon, IDecodedToken } from "@/src/types/cart.interface";
import { getAvailableCoupons, checkUserAddress } from "@/src/api/cart";

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DELIVERY_CHARGE = 50;
const CART_STORAGE_KEY = "cart";

const normalizeCartItems = (parsed: CartItem[]): CartItem[] =>
  parsed.map((item) => ({
    ...item,
    quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
    price: item.price || 0,
  }));

const readCartFromStorage = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed: CartItem[] = raw ? JSON.parse(raw) : [];
    return normalizeCartItems(parsed);
  } catch (error) {
    console.error("Failed to parse cart from localStorage:", error);
    return [];
  }
};

const getUserIdFromToken = (token: string): string | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload) as IDecodedToken;
    return decoded.id || decoded._id || decoded.userId || null;
  } catch (e) {
    return null;
  }
};

const ShopnowCartPage: React.FC = () => {
  const router = useRouter();
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return readCartFromStorage();
  });

  const [availableCoupons, setAvailableCoupons] = useState<ICoupon[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState<string[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState<boolean>(true);
  const [checkingAddress, setCheckingAddress] = useState<boolean>(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const activeCoupons = await getAvailableCoupons();
        setAvailableCoupons(activeCoupons);
      } catch (error) {
        console.error("Failed to load coupons:", error);
      } finally {
        setLoadingCoupons(false);
      }
    };
    fetchCoupons();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        setCartItems(readCartFromStorage());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const persistCart = (itemsList: CartItem[]) => {
    setCartItems(itemsList);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(itemsList));
    window.dispatchEvent(new Event("storage"));
  };

  const updateQuantity = (index: number, delta: number) => {
    if (!cartItems) return;
    const updated = cartItems.map((item, idx) =>
      idx === index
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item,
    );
    persistCart(updated);
  };

  const removeItem = (index: number) => {
    if (!cartItems) return;
    const updated = cartItems.filter((_, idx) => idx !== index);
    persistCart(updated);
  };

  const items = cartItems ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const discount = appliedCoupons.reduce((totalPrice, code) => {
    const coupon = availableCoupons.find((c) => c.code === code);
    if (!coupon || subtotal < coupon.minOrderAmount) return totalPrice;
    const raw = (subtotal * coupon.discountPercentage) / 100;
    return totalPrice + Math.min(raw, coupon.maxDiscountAmount);
  }, 0);

  const deliveryCharge = items.length > 0 ? DELIVERY_CHARGE : 0;
  const total = Math.max(0, subtotal + deliveryCharge - discount);

  const buildCheckoutOrderPayload = () => ({
    items,
    subtotal,
    deliveryCharge,
    discount,
    appliedCoupons,
    total,
  });

  const handleProceedToCheckout = async () => {
    const orderPayload = buildCheckoutOrderPayload();
    localStorage.setItem("checkoutOrder", JSON.stringify(orderPayload));

    const token = localStorage.getItem("token") || localStorage.getItem("refreshToken");
    if (!token) {
      router.push("/checkout-withoutsaveandlogout");
      return;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      router.push("/checkout-withoutsaveandlogout");
      return;
    }

    try {
      setCheckingAddress(true);
      const hasSavedAddress = await checkUserAddress(userId);

      if (hasSavedAddress) {
        router.push("/checkout-alreadysaveaddress");
      } else {
        router.push("/checkout-withoutsaveandlogout");
      }
    } catch (error) {
      console.error("Address flow error:", error);
      router.push("/checkout-alreadysaveaddress");
    } finally {
      setCheckingAddress(false);
    }
  };

  const applyCouponCode = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    const coupon = availableCoupons.find((c) => c.code === trimmed);
    if (!coupon) {
      alert("Invalid coupon code");
      return;
    }
    if (appliedCoupons.includes(trimmed)) {
      alert("Coupon already applied");
      return;
    }
    if (subtotal < coupon.minOrderAmount) {
      alert(`Minimum order ৳${coupon.minOrderAmount} required for this coupon`);
      return;
    }

    setAppliedCoupons((prev) => [...prev, trimmed]);
    setCouponInput("");
  };

  const removeCoupon = (code: string) => {
    setAppliedCoupons((prev) => prev.filter((c) => c !== code));
  };

  if (cartItems === null) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-[#7F8482]">
        <Link href="/" className="hover:text-[#37651B] body-medium">
          Home
        </Link>
        <span>&gt;</span>
        <span className="body-medium">Shopping cart</span>
      </div>

      {/* Heading */}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex h-8 w-8 items-center justify-center"
        >
          <BackArrowIcon />
        </button>
        <h4>
          Shopping Cart ({items.length} {items.length === 1 ? "Item" : "Items"})
        </h4>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-[#E9E9E9] bg-[#FAFAFA] py-16 text-center">
          <p className="body-large-medium text-[#6B6B6B]">
            Your cart is empty.
          </p>
          <Link
            href="/"
            className="rounded-xl bg-[#37651B] px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-[#2c5215]"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
            {/* ---------- Product Table ---------- */}
            <div className="overflow-x-auto rounded-2xl border border-[#E9E9E9] bg-white">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr className="border-b border-[#F2F2F2] text-left text-[13px] text-[#7F8482]">
                    <th className="px-5 py-4 font-medium">Product</th>
                    <th className="px-3 py-4 font-medium">Price</th>
                    <th className="px-3 py-4 font-medium">Quantity</th>
                    <th className="px-3 py-4 font-medium">Subtotal</th>
                    <th className="px-5 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={`${item.productId}-${item.variantId}-${index}`}
                      className="border-b border-[#F5F5F5] last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#FAFAFA]">
                            <Image
                              src={item.image || "/img/card.png"}
                              alt={item.name}
                              fill
                              className="object-cover"
                              unoptimized={item.image?.startsWith("http")}
                            />
                          </div>
                          <div>
                            <p className="body-medium font-semibold text-[#1E1E1E]">
                              {item.name}
                            </p>
                            {item.weight && (
                              <p className="text-[12px] text-[#7F8482]">
                                {item.weight}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-[14px] text-[#1E1E1E]">
                        ৳{item.price.toLocaleString()}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-1 rounded-xl border border-[#E9E9E9] w-fit p-1 bg-[#FAFAFA]">
                          <button
                            onClick={() => updateQuantity(index, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[16px] text-[#6B6B6B] border border-transparent hover:border-[#E9E9E9]"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-[14px] font-semibold text-[#1E1E1E]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(index, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[16px] text-[#6B6B6B] border border-transparent hover:border-[#E9E9E9]"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-[14px] font-semibold text-[#37651B]">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => removeItem(index)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E9E9E9] text-[#6B6B6B] hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ---------- Order Summary ---------- */}
            <div className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E9] bg-[#FAFAFA] p-5">
              <h3 className="title-medium !text-left font-semibold text-[#1E1E1E]">
                Order Summary
              </h3>

              <div className="flex items-center justify-between subtext-medium text-[#6B6B6B]">
                <span>Subtotal ({items.length} items)</span>
                <span className="text-[#1E1E1E]">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between subtext-medium text-[#6B6B6B]">
                <span>Delivery Charge</span>
                <span className="text-[#1E1E1E]">৳{deliveryCharge}</span>
              </div>

              {appliedCoupons.map((code) => {
                const coupon = availableCoupons.find((c) => c.code === code);
                if (!coupon) return null;
                const couponDiscount = Math.min(
                  (subtotal * coupon.discountPercentage) / 100,
                  coupon.maxDiscountAmount,
                );
                return (
                  <div
                    key={code}
                    className="flex items-center justify-between text-[14px] text-[#37651B]"
                  >
                    <span>Discount ({code})</span>
                    <span>
                      -৳{couponDiscount.toLocaleString()}
                    </span>
                  </div>
                );
              })}

              <div className="border-t border-[#E9E9E9] pt-3 flex items-center justify-between">
                <span className="body-large-semibold !text-left text-[#1E1E1E]">
                  Total
                </span>
                <span className="body-large-semibold font-bold text-[#37651B]">
                  ৳{total.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={checkingAddress}
                className="mt-2 flex h-12 items-center justify-center rounded-xl bg-[#37651B] body-medium text-white transition-all hover:bg-[#2c5215] disabled:opacity-60"
              >
                {checkingAddress ? "Checking..." : "Proceed to Checkout"}
              </button>

              <Link
                href="/"
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#E9E9E9] bg-white body-medium text-[#1E1E1E] transition-all hover:bg-[#FAFAFA]"
              >
                Continue Shopping
                <PinIcon />
              </Link>
            </div>
          </div>

          {/* ---------- Coupon Code Row ---------- */}
          <div className="mt-6 grid grid-cols-1 gap-6 rounded-2xl border border-[#E9E9E9] bg-white p-5 sm:grid-cols-2">
            <div>
              <p className="body-large-semibold !text-left text-[#1E1E1E] mb-2">
                Have a coupon code?
              </p>
              <div className="flex items-center gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && applyCouponCode(couponInput)
                  }
                  placeholder="Enter coupon code"
                  className="flex-1 rounded-xl border border-[#E9E9E9] bg-[#FAFAFA] px-4 py-2.5 text-[14px] text-[#1E1E1E] outline-none focus:border-[#37651B]"
                />
                <button
                  onClick={() => applyCouponCode(couponInput)}
                  className="rounded-xl bg-[#37651B] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#2c5215]"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="sm:border-l sm:border-[#F2F2F2] sm:pl-6">
              <div className="flex items-center justify-between">
                <p className="body-large-semibold !text-left text-[#1E1E1E]">
                  Applied Coupon
                </p>
                {discount > 0 && (
                  <div className="text-right">
                    <p className="text-[12px] text-[#7F8482]">You Saved</p>
                    <p className="text-[16px] font-bold text-[#37651B]">
                      ৳{discount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {appliedCoupons.length === 0 ? (
                  <p className="text-[13px] text-[#7F8482]">
                    No coupon applied yet.
                  </p>
                ) : (
                  appliedCoupons.map((code) => (
                    <span
                      key={code}
                      className="flex items-center gap-1.5 rounded-lg bg-[#F4F8F1] px-3 py-1.5 text-[13px] font-medium text-[#274813]"
                    >
                      {code}
                      <button
                        onClick={() => removeCoupon(code)}
                        className="text-[#274813] hover:text-red-500"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ---------- Available Coupons ---------- */}
          <div className="mt-6">
            <p className="body-large-semibold !text-left text-[#1E1E1E]">
              Available Coupons
            </p>
            <p className="text-[13px] text-[#7F8482] mb-3">
              Choose a coupon to save more on your order
            </p>

            {loadingCoupons ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-44 bg-gray-100 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {availableCoupons.map((coupon, idx) => {
                  const alreadyApplied = appliedCoupons.includes(coupon.code);
                  const isFresh = coupon.code === "FRESH10";
                  const accentColor = isFresh ? "#37651B" : "#7C3AED";

                  return (
                    <div
                      key={`${coupon._id}-${idx}`}
                      className="flex flex-col gap-3 rounded-xl border border-[#E9E9E9] bg-white p-4"
                    >
                      <div className="flex items-center gap-2">
                        <div style={{ color: accentColor }}>
                          <LocationIcon />
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-[#1E1E1E]">
                            {coupon.code}
                          </p>
                          <p
                            className="text-[12px] font-semibold"
                            style={{ color: accentColor }}
                          >
                            - {coupon.discountPercentage}% OFF
                          </p>
                        </div>
                      </div>
                      <div className="text-[12px] text-[#7F8482] leading-relaxed">
                        <p>Min order ৳{coupon.minOrderAmount.toLocaleString()}</p>
                        <p>Max discount ৳{coupon.maxDiscountAmount.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => applyCouponCode(coupon.code)}
                        disabled={alreadyApplied}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E9E9E9] py-2 text-[13px] font-semibold text-[#1E1E1E] transition-all hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {alreadyApplied ? "Applied" : "Apply"}
                        {!alreadyApplied && <PinIcon />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ShopnowCartPage;