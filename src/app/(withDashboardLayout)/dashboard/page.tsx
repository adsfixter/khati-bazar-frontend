/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Phone, Calendar, ShoppingBag, Heart, MapPin, Star,
  Bell, Percent, ShieldCheck, Key, RefreshCcw, ArrowRight, Eye, Loader2, Camera
} from "lucide-react";
import { useUserData } from "@/src/hooks/useUserData";
import { useAddress } from "@/src/hooks/useAddressData";
import { useWishlist } from "@/src/hooks/useWishlistData";
import { useNotification } from "@/src/hooks/useNotificationData";
import { useGetMyOrders } from "@/src/hooks/useOrderHooks";
import OrderDetailsPage from "./my-orders/OrderDetailsPage";
import { toast } from "react-toastify";


export default function ProfileDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFileUploading, setIsFileUploading] = useState(false); 
  
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);


  const { user, userId, updateProfile, isUpdatingProfile, isLoading: isUserLoading } = useUserData();
  const { addresses, isLoadingAddresses } = useAddress(userId || "");
  const { wishlistData, isLoadingWishlist } = useWishlist(userId || "");
  const { notifications, isLoading: isLoadingNotifications } = useNotification(userId || "", 1);
  const { data: myOrders = [], isLoading: isLoadingOrders } = useGetMyOrders(); 
  const selectedOrderData = myOrders.find((o: any) => o._id === activeOrderId);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file); 

    try {
      setIsFileUploading(true);
      await updateProfile(formData); 
      console.log("📸 Profile photo updated successfully from dashboard!");
    } catch (error) {
      console.error("❌ Failed to update profile photo:", error);
    } finally {
      setIsFileUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (!isFileUploading && !isUpdatingProfile) {
      fileInputRef.current?.click();
    }
  };

  // 🎯 ৩. কন্ডিশনাল রেন্ডারিং: যদি আইডি সিলেক্টেড থাকে এবং ডাটা পাওয়া যায়, তবে ডিটেইলস পেজ দেখাবে
  if (activeOrderId && selectedOrderData) {
    return (
      <OrderDetailsPage 
        orderData={selectedOrderData} 
        onBack={() => setActiveOrderId(null)} // ব্যাক বাটনে ক্লিক করলে আবার ড্যাশবোর্ডে ফিরবে
      />
    );
  }

  // গ্লোবাল স্টেট লোডিং স্ক্রিন
  if (isUserLoading || isLoadingAddresses || isLoadingWishlist || isLoadingNotifications || isLoadingOrders) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 animate-spin text-[#4B612C]" />
        <p className="text-xs font-semibold text-slate-500">Fetching live dashboard sync...</p>
      </div>
    );
  }

  // 🧮 ক্যালকুলেশন: সব অর্ডারের totalAmount বা price-এর যোগফল
  const totalSpend = myOrders?.reduce((acc: number, order: any) => {
    const amount = Number(order.totalAmount || order.price || 0);
    return acc + amount;
  }, 0) || 0;

  const wishlistCount = wishlistData?.products?.length || wishlistData?.length || 0;

  // 🆔 অর্ডার আইডির শেষ ৪ ডিজিট এক্সট্রাক্ট করার হেল্পার ফাংশন
  const getLastFourDigits = (id: string) => {
    if (!id) return "N/A";
    const cleanId = String(id).trim();
    return cleanId.length > 4 ? `#...${cleanId.slice(-4)}` : `#${cleanId}`;
  };

  return (
    <div className=" min-h-screen font-sans space-y-6 antialiased">

      {/* ─── PROFILE HEADER ─── */}
      <div className="bg-white border border-[#EBEFF5] rounded-2xl p-6 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          
          {/* Avatar Area */}
          <div 
            onClick={triggerFileInput}
            className="group relative w-20 h-20 rounded-full overflow-hidden border border-[#4B612C]/20 bg-[#4B612C]/10 flex items-center justify-center cursor-pointer"
          >
            {isFileUploading || isUpdatingProfile ? (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            ) : null}

            {user?.image || user?.avatar || user?.profileImage ? (
              <img 
                src={user?.image || user?.avatar || user?.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <p className="font-bold text-3xl uppercase text-[#4B612C]">
                {user?.name ? user.name[0] : <User size={36} />}
              </p>
            )}

            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={18} className="text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <p className="text-2xl font-bold text-[#1E2742]">{user?.name || "N/A"}</p>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 justify-center sm:justify-start"><Phone size={14} /> {user?.phone || "No phone added"}</span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1.5 justify-center sm:justify-start"><Mail size={14} /> {user?.email || "No email linked"}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1 font-medium">
              <Calendar size={12} /> Account Created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "N/A"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push("/dashboard/settings")} 
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold text-xs rounded-xl shadow-3xs transition-all cursor-pointer"
          >
            Edit Profile
          </button>
          
          <button 
            onClick={triggerFileInput}
            disabled={isFileUploading || isUpdatingProfile}
            className="px-4 py-2 bg-[#4B612C] hover:bg-[#3d4f24] text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            {isFileUploading || isUpdatingProfile ? (
              <Loader2 size={13} className="animate-spin" />
            ) : null}
            Change Photo
          </button>
        </div>
      </div>

      {/* ─── STATS COUNTER GRID ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-[#EBEFF5] rounded-2xl p-4 flex items-center gap-3.5 shadow-3xs">
          <div className="p-3 bg-gray-50 rounded-xl"><ShoppingBag size={18} className="text-[#4B612C]" /></div>
          <div>
            <p className="text-lg font-black text-[#1E2742] tracking-tight">{totalSpend}৳</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Spend</p>
          </div>
        </div>

        <div className="bg-white border border-[#EBEFF5] rounded-2xl p-4 flex items-center gap-3.5 shadow-3xs">
          <div className="p-3 bg-gray-50 rounded-xl"><ShoppingBag size={18} className="text-amber-500" /></div>
          <div>
            <p className="text-lg font-black text-[#1E2742] tracking-tight">{myOrders?.length || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Orders</p>
          </div>
        </div>

        <div className="bg-white border border-[#EBEFF5] rounded-2xl p-4 flex items-center gap-3.5 shadow-3xs">
          <div className="p-3 bg-gray-50 rounded-xl"><Heart size={18} className="text-red-500" /></div>
          <div>
            <p className="text-lg font-black text-[#1E2742] tracking-tight">{wishlistCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Wishlist Items</p>
          </div>
        </div>

        <div className="bg-white border border-[#EBEFF5] rounded-2xl p-4 flex items-center gap-3.5 shadow-3xs">
          <div className="p-3 bg-gray-50 rounded-xl"><MapPin size={18} className="text-blue-500" /></div>
          <div>
            <p className="text-lg font-black text-[#1E2742] tracking-tight">{addresses?.length || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Saved Addresses</p>
          </div>
        </div>

        <div className="bg-white border border-[#EBEFF5] rounded-2xl p-4 flex items-center gap-3.5 shadow-3xs">
          <div className="p-3 bg-gray-50 rounded-xl"><Star size={18} className="text-purple-500" /></div>
          <div>
            <p className="text-lg font-black text-[#1E2742] tracking-tight">{user?.reviewsCount || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Reviews Given</p>
          </div>
        </div>
      </div>

      {/* ─── RECENT ORDERS TABLE & NOTIFICATIONS SIDEBAR ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Section */}
        <div className="lg:col-span-2 bg-white border border-[#EBEFF5] rounded-2xl p-5 shadow-3xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <p className="text-base font-bold text-[#1E2742]">Recent Orders</p>
            <button 
              onClick={() => router.push("/dashboard/my-orders")} 
              className="text-xs font-bold text-[#4B612C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {myOrders.length === 0 ? (
            <p className="text-center p-8 text-xs text-slate-400 font-semibold">You haven't placed any orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAFBFD] text-slate-400 font-bold border-b border-gray-100">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-slate-600 font-semibold">
                  {myOrders.slice(0, 5).map((order: any, idx: number) => {
                    // 🎯 ফিক্স ১: ব্যাকএন্ডের আসল 'status' প্রোপার্টিটি রিড করা হলো সেফটিসহ
                    const currentOrderStatus = order.status || order.orderStatus || "Pending";

                    return (
                      <tr key={idx} className="hover:bg-gray-50/40 transition-colors">
                        <td className="p-3 font-bold text-[#1E2742]">{getLastFourDigits(order.orderId || order._id)}</td>
                        <td className="p-3 text-slate-400 font-medium">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                        </td>
                        <td className="p-3">{order.totalItems || order.products?.length || 0} items</td>
                        <td className="p-3 font-bold">৳{order.totalAmount || order.price || 0}</td>
                        <td className="p-3 text-center">
                          {/* 🎯 ফিক্স ২: কন্ডিশনাল চেকিং-এ 'status' এর ডায়নামিক ভ্যালু মিলানো হলো */}
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            currentOrderStatus.toLowerCase() === "delivered" ? "bg-emerald-50 text-emerald-600" :
                            currentOrderStatus.toLowerCase() === "pending" ? "bg-amber-50 text-amber-600" : 
                            currentOrderStatus.toLowerCase() === "cancelled" || currentOrderStatus.toLowerCase() === "canceled" ? "bg-rose-50 text-rose-600" :
                            "bg-blue-50 text-blue-500"
                          }`}>
                            {currentOrderStatus}
                          </span>
                        </td>
                        <td className="p-3 flex justify-center text-center">
                          <button 
                            onClick={() => setActiveOrderId(order._id)} 
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-2xs transition-colors"
                          >
                            <Eye size={16} className="text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dynamic Notification Sidebar */}
        <div className="bg-white border border-[#EBEFF5] rounded-2xl p-5 shadow-3xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <p className="text-base font-bold text-[#1E2742]">Notifications</p>
            <button 
              onClick={() => router.push("/dashboard/notifications")}
              className="text-xs font-bold text-[#4B612C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              See all <ArrowRight size={14} />
            </button>
          </div>

          {!notifications || notifications.length === 0 ? (
            <p className="text-center p-8 text-xs text-slate-400 font-semibold">Inbox clean! No new alerts.</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((noti: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition-all border border-gray-100/50">
                  <div className="p-2 rounded-xl bg-white border text-slate-600">
                    {noti.type === 'promo' ? <Percent size={14} className="text-amber-500" /> : <Bell size={14} />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700 leading-tight">{noti.message || noti.title}</p>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {noti.createdAt ? new Date(noti.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Recently"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ─── ACCOUNT SECURITY CONTROL PANEL ─── */}
      <div className="bg-white border border-[#EBEFF5] rounded-2xl p-5 shadow-3xs space-y-4">
        <p className="text-base font-bold text-[#1E2742] border-b border-gray-100 pb-2">Account Security</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-100 bg-[#FAFBFD]/50 p-4 rounded-xl flex items-start justify-between group">
            <div className="flex gap-3.5">
              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-slate-400"><Key size={18} /></div>
              <div>
                <p className="text-xs font-bold text-[#1E2742]">Change Password</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Secure your authentication</p>
              </div>
            </div>
            <button 
              onClick={() => router.push("/dashboard/settings?tab=password")} 
              className="text-xs font-bold text-[#4B612C] hover:underline flex items-center gap-0.5 pt-1 cursor-pointer"
            >
              Update <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="border border-gray-100 bg-[#FAFBFD]/50 p-4 rounded-xl flex items-start justify-between group">
            <div className="flex gap-3.5">
              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-slate-400"><ShieldCheck size={18} /></div>
              <div>
                <p className="text-xs font-bold text-[#1E2742]">Two-Factor Auth</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Status: {user?.isTwoFactorEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
            <button className="text-xs font-bold text-[#4B612C] hover:underline flex items-center gap-0.5 pt-1 cursor-pointer">
              Configure <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="border border-gray-100 bg-[#FAFBFD]/50 p-4 rounded-xl flex items-start justify-between group">
            <div className="flex gap-3.5">
              <div className="p-2.5 bg-white border border-gray-100 rounded-xl text-slate-400"><RefreshCcw size={18} /></div>
              <div>
                <p className="text-xs font-bold text-[#1E2742]">Login Activity</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Monitor current sessions</p>
              </div>
            </div>
            <button className="text-xs font-bold text-[#4B612C] hover:underline flex items-center gap-0.5 pt-1 cursor-pointer">
              Review <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 🚪 ফিক্স ৩: 'hidden' ইনপুট ফিল্ডটি এখন একদম নিচে থাকায় ওপরের হেডারে কোনো মার্জিন গ্যাপ আসবে না */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handlePhotoChange} 
        accept="image/*" 
        className="hidden" 
      />

    </div>
  );
}