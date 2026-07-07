"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface EditInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: { name?: string; email?: string; phone?: string };
  updateProfile: (data: any) => Promise<any>;
}

export default function EditInfoModal({ isOpen, onClose, initialData, updateProfile }: EditInfoModalProps) {
  // 🎯 ফিক্স ১: স্টেটে শুধু নাম রাখা হয়েছে
  const [formData, setFormData] = useState({ name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || "",
      });
      setError(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 🎯 ফিক্স ২: শুধুমাত্র name ব্যাকএন্ডে পাঠানো হচ্ছে (Email এবং Phone মডিফাই হবে না)
      await updateProfile({
        name: formData.name,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update profile information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-[560px] bg-white rounded-[24px] p-6 md:p-8 shadow-xl relative animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Close icon */}
        <button onClick={onClose} className="absolute right-6 top-6 p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"><X size={16} /></button>
        
        <h2 className="font-sans font-bold text-[20px] text-[#0F1E29] mb-1">Edit info</h2>
        <p className="text-xs text-gray-400 font-medium mb-5">Update your personal account credentials seamlessly</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-medium">
          <div className="border border-gray-100/80 rounded-2xl p-5 bg-white space-y-4">
            <h3 className="font-bold text-[14px] text-[#0F1E29] border-b border-gray-50 pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Name (Editable - শুধুমাত্র এটা চেঞ্জ করা যাবে) */}
              <div>
                <label className="block text-gray-600 font-semibold mb-1.5">Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-xs focus:outline-none focus:border-[#4E612B] transition-colors" 
                  placeholder="Enter full name"
                />
              </div>

              {/* 🎯 ফিক্স ৩: Phone Number এখন (Disabled / Read-Only) */}
              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Phone Number (Cannot be changed)</label>
                <input 
                  type="text" 
                  disabled
                  value={initialData?.phone || "Not set yet"} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-xs select-none cursor-not-allowed" 
                />
              </div>

              {/* Email (Disabled / Read-Only) */}
              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Email (Cannot be changed)</label>
                <input 
                  type="email" 
                  disabled 
                  value={initialData?.email || ""} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-xs select-none cursor-not-allowed" 
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-5 py-2.5 rounded-xl bg-[#4E612B] hover:bg-[#3D4D22] disabled:bg-[#4E612B]/60 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all min-w-[150px]"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />} Update Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}