"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { Spinner } from "@/src/svgIcon/svg";
import { AddressEditModalProps } from "@/src/types/check.interface";
import { updateAddress } from "@/src/api/check";

type AddressType = "Home" | "Office" | "Family" | "Others";

const HomeTypeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 7L8 2L14 7M3.5 6V13.5H12.5V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const OfficeTypeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5 7h2M9 7h2M5 10h2M9 10h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const FamilyTypeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="10.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M10.5 9c2 0 4 1.5 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const OthersTypeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="3" cy="8" r="1.2" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="13" cy="8" r="1.2" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const ADDRESS_TYPE_OPTIONS: { value: AddressType; label: string; icon: React.ReactNode }[] = [
  { value: "Home",   label: "Home",   icon: <HomeTypeIcon /> },
  { value: "Office", label: "Office", icon: <OfficeTypeIcon /> },
  { value: "Family", label: "Family", icon: <FamilyTypeIcon /> },
  { value: "Others", label: "Others", icon: <OthersTypeIcon /> },
];

const AddressEditModal: React.FC<AddressEditModalProps> = ({
  isOpen,
  onClose,
  addressData,
  onUpdateSuccess,
  token,
}) => {
  const [submitting, setSubmitting] = useState(false);

  const [addressType, setAddressType] = useState<AddressType>(
    (addressData?.addressType as AddressType) || "Home"
  );

  const [formData, setFormData] = useState({
    fullName:        addressData?.fullName        || "",
    phone:           addressData?.phone           || "",
    email:           addressData?.email           || "",
    areaStreet:      addressData?.areaStreet      || "",
    landmark:        addressData?.landmark        || "",
    cityDistrict:    addressData?.cityDistrict    || "",
    thanaUpazila:    addressData?.thanaUpazila    || "",
    postCode:        addressData?.postCode        || "",
    additionalNotes: addressData?.additionalNotes || "",
  });

  if (!isOpen || !addressData) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = { ...formData, addressType }; // ✅ addressType included
      const res = await updateAddress(addressData._id, payload, token);
      const result = await res.json();

      if (res.ok && result.success) {
        toast.success("Address updated successfully!");
        onUpdateSuccess(result.data || { ...addressData, ...payload });
        onClose();
      } else {
        toast.error(result.message || "Failed to update address");
      }
    } catch (error) {
      console.error("Update address error:", error);
      toast.error("Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#F2F2F2] pb-3 mb-4">
          <h3 className="text-[18px] font-bold text-[#1E1E1E]">Edit Delivery Address</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Address Type ── */}
          <div>
            <p className="text-[13px] text-[#6B6B6B] mb-2">Address Type</p>
            <div className="flex items-center gap-2 flex-wrap">
              {ADDRESS_TYPE_OPTIONS.map((opt) => {
                const isActive = addressType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAddressType(opt.value)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-all ${
                      isActive
                        ? "border-[#37651B] bg-[#37651B] text-white"
                        : "border-[#E9E9E9] bg-white text-[#1E1E1E] hover:border-[#37651B]/40"
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Contact Info ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-[13px] text-[#6B6B6B] mb-1 block">Full Name *</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B]"
              />
            </div>
            <div>
              <label className="text-[13px] text-[#6B6B6B] mb-1 block">Phone Number *</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B]"
              />
            </div>
            <div>
              <label className="text-[13px] text-[#6B6B6B] mb-1 block">Email (Optional)</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B]"
              />
            </div>
          </div>

          {/* ── Address Fields ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[13px] text-[#6B6B6B] mb-1 block">Area / Street *</label>
              <input
                name="areaStreet"
                value={formData.areaStreet}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B]"
              />
            </div>
            <div>
              <label className="text-[13px] text-[#6B6B6B] mb-1 block">Landmark (Optional)</label>
              <input
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-[13px] text-[#6B6B6B] mb-1 block">City / District *</label>
              <select
                name="cityDistrict"
                value={formData.cityDistrict}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B] bg-white"
              >
                <option value="">Select your city</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Barishal">Barishal</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Khulna">Khulna</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Sylhet">Sylhet</option>
              </select>
            </div>
            <div>
              <label className="text-[13px] text-[#6B6B6B] mb-1 block">Thana / Upazila *</label>
              <select
                name="thanaUpazila"
                value={formData.thanaUpazila}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B] bg-white"
              >
                <option value="">Select thana</option>
                <option value="Sadar">Sadar</option>
                <option value="Kotwali">Kotwali</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[13px] text-[#6B6B6B] mb-1 block">Post Code</label>
              <input
                name="postCode"
                value={formData.postCode}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B]"
              />
            </div>
          </div>

          <div>
            <label className="text-[13px] text-[#6B6B6B] mb-1 block">Additional Notes</label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              rows={2}
              className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-[#F2F2F2] pt-4 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E9E9E9] px-4 py-2 text-[14px] font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#37651B] px-5 py-2 text-[14px] font-semibold text-white hover:bg-[#2c5215] disabled:opacity-60"
            >
              {submitting ? <Spinner /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressEditModal;