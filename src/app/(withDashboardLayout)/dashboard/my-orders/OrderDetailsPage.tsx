"use client";

import React from "react";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, MapPin, CreditCard, Calendar, Star, RefreshCw, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useDeliverySlot } from "@/src/hooks/useDeliverySlot";
import { useGetOrderTracking } from "@/src/hooks/useTracking";
import { useAddress } from "@/src/hooks/useAddressData";
import Link from "next/link";

interface OrderDetailsProps {
  orderData: any; 
  onBack: () => void;
}

export default function OrderDetailsPage({ orderData, onBack }: OrderDetailsProps) {
  const isDelivered = orderData?.orderStatus === "Delivered";
  
  // ১. ডাইনামিক ট্র্যাকিং ডাটা ফেচিং
  const { data: trackingData } = useGetOrderTracking(orderData?._id);

  // ২. ডাইনামিক অ্যাড্রেস ডাটা ফেচিং
  const { addresses = [], isLoadingAddresses } = useAddress(orderData?.userId?._id || orderData?.userId);

  // ৩. ডাইনামিক ডেলিভারি স্লট ডাটা ফেচিং
  const { allSlots = [] } = useDeliverySlot();

  // ৪. আইডি অনুযায়ী ডাটা ম্যাচিং
  const targetAddressId = orderData?.addressId?._id || orderData?.addressId;
  const dynamicAddress = addresses.find((addr: any) => addr._id === targetAddressId);

  const targetSlotId = orderData?.deliverySlotId?._id || orderData?.deliverySlotId;
  const dynamicSlot = allSlots.find((slot: any) => slot._id === targetSlotId);

  // 🎯 ৫. টাইমলাইন স্টেপস এবং স্ট্যাটাস সিকোয়েন্স ডিক্লেয়ারেশন
  const timelineSteps = [
    { label: "Order Confirmed", key: "Pending", desc: "Order placed successfully" },
    { label: "Packed", key: "Packed", desc: "Ready to ship" },
    { label: "Shipped", key: "Shipped", desc: "In transit to hub" },
    { label: "Out for delivery", key: "Out for delivery", desc: "Delivery partner assigned" },
    { label: "Delivered", key: "Delivered", desc: "Successfully delivered" },
  ];

  // 🎯 ৬. নিখুঁত ফিলিং লজিক (বর্তমান স্ট্যাটাস ও তার আগের সবগুলো গ্রিন হবে)
  const getStepStatus = (currentStepIndex: number) => {
    // ডাটাবেজ থেকে আসা রিয়েলটাইম স্ট্যাটাস (নরমাল বা ট্র্যাকিং এপিআই থেকে)
    const currentStatus = trackingData?.status || orderData?.orderStatus || "Pending";
    
    // ম্যাপ করা কী-গুলোর সিকোয়েন্স অ্যারে
    const statusOrder = ["Pending", "Packed", "Shipped", "Out for delivery", "Delivered"];
    
    // ডাটাবেজের কারেন্ট স্ট্যাটাসটি সিকোয়েন্সের কত নাম্বার ইনডেক্সে আছে তা বের করা
    const activeStatusIndex = statusOrder.indexOf(currentStatus);
    
    // যদি লুপের কারেন্ট স্টেপটি একটিভ ইনডেক্সের সমান বা তার চেয়ে ছোট হয়, তবে সেটি ট্রু (Green) হবে
    return currentStepIndex <= activeStatusIndex;
  };

  // ৭. ডাইনামিক ডেট ফরম্যাটার
  const formatOrderDate = (dateStr: any) => {
    if (!dateStr) return "30 Jun 2026";
    const dateObj = typeof dateStr === "string" ? new Date(dateStr) : new Date(dateStr.$date || dateStr);
    return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full min-h-screen p-2 md:p-6 text-[#1E1E1E]">
      
      {/* 🔙 BACK TO LIST HEADER */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[16px] font-bold text-gray-700 hover:text-[#4E612B] mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft size={20} /> Back to Shopping
      </button>

      {/* 💳 TITLE BAR SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <p className="font-montserrat font-semibold text-[26px] text-[#1E1E1E]">Order Details</p>
            <span className={`px-2.5 py-0.5 rounded text-[12px] font-semibold tracking-wide border ${
              isDelivered ? "bg-[#EBF5EE] text-[#2D4A3E] border-[#2D4A3E]/10" : "bg-[#FEF9E7] text-[#D4AC0D] border-[#D4AC0D]/10"
            }`}>
              {orderData?.orderStatus || "Pending"}
            </span>
          </div>
          <p className="text-[13px] text-gray-400 mt-1">
            Placed on {formatOrderDate(orderData?.createdAt)}
          </p>
        </div>

        <Link href={"/shopnow"}>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#4E612B] text-white rounded-xl text-[14px] font-bold hover:bg-[#3d4d22] transition-all cursor-pointer shadow-xs self-start sm:self-auto">
            <ShoppingBag size={16} /> Reorder All
          </button>
        </Link>
      </div>

      {/* 🗂️ GRID CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* 🛒 LEFT SIDE: ORDER ITEMS CARD */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-3xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
            <p className="text-[16px] font-bold text-gray-800">Order Items</p>
            <p className="text-[12px] text-gray-400 font-medium">{orderData?.products?.length || 0} items</p>
          </div>

          {/* PRODUCT LIST */}
          <div className="divide-y divide-gray-100">
            {orderData?.products?.map((item: any, idx: number) => {
              const product = item?.productId;
              const imgUrl = product?.images?.[0]?.url || product?.images?.[0] || "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=150";

              return (
                <div key={idx} className="p-5 flex items-center justify-between gap-4  transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative rounded-xl border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
                      <Image src={imgUrl} alt={product?.name || "Product Image"} fill className="object-cover" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[15px] font-bold text-gray-800">{product?.name || "Premium Organic Item"}</p>
                      <p className="text-[12px] text-gray-400 font-normal">{product?.weight || "Unit/Weight Pack"}</p>
                      <p className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded inline-block font-medium">৳{item.price} × {item.quantity}</p>
                      
                      {isDelivered && (
                        <div className="flex items-center gap-4 pt-1">
                          <button className="flex items-center gap-1 text-[12px] font-bold text-gray-400 hover:text-[#4E612B] cursor-pointer">
                            <Star size={13} /> Write Review
                          </button>
                          <button className="flex items-center gap-1 text-[12px] font-bold text-gray-400 hover:text-[#4E612B] cursor-pointer">
                            <RefreshCw size={12} /> Reorder
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[15px] font-extrabold text-gray-800">৳{item.price * item.quantity}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BREAKDOWN */}
          <div className="p-5 bg-[#EBF0E8] border-t border-gray-100 space-y-2.5 text-[14px]">
            <div className="flex justify-between text-gray-500">
              <p>Subtotal</p>
              <p className="font-semibold text-gray-800">৳{orderData?.subTotal || 0}</p>
            </div>
            {orderData?.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <p>Discount Applied</p>
                <p className="font-semibold">-৳{orderData?.discountAmount}</p>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <p>Delivery Charge</p>
              <p className="font-semibold text-gray-800">{orderData?.deliveryCharge === 0 ? "Free" : `৳${orderData?.deliveryCharge}`}</p>
            </div>
            <div className="flex justify-between text-[16px] font-extrabold text-[#1E1E1E] border-t border-gray-200/60 pt-3 mt-1">
              <p>Total Paid</p>
              <p className="text-[#4E612B] text-[18px]">৳{orderData?.totalAmount || 0}</p>
            </div>
          </div>
        </div>

        {/* 📋 RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* SUMMARY */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4">
            <p className="text-[16px] font-bold text-gray-800 border-b border-gray-50 pb-2">Order Summary</p>
            <div className="space-y-2.5 text-[14px]">
              <div className="flex justify-between"><p className="text-gray-400">Order ID</p><p className="font-bold text-gray-800">#{orderData?._id?.slice(-8).toUpperCase()}</p></div>
              <div className="flex justify-between"><p className="text-gray-400">Delivery Schedule</p><p className="font-medium text-gray-700">{orderData?.deliveryDateType || "Standard"}</p></div>
              <div className="flex justify-between border-t border-gray-100 pt-3 text-[15px] font-extrabold"><p>Grand Total</p><p className="text-[#4E612B] text-[16px]">৳{orderData?.totalAmount}</p></div>
            </div>
          </div>

          {/* SLOT CARD */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"><Calendar size={15} /></div>
              <p className="text-[16px] font-bold text-gray-800">Delivery Slot</p>
            </div>
            {dynamicSlot ? (
              <div className="text-[14px] space-y-1 text-gray-700">
                <div className="flex justify-between">
                  <p className="text-gray-400">Slot Shift:</p>
                  <p className="font-bold text-[#4E612B] bg-[#4E612B]/5 px-2 py-0.5 rounded text-[13px]">{dynamicSlot.slotName}</p>
                </div>
                <div className="flex justify-between pt-1">
                  <p className="text-gray-400">Timing Window:</p>
                  <p className="font-semibold text-gray-800">{dynamicSlot.startTime} - {dynamicSlot.endTime}</p>
                </div>
              </div>
            ) : (
              <div className="text-[13px] text-gray-400 italic">Standard Delivery Timing ({orderData?.deliveryDateType || "Today"})</div>
            )}
          </div>

          {/* ADDRESS */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"><MapPin size={15} /></div>
                <p className="text-[16px] font-bold text-gray-800">Delivery Address</p>
              </div>
              {dynamicAddress?.addressType && (
                <span className="bg-gray-100 text-gray-600 font-bold px-2 py-0.5 text-[11px] rounded uppercase tracking-wider">{dynamicAddress.addressType}</span>
              )}
            </div>
            {isLoadingAddresses ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 size={16} className="animate-spin text-[#4E612B]" />
                <p className="text-[12px] text-gray-400">Loading address...</p>
              </div>
            ) : dynamicAddress ? (
              <div className="text-[14px] space-y-1 text-gray-600">
                <p className="font-bold text-gray-800">👤 {dynamicAddress.fullName}</p>
                <p>📞 {dynamicAddress.phone}</p>
                <p className="text-[13px] text-gray-400 leading-relaxed pt-0.5">🏠 {dynamicAddress.areaStreet}</p>
                {dynamicAddress.landmark && <p className="text-[12px] text-gray-400 italic">Landmark: {dynamicAddress.landmark}</p>}
                <p className="text-[13px] text-gray-500 font-medium">{dynamicAddress.thanaUpazila}, {dynamicAddress.cityDistrict} - {dynamicAddress.postCode}</p>
              </div>
            ) : (
              <div className="text-[13px] text-gray-400 italic">Address reference missing.</div>
            )}
          </div>

          {/* PAYMENT */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-3xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600"><CreditCard size={15} /></div>
              <p className="text-[16px] font-bold text-gray-800">Payment Info</p>
            </div>
            <div className="space-y-2 text-[13px] text-gray-600">
              <div className="flex justify-between"><p className="text-gray-400">Status</p><p className={`font-bold ${orderData?.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-500'}`}>{orderData?.paymentStatus || "Unpaid"}</p></div>
              {orderData?.transactionId && (
                <div className="flex justify-between items-center"><p className="text-gray-400">Transaction ID</p><p className="font-mono text-gray-700 text-[11px] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{orderData.transactionId}</p></div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 🎯 TIMELINE SECTION (FIXED PROGRESSIVE FILLING) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mt-6 shadow-3xs">
        <p className="text-[16px] font-bold text-gray-800 mb-8">{isDelivered ? "Order Timeline" : "Track Order"}</p>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 relative w-full overflow-x-auto pb-4">
          {timelineSteps.map((step, index) => {
            // 🎯 ইনডেক্স পাস করার মাধ্যমে আগের স্টেপগুলো অটোমেটিক ট্রু (Green) হবে
            const isStepCompleted = getStepStatus(index);
            
            return (
              <div key={index} className="flex md:flex-col items-center md:text-center flex-1 w-full md:w-auto relative group">
                
                {/* প্রোগ্রেস লাইন কানেক্টর */}
                {index !== timelineSteps.length - 1 && (
                  <div className={`hidden md:block absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-[3px] z-0 ${
                    getStepStatus(index + 1) ? "bg-[#4E612B]" : "bg-gray-100"
                  }`} />
                )}

                {/* চেক মার্ক বা ক্লক বাটন আইকন */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all shrink-0 z-10 ${
                  isStepCompleted 
                    ? "bg-[#4E612B] border-[#EBF5EE] text-white shadow-sm" 
                    : "bg-white border-gray-100 text-gray-300"
                }`}>
                  {isStepCompleted ? <CheckCircle2 size={20} /> : <Clock size={18} />}
                </div>

                <div className="ml-4 md:ml-0 md:mt-3 text-left md:text-center">
                  <p className={`text-[14px] font-bold ${isStepCompleted ? "text-gray-800" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-normal">
                    {isStepCompleted ? step.desc : "Awaiting step"}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}