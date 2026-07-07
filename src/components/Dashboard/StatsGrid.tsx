// src/components/Dashboard/StatsGrid.tsx
import React from "react";
import { DashboardStats } from "@/src/types/dashboard";

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  bg: string;
  color: string;
}

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M2 8H16" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const BoxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 5L8 1L15 5V11L8 15L1 11V5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);

const HeartIcon = () => (
  <svg width="18" height="16" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 13C8 13 1 9.1 1 4.5C1 2.4 2.7 1 4.5 1C6 1 7.3 1.9 8 3C8.7 1.9 10 1 11.5 1C13.3 1 15 2.4 15 4.5C15 9.1 8 13 8 13Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="18" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 15C7 15 13 10 13 6C13 2.7 10.3 1 7 1C3.7 1 1 2.7 1 6C1 10 7 15 7 15Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 13 13" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 0.5L8.1 4.3L12.3 4.7L9.1 7.5L10 11.7L6.5 9.5L3 11.7L3.9 7.5L0.7 4.7L4.9 4.3L6.5 0.5Z" strokeWidth="1.2" />
  </svg>
);

const StatsGrid: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const items: StatItem[] = [
    { icon: <WalletIcon />, value: `৳${stats.totalSpend}`, label: "Total Spend", bg: "bg-[#EBF0E8]", color: "text-[#37651B]" },
    { icon: <BoxIcon />, value: String(stats.totalOrders), label: "Total Orders", bg: "bg-[#E9F0FB]", color: "text-[#2D6CC0]" },
    { icon: <HeartIcon />, value: String(stats.wishlistItems), label: "Wishlist Items", bg: "bg-[#FBEAEA]", color: "text-[#D14343]" },
    { icon: <PinIcon />, value: String(stats.savedAddresses), label: "Saved Addresses", bg: "bg-[#FFF6E5]", color: "text-[#C98B1F]" },
    { icon: <StarIcon />, value: String(stats.reviewsGiven), label: "Reviews Given", bg: "bg-[#F2EBFB]", color: "text-[#7E4FC2]" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-2 rounded-xl border border-[#E9E9E9] bg-white p-4"
        >
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
            {item.icon}
          </span>
          <p className="text-[18px] font-semibold text-[#1E1E1E]">{item.value}</p>
          <p className="text-[12px] text-[#6B6B6B]">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;