"use client";

import React, { useState } from "react";
import { X, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { useUserData } from "@/src/hooks/useUserData";



interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
  const { changePassword } = useUserData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // পাসওয়ার্ড ফিল্ডের ডেটা স্টেট
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // পাসওয়ার্ড হাইড/শো করার স্টেট
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // ১. পাসওয়ার্ড ম্যাচিং ভ্যালিডেশন
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match!");
      return;
    }

    // ২. মিনিমাম লেন্থ ভ্যালিডেশন
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      // আপনার useUserData হুকের changePassword মিউটেশন কল করা হচ্ছে
      await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(true);
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      
      // ২ সেকেন্ড পর মডালটি অটোমেটিক বন্ধ হয়ে যাবে
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
      
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] bg-white rounded-[24px] p-6 md:p-8 shadow-xl relative animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-6 top-6 p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="font-sans font-bold text-[20px] text-[#0F1E29] mb-1 flex items-center gap-2">
            <ShieldCheck className="text-[#4E612B]" size={22} /> Change Password
          </h2>
          <p className="text-xs text-gray-400 font-medium">Update your account security credentials</p>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-semibold">
            🎉 Password changed successfully!
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium表格">
          
          {/* Current Password */}
          <div className="relative">
            <label className="block text-gray-600 font-semibold mb-1.5">Current Password *</label>
            <div className="relative">
              <input 
                type={showOld ? "text" : "password"} 
                required 
                value={formData.oldPassword}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 text-gray-700 text-xs focus:outline-none focus:border-[#4E612B] transition-colors"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowOld(!showOld)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="relative">
            <label className="block text-gray-600 font-semibold mb-1.5">New Password *</label>
            <div className="relative">
              <input 
                type={showNew ? "text" : "password"} 
                required 
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 text-gray-700 text-xs focus:outline-none focus:border-[#4E612B] transition-colors"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <label className="block text-gray-600 font-semibold mb-1.5">Confirm New Password *</label>
            <div className="relative">
              <input 
                type={showConfirm ? "text" : "password"} 
                required 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 text-gray-700 text-xs focus:outline-none focus:border-[#4E612B] transition-colors"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || success}
              className="px-5 py-2.5 rounded-xl bg-[#4E612B] hover:bg-[#3D4D22] disabled:bg-[#4E612B]/50 text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer min-w-[140px]"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />} Update Password
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}