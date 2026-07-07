"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CartItem } from "@/src/types/checkout.interface";

const CheckoutSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [isCleanedUp, setIsCleanedUp] = useState(false);

  useEffect(() => {
    // 💡 পেমেন্ট সফল হয়েছে (ব্যাকএন্ড থেকেই কনফার্মড redirect) —
    // এখন নিরাপদে localStorage থেকে শুধু এই অর্ডারে যাওয়া আইটেমগুলো cart থেকে বাদ দেওয়া হচ্ছে
    try {
      const pendingRaw = sessionStorage.getItem("pendingOrderItems");
      const orderedItems: CartItem[] = pendingRaw ? JSON.parse(pendingRaw) : [];

      // checkoutOrder টেম্পোরারি ডেটা মুছে দেওয়া হলো
      localStorage.removeItem("checkoutOrder");

      if (orderedItems.length > 0) {
        const mainCartKey = localStorage.getItem("cart") ? "cart" : "cartItems";
        const rawCart = localStorage.getItem(mainCartKey);

        if (rawCart) {
          const currentCartItems: CartItem[] = JSON.parse(rawCart);
          const remainingItems = currentCartItems.filter(
            (cartItem) =>
              !orderedItems.some(
                (ordered) =>
                  ordered.productId === cartItem.productId &&
                  ordered.variantId === cartItem.variantId,
              ),
          );
          localStorage.setItem(mainCartKey, JSON.stringify(remainingItems));
        }
      }

      // 💡 ব্যবহার শেষ হওয়ার পর sessionStorage থেকে temp data সরিয়ে ফেলা হলো
      sessionStorage.removeItem("pendingOrderItems");

      // 💡 Navbar-এর cart count ও অন্য কম্পোনেন্টকে রিয়েল-টাইমে জানানো
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Failed to clean up cart after successful payment:", error);
    } finally {
      setIsCleanedUp(true);
    }
  }, []);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EBF0E8]">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="19" stroke="#37651B" strokeWidth="2" />
          <path
            d="M12 20.5L17 25.5L28 14.5"
            stroke="#37651B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h4 className="mt-6 text-[24px] font-bold text-[#1E1E1E] font-montserrat">
        Order Placed Successfully! 🎉
      </h4>
      <p className="body-regular text-[#6B6B6B]">
        Thank you for your order. Your payment has been confirmed
        {orderId && (
          <>
            {" "}
            and your order ID is{" "}
            <span className="font-semibold text-[#1E1E1E]">{orderId}</span>
          </>
        )}
        .
      </p>

      {isCleanedUp && (
        <p className="mt-1 body-sm-regular text-[#A0A0A0]">
          Your cart has been updated.
        </p>
      )}

      <div className="mt-8 flex items-center gap-3 ">
        <button
          onClick={() => router.push("/")}
          className="rounded-xl bg-[#37651B] px-6 py-2.5 body-sm-regular text-white hover:bg-[#2c5215]"
        >
          Continue Shopping
        </button>

      </div>
    </div>
  );
};

const CheckoutSuccessPage = () => (
  <Suspense fallback={<div className="py-20 text-center text-[#6B6B6B]">Loading...</div>}>
    <CheckoutSuccessContent />
  </Suspense>
);

export default CheckoutSuccessPage;