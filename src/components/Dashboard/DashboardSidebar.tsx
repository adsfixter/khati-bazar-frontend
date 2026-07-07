
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ChevronDown, ChevronRight } from "lucide-react"; 
import { useGetMyOrders } from "@/src/hooks/useOrderHooks";
import { useGetUserReviews } from "@/src/hooks/useReviewData";
import { useNotification } from "@/src/hooks/useNotificationData";
import { useWishlist } from "@/src/hooks/useWishlistData";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  getBadge?: (data: any) => number;
}

// ==================== exact design SVGs Icons ====================
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const BoxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </svg>
);

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);

// 🛠️ JWT Decoder
const getUserIdFromToken = (): string => {
  if (typeof window === "undefined") return "";
  const token = localStorage.getItem("token") || localStorage.getItem("refreshToken");
  if (!token) return "";

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
    return decoded?.id || decoded?._id || decoded?.userId || "";
  } catch (error) {
    console.error("Token decoding failed:", error);
    return "";
  }
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <GridIcon /> },
  { label: "My Orders", href: "/dashboard/my-orders", icon: <BoxIcon />, getBadge: (data) => data.ordersCount },
  { label: "My Wishlist", href: "/dashboard/wishlist", icon: <HeartIcon />, getBadge: (data) => data.wishlistCount },
  { label: "Saved Addresses", href: "/dashboard/addresses", icon: <PinIcon /> },
  { label: "My Reviews", href: "/dashboard/my-reviews", icon: <StarIcon />, getBadge: (data) => data.reviewsCount },
  { label: "Notifications", href: "/dashboard/notifications", icon: <BellIcon />, getBadge: (data) => data.notificationsCount },
  { label: "Account Settings", href: "/dashboard/settings", icon: <SettingsIcon /> },
];

const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const [userId, setUserId] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false); 

  useEffect(() => {
    setUserId(getUserIdFromToken());
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const { data: orders = [] } = useGetMyOrders();
  const { data: reviews = [] } = useGetUserReviews(userId);
  const { wishlistData } = useWishlist(userId); 
  const { notifications = [], meta } = useNotification(userId);

  if (!userId) {
    return (
      <aside className="w-full lg:max-w-[250px] flex-shrink-0 animate-pulse">
        <div className="h-64 bg-gray-50/50 rounded-2xl border border-gray-100" />
      </aside>
    );
  }

  let wishlistItemsCount = 0;
  if (Array.isArray(wishlistData)) {
    wishlistItemsCount = wishlistData.length;
  } else if (wishlistData) {
    const innerList = wishlistData.products || wishlistData.items || wishlistData.data?.products || [];
    wishlistItemsCount = Array.isArray(innerList) ? innerList.length : 0;
  }

  const unreadNotificationsCount = meta?.totalUnread !== undefined 
    ? meta.totalUnread 
    : (Array.isArray(notifications) 
        ? notifications.filter((n: any) => n?.isRead === false || n?.status === "unread").length 
        : 0);

  const dynamicCounts = {
    ordersCount: Array.isArray(orders) ? orders.length : (orders as any)?.data?.length || 0,
    reviewsCount: Array.isArray(reviews) ? reviews.length : (reviews as any)?.data?.length || 0,
    notificationsCount: unreadNotificationsCount,
    wishlistCount: wishlistItemsCount,
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/");
    setTimeout(() => window.location.reload(), 100);
  };

  const activeItem = navItems.find(item => pathname === item.href) || navItems[0];
  const activeBadge = activeItem.getBadge ? activeItem.getBadge(dynamicCounts) : 0;

  return (
    <aside className="w-full lg:max-w-[250px] flex-shrink-0 z-40">
      
      {/* 📱 মোবাইল রেসপন্সিভ ভিউ (ডিজাইন একদম নিখুঁত ড্রপডাউন করা হয়েছে) */}
      <div className="lg:hidden w-full mb-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-[#F1F3EE] border border-gray-100 rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#466632] transition-all"
        >
          <span className="flex items-center gap-3">
            {activeItem.icon}
            <span>{activeItem.label}</span>
            {activeBadge > 0 && (
              <span className="bg-[#41602D] text-white flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold">
                {activeBadge}
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <ChevronDown size={16} className={`text-[#466632] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </button>
      </div>

      {/* 🧭 ন্যাভিগেশন মেইন কন্টেইনার (ছবি অনুযায়ী রাউন্ডেড কোণ এবং কালার সিঙ্কড) */}
      <nav className={`
        overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-3xs
        ${isOpen ? "block mb-6" : "hidden lg:block"}
      `}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const badgeValue = item.getBadge ? item.getBadge(dynamicCounts) : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3.5 text-[15px] font-medium transition-all rounded-xl mb-0.5 last:mb-0 ${
                isActive 
                  ? "bg-[#F1F3EE] text-[#41602D]" 
                  : "text-[#555555] hover:bg-gray-50/70 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={isActive ? "text-[#41602D]" : "text-gray-400"}>
                  {item.icon}
                </span>
                {item.label}
              </span>
              
              {isActive && !item.getBadge && (
                <ChevronRight size={16} className="text-[#41602D]" />
              )}

              {badgeValue > 0 && (
                <span
                  className={`flex h-5.5 min-w-5.5 items-center justify-center rounded-full px-1 text-[11px] font-bold transition-all ${
                    isActive ? "bg-[#41602D] text-white" : "bg-[#41602D] text-white"
                  }`}
                >
                  {badgeValue}
                </span>
              )}
            </Link>
          );
        })}

        {/* সেপারেটর লাইন */}
        <div className="my-1 border-t border-gray-100" />

        {/* লগআউট বাটন ডিজাইন */}
        <button 
          type="button" 
          onClick={handleLogout} 
          className="flex w-full items-center gap-3 px-4 py-3.5 text-[15px] font-medium text-[#A63A3A] hover:bg-red-50/50 rounded-xl cursor-pointer transition-colors"
        >
          <span className="text-[#A63A3A]">
            <LogoutIcon />
          </span>
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;