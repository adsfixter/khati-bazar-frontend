"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CheckoutFailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    try {
      sessionStorage.removeItem("pendingOrderItems");
    } catch (error) {
      console.error("Failed to clear pending order session data:", error);
    }
  }, []);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="20" cy="20" r="19" stroke="#DC2626" strokeWidth="2" />
          <path
            d="M14 14L26 26M26 14L14 26"
            stroke="#DC2626"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h4 className="mt-6 text-[24px] font-bold text-[#1E1E1E] font-montserrat">
        Payment Failed
      </h4>
      <p className="mt-2 body-regular text-[#6B6B6B]">
        Your payment could not be completed
        {orderId && (
          <>
            {" "}
            for order{" "}
            <span className="font-semibold text-[#1E1E1E]">{orderId}</span>
          </>
        )}
        . Don&apos;t worry — your cart items are still saved, you can try again
        anytime.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => router.push("/checkout-alreadysaveaddress")}
          className="rounded-xl bg-[#37651B] px-6 py-2.5 body-sm-regular font-semibold text-white hover:bg-[#2c5215]"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push("/shopping-cart")}
          className="rounded-xl border border-[#E9E9E9] bg-white px-6 py-2.5 body-sm-regular font-semibold text-[#1E1E1E] hover:bg-[#FAFAFA]"
        >
          Go to Cart
        </button>
      </div>
    </div>
  );
};

export default CheckoutFailPage;
