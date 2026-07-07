"use client";

import React, { useState, useEffect } from "react";
import { Check, Trash2, ShoppingBag, Percent, Bell, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useNotification } from "@/src/hooks/useNotificationData";

// 💡 টোকেন ডিকোড করার হেল্পার ফাংশন
const getUserIdFromToken = (token: string): string | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.id || decoded._id || decoded.userId || null;
  } catch {
    return null;
  }
};

export default function NotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // 💡 lazy initializer দিয়ে টোকেন রিড করে ডাইনামিক userId জেনারেট করা
  const [userId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const token =
      localStorage.getItem("token") || localStorage.getItem("refreshToken");
    return token ? getUserIdFromToken(token) : null;
  });

  // custom hook এ আইডি পাস করা (id না থাকলে ফ্যালব্যাক খালি স্ট্রিং)
  const { 
    notifications = [], 
    meta = { totalUnread: 0, totalNotifications: 0, totalPages: 1 }, 
    isLoading, 
    markAllAsRead,    
    markSingleAsRead, 
    deleteNotification 
  } = useNotification(userId || "", currentPage);

  // টাইমস্ট্যাম্প থেকে টাইম ফরম্যাট করা
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hrs ago`;
    return `${diffDays} days ago`;
  };

  // নোটিফিকেশন টাইপ অনুযায়ী আইকন ও ব্যাজ স্টাইল
  const getTypeStyles = (type: "Order Update" | "Promotion" | "System Alert") => {
    switch (type) {
      case "Order Update":
        return {
          icon: <ShoppingBag size={18} className="text-[#4E612B]" />,
          bg: "bg-gray-50 border border-gray-100",
          badge: "bg-[#E8F0EC] text-[#4E612B]"
        };
      case "Promotion":
        return {
          icon: <Percent size={18} className="text-[#4E612B]" />,
          bg: "bg-gray-50 border border-gray-100",
          badge: "bg-[#E8F0EC] text-[#4E612B]"
        };
      case "System Alert":
      default:
        return {
          icon: <Bell size={18} className="text-[#4E612B]" />,
          bg: "bg-gray-50 border border-gray-100",
          badge: "bg-[#E8F0EC] text-[#4E612B]"
        };
    }
  };

  // সিঙ্গেল নোটিফিকেশনে ক্লিক করলে রিড মার্ক হবে
  const handleCardClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markSingleAsRead(id);
      } catch (err) {
        console.error("Failed to mark single notification as read:", err);
      }
    }
  };

  // "Mark All Read" বাটনে ক্লিক করলে সব একসাথে রিড হবে
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  // নোটিফিকেশন ডিলিট করা
  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // 💡 ইউজার লগইন করা না থাকলে স্ক্রিন গার্ড
  if (!userId) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Please log in to view your notifications.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E612B]" />
        <p className="text-xs text-gray-400">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 p-2 md:p-6 text-[#0F1E29] font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-montserrat font-semibold text-[24px] md:text-[28px] text-[#0F1E29] tracking-tight">
            Notifications
          </p>
          <p className="text-xs font-medium text-gray-400 mt-1">
            {meta.totalUnread} unread · {meta.totalNotifications} total
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={meta.totalUnread === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
        >
          <Check size={14} /> Mark All Read
        </button>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            No notifications available.
          </div>
        ) : (
          notifications.map((item: any) => {
            const styles = getTypeStyles(item.notificationType);
            return (
              <div
                key={item._id}
                onClick={() => handleCardClick(item._id, item.isRead)}
                className={`group relative rounded-xl p-4 md:p-5 border transition-all duration-300 flex items-start gap-4 cursor-pointer ${
                  !item.isRead
                    ? "bg-[#F4F7F5] border-[#4E612B]/10 shadow-xs" 
                    : "bg-white border-gray-200 hover:bg-gray-50/50" 
                }`}
              >
                {/* Type Icon Wrapper */}
                <div className={`p-3 rounded-xl shrink-0 ${styles.bg}`}>
                  {styles.icon}
                </div>

                {/* Info & Text Content */}
                <div className="flex-1 space-y-1 pr-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-[15px] text-[#0F1E29] tracking-tight">
                      {item.title}
                    </p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${styles.badge}`}>
                      {item.notificationType}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
                    {item.message}
                  </p>
                </div>

                {/* Right Side Info (Time & Delete Action) */}
                <div className="absolute right-4 top-4 md:right-5 md:top-5 flex flex-col items-end justify-between mt-2">
                  <span className="text-[11px] font-medium text-gray-400 font-mono">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleDelete(item._id); 
                    }}
                    className="p-1.5 rounded-lg border border-transparent text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete Notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER PAGINATION */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: meta.totalPages }, (_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#4E612B] text-white shadow-xs"
                      : "text-gray-500 border border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, meta.totalPages))}
            disabled={currentPage === meta.totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}