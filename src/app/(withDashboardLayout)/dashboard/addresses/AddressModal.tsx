"use client";

import React, { useState, useEffect } from "react";
import { X, Home, Briefcase, Users, MapPin, Loader2 } from "lucide-react";

export interface FormDataState {
  _id?: string;
  addressType: "Home" | "Office" | "Family" | "Others";
  fullName: string;
  phone: string;
  email: string;
  areaStreet: string;
  landmark: string;
  cityDistrict: string;
  thanaUpazila: string;
  postCode: string;
  additionalNotes: string;
  isDefault: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  initialData: FormDataState;
  onSubmit: (data: FormDataState) => Promise<void>;
}

export default function AddressModal({ isOpen, onClose, isEditing, initialData, onSubmit }: AddressModalProps) {
  const [formData, setFormData] = useState<FormDataState>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose(); // 💡 সাবমিট সফল হলে মডালটি অটো-ক্লোজ হবে
    } catch (err) {
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "home": return <Home size={16} />;
      case "office": return <Briefcase size={16} />;
      case "family": return <Users size={16} />;
      default: return <MapPin size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Main Modal Container */}
      <div className="w-full max-w-[680px] bg-white rounded-[24px] p-6 md:p-8 shadow-xl relative max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 scrollbar-thin">
        
        {/* Header Close Button */}
        <button 
          onClick={onClose}
          type="button"
          className="absolute right-6 top-6 p-2 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-gray-700 hover:shadow-xs transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <p className="font-sans font-bold text-[22px] md:text-[24px] text-[#0F1E29] mb-6">
          {isEditing ? "Edit Address" : "Add New Address"}
        </p>

        <form onSubmit={handleFormSubmit} className="space-y-6 text-[14px]">
          
          {/* Address Type Tabs Selector */}
          <div className="flex items-center gap-3">
            {(["Home", "Office", "Family", "Others"] as const).map((type) => {
              const isActive = formData.addressType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, addressType: type })}
                  className={`px-4 py-2.5 rounded-xl font-medium text-xs border transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-[#4E612B] text-white border-[#4E612B] shadow-xs"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  {getIcon(type)}
                  {type}
                </button>
              );
            })}
          </div>

          {/* SECTION 1: Contact Information */}
          <div className="border border-gray-100/80 rounded-2xl p-5 md:p-6 bg-white/50 space-y-4">
            <h3 className="font-sans font-bold text-[16px] text-[#0F1E29]">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4E612B] bg-white transition-colors placeholder:text-gray-300 text-gray-700"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4E612B] bg-white transition-colors placeholder:text-gray-300 text-gray-700"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4E612B] bg-white transition-colors placeholder:text-gray-300 text-gray-700"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Delivery Address */}
          <div className="border border-gray-100/80 rounded-2xl p-5 md:p-6 bg-white/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-bold text-[16px] text-[#0F1E29]">Delivery Address</h3>
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 accent-[#4E612B] cursor-pointer"
                />
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  Save as default address
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Area / Street *</label>
                <input
                  type="text"
                  required
                  value={formData.areaStreet}
                  onChange={(e) => setFormData({ ...formData, areaStreet: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4E612B] bg-white transition-colors placeholder:text-gray-300 text-gray-700"
                  placeholder="Enter area, street or house no."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Landmark <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4E612B] bg-white transition-colors placeholder:text-gray-300 text-gray-700"
                  placeholder="E.g. Near BM College"
                />
              </div>
            </div>

            {/* Input Placeholders Updated */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">City / District *</label>
                <input
                  type="text"
                  required
                  value={formData.cityDistrict}
                  onChange={(e) => setFormData({ ...formData, cityDistrict: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4E612B] bg-white transition-colors placeholder:text-gray-300 text-gray-700"
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Thana / Upazila *</label>
                <input
                  type="text"
                  required
                  value={formData.thanaUpazila}
                  onChange={(e) => setFormData({ ...formData, thanaUpazila: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4E612B] bg-white transition-colors placeholder:text-gray-300 text-gray-700"
                  placeholder="Enter thana"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Post Code <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={formData.postCode}
                  onChange={(e) => setFormData({ ...formData, postCode: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4E612B] bg-white transition-colors placeholder:text-gray-300 text-gray-700"
                  placeholder="Enter post code"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Additional Notes (Placeholder Fixed) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Additional Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
            <textarea
              rows={3}
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#4E612B] bg-white transition-colors resize-none text-gray-700 placeholder:text-gray-300"
              placeholder="E.g. Deliver after 5 PM or leave with security"
            />
          </div>

          {/* Modal Bottom Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer text-sm min-w-[120px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-[#4E612B] hover:bg-[#3D4D22] text-white font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] text-sm min-w-[140px]"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? "Update Address" : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}