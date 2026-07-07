"use client";

import React, { useState, useRef } from "react";
import { Edit2, Globe, Bell, Percent, MessageSquare, Mail, ShieldCheck, Laptop, Trash2, Loader2, Camera, Image } from "lucide-react";
import { useSession } from "next-auth/react";
import EditInfoModal from "./EditInfoModal";
import PasswordChangeModal from "./PasswordChangeModal";
import { useUserData } from "@/src/hooks/useUserData";

export default function AccountSettingsPage() {
  const { data: session, status } = useSession(); 
  const { user: apiUser, isLoading, updateProfile, deleteAccount, isUpdatingProfile } = useUserData();
  
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false); // লোকাল আপলোড লোডিং ট্র্যাকার
  
  const fileInputRef = useRef<HTMLInputElement>(null); // হিডেন ফাইল ইনপুটের জন্য রেফারেন্স

  // 🎯 এপিআই ডেটা থাকলে সেটা অগ্রাধিকার পাবে, না থাকলে সেশনের ডেটা ফলব্যাক হবে
  const user = apiUser || session?.user;

  // সেশন বা ব্যাকএন্ড কুয়েরি যেকোনো একটা লোডিং মোডে থাকলে স্ক্রিন লক থাকবে
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E612B]" />
        <p className="text-xs text-gray-400 font-medium">Loading settings information...</p>
      </div>
    );
  }

  // 🎯 প্রোফাইল ইমেজ পরিবর্তনের হ্যান্ডলার ফাংশন
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ফাইল সাইজ বা টাইপ ভ্যালিডেশন (ঐচ্ছিক)
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file); // আপনার ব্যাকএন্ডের মাল্টার বা ক্লাউডিনারি ফিল্ড নেম অনুযায়ী

    try {
      setIsFileUploading(true);
      await updateProfile(formData); // useUserData এর ডাইনামিক আপডেট প্রোফাইল ট্রিগার করা
    } catch (err) {
      console.error("Failed to upload profile image", err);
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleTogglePreference = async (key: string, currentValue: boolean) => {
    if (!user) return;
    
    // প্রিফারেন্স অবজেক্ট সেফলি রিড করা
    const currentPrefs = (user as any)?.preferences || {
      language: "English",
      orderNotifications: true,
      promotionalAlerts: false,
      smsAlerts: true,
      marketingEmails: false
    };
    
    const updatedPreferences = { ...currentPrefs, [key]: !currentValue };
    try {
      await updateProfile({ preferences: updatedPreferences });
    } catch (err) {
      console.error("Failed to update notification settings", err);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 p-2 md:p-6 space-y-8">
      {/* Title */}
      <div>
        <p className="font-montserrat font-semibold text-[24px] md:text-[28px] text-[#0F1E29] tracking-tight">Account Settings</p>
        <p className="text-xs font-medium text-gray-400 mt-0.5">Manage your profile, preferences, and privacy</p>
      </div>

  
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Card Section (ডিজাইন অনুযায়ী ম্যাচ করা) */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 border border-gray-100 rounded-2xl bg-white gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* প্রোফাইল ইমেজ ও ক্যামেরা ওভারলে */}
          <div 
            onClick={() => !isFileUploading && fileInputRef.current?.click()}
            className="group relative w-16 h-16 rounded-full text-white flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-gray-50 shrink-0 cursor-pointer"
          >
            {isFileUploading || isUpdatingProfile ? (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              </div>
            ) : null}
            
            {(user as any)?.profileImage || user?.image ? (
              <img src={(user as any)?.profileImage || user?.image || ""} alt="profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.slice(0, 2).toUpperCase() || "US"
            )}
            
            {/* হোভার ক্যামেরা এফেক্ট */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={16} className="text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-base md:text-lg text-[#0F1E29]">{user?.name || "User"}</p>
              <span className="bg-[#E8F0EC] text-[#4E612B] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4E612B]"></span> {(user as any)?.status || "Active"}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">
              {(user as any)?.phone ? `${(user as any).phone}  ·  ` : ""}{user?.email}
            </p>
          </div>
        </div>

        {/* চেঞ্জ ফটো বাটন */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isFileUploading || isUpdatingProfile}
          className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isFileUploading || isUpdatingProfile ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Image size={14} />
          )}
          Change Photo
        </button>
      </div>

      {/* Personal Information Section */}
      <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <p className="font-bold text-[15px] text-[#0F1E29]">Personal Information</p>
          <button 
            onClick={() => setIsEditInfoOpen(true)}
            className="text-xs font-semibold text-gray-500 hover:text-[#4E612B] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Edit2 size={13} /> Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
          <div>
            <span className="block text-gray-400 mb-1.5">Full Name *</span>
            <div className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-700">{user?.name || "N/A"}</div>
          </div>
          <div>
            <span className="block text-gray-400 mb-1.5">Phone Number *</span>
            <div className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-700">{(user as any)?.phone || "Not set yet"}</div>
          </div>
          <div>
            <span className="block text-gray-400 mb-1.5">Email (Optional)</span>
            <div className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 text-gray-400 select-none">{user?.email || "N/A"}</div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
        <p className="font-bold text-[15px] text-[#0F1E29] border-b border-gray-50 pb-3">Preferences</p>
        <div className="flex items-center justify-between py-1 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500"><Globe size={16} /></div>
            <div>
              <p className="font-bold text-[15px] text-gray-800">Language</p>
              <p className="text-gray-400 text-[11px] mt-0.5">Choose your preferred language</p>
            </div>
          </div>
          <select 
            value={(user as any)?.preferences?.language || "English"}
            onChange={async (e) => await updateProfile({ preferences: { ...(user as any)?.preferences, language: e.target.value } })}
            className="border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 outline-none text-xs font-semibold cursor-pointer focus:border-[#4E612B]"
          >
            <option value="English">English</option>
            <option value="Bangla">Bangla</option>
          </select>
        </div>

        {[
          { key: "orderNotifications", title: "Order Notifications", desc: "Updates on your orders via push & email", icon: <Bell size={16} /> },
          { key: "promotionalAlerts", title: "Promotional Alerts", desc: "Deals, flash sales, and special offers", icon: <Percent size={16} /> },
          { key: "smsAlerts", title: "SMS Alerts", desc: "Get order updates via SMS", icon: <MessageSquare size={16} /> },
          { key: "marketingEmails", title: "Marketing Emails", desc: "Weekly newsletters and product highlights", icon: <Mail size={16} /> }
        ].map((pref) => {
          const isChecked = (user as any)?.preferences ? !!((user as any).preferences as any)[pref.key] : true;
          return (
            <div key={pref.key} className="flex items-center justify-between py-1 text-xs border-t border-gray-50/50 pt-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500">{pref.icon}</div>
                <div>
                  <p className="font-bold text-[15px] text-gray-800">{pref.title}</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">{pref.desc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isChecked}
                  onChange={() => handleTogglePreference(pref.key, isChecked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4E612B]"></div>
              </label>
            </div>
          );
        })}
      </div>

      {/* Privacy & Security Section */}
      <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
        <p className="font-bold text-[15px] text-[#0F1E29] border-b border-gray-50 pb-3">Privacy & Security</p>
        <div className="flex items-center justify-between py-1 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500"><ShieldCheck size={16} /></div>
            <div>
              <p className="font-bold text-[15px] text-gray-800">Password</p>
              <p className="text-gray-400 text-[11px] mt-0.5">Manage password configuration safety</p>
            </div>
          </div>
          <button 
            onClick={() => setIsPasswordOpen(true)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Change
          </button>
        </div>

        <div className="flex items-center justify-between py-1 text-xs border-t border-gray-50/50 pt-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500"><Laptop size={16} /></div>
            <div>
              <p className="font-bold text-[15px] text-gray-800">Active Sessions</p>
              <p className="text-gray-400 text-[11px] mt-0.5">Logged in devices tracking</p>
            </div>
          </div>
        </div>
        <div className="space-y-3 pl-12 pt-1 text-xs">
          <div className="flex items-center justify-between border-b border-gray-50/50 pb-2">
            <div>
              <p className="font-semibold text-gray-700">Chrome on Windows · Dhaka, Bangladesh</p>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Active Now</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">Current</span>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="border border-rose-100 bg-rose-50/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 mt-0.5"><Trash2 size={16} /></div>
          <div>
            <p className="font-bold text-[15px] text-gray-800">Delete Account</p>
            <p className="text-gray-400 text-[11px] mt-0.5">Permanently delete your account data and all files</p>
          </div>
        </div>
        <button 
          onClick={async () => { if(confirm("Are you sure?")) await deleteAccount(); }}
          className="px-4 py-2 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>

      {/* Modals */}
      <EditInfoModal 
        isOpen={isEditInfoOpen} 
        onClose={() => setIsEditInfoOpen(false)} 
        initialData={{ name: user?.name || "", email: user?.email || "", phone: (user as any)?.phone || "" }} 
        updateProfile={updateProfile} 
      />
      <PasswordChangeModal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />
    </div>
  );
}