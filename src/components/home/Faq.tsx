"use client";
import React, { useState, useMemo } from "react";
// 🎯 TanStack Query এর প্রয়োজনীয় প্রোভাইডার ও ক্লায়েন্ট ইমপোর্ট
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
import ShareButton from "../shared/button/ShareButton";
import { useFaqs, IFaq } from "@/src/hooks/useFaqs";

// লোকাল ক্লায়েন্ট ইনিশিয়ালাইজেশন (রেন্ডারের বাইরে রাখা হয়েছে যেন বারবার ক্রিয়েট না হয়)
const localQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// মেইন ফাংশনাল কম্পোনেন্ট (ভেতরের লজিক)
const FaqContent = () => {
  const { faqs, isLoading, error } = useFaqs();
  const [openId, setOpenId] = useState<string | null>(null);

  // 🎯 শুধুমাত্র 'Active' FAQ গুলো ফিল্টার করে নেওয়া হলো
  const activeFaqs = useMemo(() => {
    return faqs?.filter((item: IFaq) => item.status === "Active") || [];
  }, [faqs]);

  // 🎯 ডেরিভেটিভ লজিক: কোনো FAQ ওপেন না থাকলে এবং ডেটা থাকলে প্রথমটির আইডি সেট হবে (Effect ছাড়া)
  const currentOpenId = openId || (activeFaqs.length > 0 ? (activeFaqs[0]._id || String(activeFaqs[0].question)) : null);

  const toggleFaq = (id: string) => {
    // যদি ডিফল্ট ওপেন করা FAQ-টিতে ক্লিক করা হয় এবং openId স্টেট এখনো null থাকে
    // তবে সেটাকে এক্সপ্লিসিটলি হ্যান্ডেল করার জন্য এই লজিক
    const activeFirstId = activeFaqs[0]?._id || String(activeFaqs[0]?.question);
    if (openId === null && id === activeFirstId) {
      setOpenId("CLOSED"); // প্রথম FAQ বন্ধ করতে একটি টোকেন স্টেট
    } else {
      setOpenId(currentOpenId === id ? "CLOSED" : id);
    }
  };

  return (
    <div className="w-full max-w-[900px] mx-auto py-10 flex flex-col items-center px-4 md:px-0">
      {/* Title & Subtitle Area */}
      <div className="text-center mb-10">
        <h4 className="h4 text-[#0E2038]">Frequently Asked Questions</h4>
        <p className="body-regular mt-2 text-[#595F66]">
          Got questions? We've got answers. Find everything you need to know below.
        </p>
      </div>

      {/* ─── ⏳ LOADING SKELETON STATE ─── */}
      {isLoading && (
        <div className="w-full flex flex-col gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="w-full bg-slate-50/50 border border-[#EBF0E8] rounded-[16px] p-6 animate-pulse h-[82px]" />
          ))}
        </div>
      )}

      {/* ─── ❌ ERROR STATE ─── */}
      {error && !isLoading && (
        <div className="text-center py-6 text-rose-500 font-medium">
          Failed to sync FAQ cluster nodes. Please try refreshing.
        </div>
      )}

      {/* ─── 🎉 ACCORDION WRAPPER (DYNAMIC) ─── */}
      {!isLoading && !error && (
        <div className="w-full flex flex-col gap-3">
          {activeFaqs.length > 0 ? (
            activeFaqs.map((item: IFaq) => {
              const itemId = item._id || String(item.question); 
              // 🎯 আমাদের ডিরাইভড আইডি-র সাথে চেক হচ্ছে
              const isOpen = currentOpenId === itemId;

              return (
                <div
                  key={itemId}
                  className={`w-full bg-white border border-[#EBF0E8] rounded-[16px] p-6 transition-all duration-300 ${
                    isOpen ? "min-h-[134px]" : "min-h-[82px] cursor-pointer"
                  }`}
                  onClick={() => !isOpen && toggleFaq(itemId)} 
                >
                  <div
                    className="flex justify-between items-center gap-4 cursor-pointer select-none"
                    onClick={(e) => {
                      if (isOpen) {
                        e.stopPropagation();
                        toggleFaq(itemId);
                      }
                    }}
                  >
                    <h4 className="subtext-large-medium text-[#0E2038]">
                      {item.question}
                    </h4>

                    <div className="flex-shrink-0">
                      {isOpen ? (
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16Z" fill="#EBF0E8" />
                          <path d="M21 18.5L16 13.5L11 18.5" stroke="#37651B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32C24.8366 32 32 24.8366 32 16Z" fill="#EBF0E8" />
                          <path d="M21 13.5L16 18.5L11 13.5" stroke="#37651B" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 mt-3"
                        : "grid-rows-[0fr] opacity-0 overflow-hidden"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="subtext-large-medium text-[#7F8482]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              No active frequently asked questions found.
            </div>
          )}
        </div>
      )}


    </div>
  );
};

// মেইন এক্সপোর্ট
export default function Faq() {
  return (
    <QueryClientProvider client={localQueryClient}>
      <FaqContent />
    </QueryClientProvider>
  );
}