"use client";

import axiosInstance from "@/src/api/axiosInstance";
import { DeliverySlotData } from "@/src/types/product.interface";
import React, { useEffect, useState } from "react";

interface ApiResponse {
  success: boolean;
  data: DeliverySlotData[];
}

interface DeliveryslotProps {
  onSlotSelect?: (slot: DeliverySlotData | null) => void;
}

const Deliveryslot: React.FC<DeliveryslotProps> = ({ onSlotSelect }) => {
  const [slots, setSlots] = useState<DeliverySlotData[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("Today");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await axiosInstance.get<ApiResponse>("/delivery-slots/active");

        if (res.data?.success && res.data.data.length > 0) {
          setSlots(res.data.data);
          setSelectedSlotId(res.data.data[0]._id);
          onSlotSelect?.(res.data.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch delivery slots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSlot = (slot: DeliverySlotData) => {
    setSelectedSlotId(slot._id);
    onSlotSelect?.(slot);
  };

  const tabs = ["Today", "Tomorrow", "Schedule"];

  if (loading) {
    return (
      <div className="w-full bg-white border border-[#E9E9E9] rounded-[24px] p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-[109px] bg-gray-100 rounded-2xl"></div>
          <div className="h-[109px] bg-gray-100 rounded-2xl"></div>
          <div className="h-[109px] bg-gray-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-[#E9E9E9] rounded-[24px] p-6 shadow-sm font-sans">
      <h3 className="text-[18px] font-bold text-[#1E1E1E] font-montserrat tracking-tight mb-4">
        Delivery Slot
      </h3>

      <div className="flex items-center gap-6 border-b border-[#F5F5F5] mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[14px] font-semibold transition-all relative ${
                isActive ? "text-[#37651B]" : "text-[#7F8482] hover:text-[#1E1E1E]"
              }`}
            >
              {tab}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#37651B] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot._id;
          return (
            <div
              key={slot._id}
              onClick={() => handleSelectSlot(slot)}
              className={`relative cursor-pointer rounded-[16px] h-[109px] p-6 flex items-center justify-between transition-all border-2 ${
                isSelected
                  ? "border-[#37651B] bg-[#EBF0E8]"
                  : "border-[#E9E9E9] bg-white hover:border-[#37651B]/30"
              }`}
            >
              <span className="absolute -top-2.5 right-6 bg-[#37651B] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                Free
              </span>

              <div className="flex flex-col gap-1.5">
                <p className="text-[15px] font-bold text-[#1E1E1E] font-montserrat">
                  {slot.slotName}
                </p>
                <p className="text-[12px] font-medium text-[#7F8482] font-aeonik">
                  ({slot.startTime.toUpperCase()} - {slot.endTime.toUpperCase()})
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  isSelected ? "border-[#37651B] bg-white" : "border-[#E9E9E9]"
                }`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#37651B]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Deliveryslot;