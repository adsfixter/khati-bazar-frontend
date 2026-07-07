

"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Home, Briefcase, Users, MapPin, Loader2 } from "lucide-react";
import { useAddress } from "@/src/hooks/useAddressData";
import AddressModal, { type FormDataState } from "./AddressModal";

type AddressTypeFilter = "All" | "Home" | "Office" | "Family" | "Others";

const initialFormState: FormDataState = {
  addressType: "Home",
  fullName: "",
  phone: "",
  email: "",
  areaStreet: "",
  landmark: "",
  cityDistrict: "",
  thanaUpazila: "",
  postCode: "",
  additionalNotes: "",
  isDefault: false,
};

// 💡 AlreadySaveAddress থেকে আনা টোকেন ডিকোড করার হেল্পার ফাংশন
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

export default function SavedAddressesPage() {
  const [activeTab, setActiveTab] = useState<AddressTypeFilter>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFormData, setSelectedFormData] = useState<FormDataState>(initialFormState);

  // 💡 AlreadySaveAddress এর মতো করে lazy initializer দিয়ে ডাইনামিক টোকেন থেকে userId বের করা
  const [userId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const token =
      localStorage.getItem("token") || localStorage.getItem("refreshToken");
    return token ? getUserIdFromToken(token) : null;
  });

  // custom hook এ আইডি পাস করা (id না থাকলে ফ্যালব্যাক খালি স্ট্রিং)
  const { addresses = [], isLoadingAddresses, createAddress, updateAddress, deleteAddress } = useAddress(userId || "");

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isModalOpen]);

  // টোকেন বা ইউজার আইডি না পাওয়া গেলে ইউজারকে লগইন এলার্ট দেওয়া
  if (!userId) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-gray-100">
        <p className="text-sm font-medium text-gray-500">Please log in to view or manage your saved addresses.</p>
      </div>
    );
  }

  if (isLoadingAddresses) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D4A3E]" />
        <p className="text-sm text-gray-500">Loading your saved addresses...</p>
      </div>
    );
  }

  const filteredAddresses = addresses.filter((addr: any) => {
    if (activeTab === "All") return true;
    return addr.addressType.toLowerCase() === activeTab.toLowerCase();
  });

  const handleSetDefault = async (id: string) => {
    try {
      await updateAddress({ id, userId, data: { isDefault: true } });
    } catch (err) {
      console.error("Error setting default address:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this address?")) {
      try {
        await deleteAddress(id);
      } catch (err) {
        console.error("Error deleting address:", err);
      }
    }
  };

  const handleEditClick = (addr: any) => {
    setSelectedFormData({
      _id: addr._id,
      addressType: addr.addressType,
      fullName: addr.fullName,
      phone: addr.phone,
      email: addr.email || "",
      areaStreet: addr.areaStreet,
      landmark: addr.landmark || "",
      cityDistrict: addr.cityDistrict,
      thanaUpazila: addr.thanaUpazila,
      postCode: addr.postCode || "",
      additionalNotes: addr.additionalNotes || "",
      isDefault: addr.isDefault,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: FormDataState) => {
    if (isEditing && formData._id) {
      await updateAddress({ id: formData._id, userId, data: formData });
    } else {
      await createAddress({ ...formData, userId });
    }
    setIsModalOpen(false);
  };

  const getIcon = (type: string, isForCard = true) => {
    const size = isForCard ? 18 : 14;
    const color = isForCard ? "text-[#2D4A3E]" : "currentColor";
    switch (type.toLowerCase()) {
      case "home": return <Home size={size} className={color} />;
      case "office": return <Briefcase size={size} className={color} />;
      case "family": return <Users size={size} className={color} />;
      default: return <MapPin size={size} className={color} />;
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 p-2 md:p-6 text-[#1E1E1E]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="font-montserrat font-semibold text-2xl md:text-3xl text-[#1E1E1E]">Saved Addresses</p>
          <p className="text-xs text-gray-400 mt-1">{addresses.length} Saved Address</p>
        </div>

        {/* TOP FILTER TABS */}
        <div className="flex flex-wrap items-center gap-2 font-sans text-xs font-medium bg-gray-50 p-1 rounded-xl border border-gray-100">
          {(["All", "Home", "Office", "Family", "Others"] as AddressTypeFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab ? "bg-[#2D4A3E] text-white shadow-xs" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
              }`}
            >
              {tab !== "All" && getIcon(tab, false)}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ADDRESS GRID BLOCK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {filteredAddresses.map((addr: any) => (
          <div
            key={addr._id}
            onClick={() => !addr.isDefault && handleSetDefault(addr._id)}
            className={`relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between cursor-pointer group ${
              addr.isDefault ? "border-[#2D4A3E] bg-[#F4F7F5]" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs"
            }`}
          >
            {addr.isDefault && (
              <span className="absolute -top-3 left-4 bg-[#2D4A3E] text-white font-sans font-semibold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                Default
              </span>
            )}

            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${addr.isDefault ? 'bg-white border-[#2D4A3E]/20' : 'bg-gray-50 border-gray-100'}`}>
                    {getIcon(addr.addressType)}
                  </div>
                  <div>
                    <p className="font-semibold text-[18px] text-[#1E1E1E] tracking-tight">{addr.fullName}</p>
                    <p className="font-mono text-xs text-gray-400 mt-0.5">{addr.phone}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${addr.isDefault ? "border-[#2D4A3E]" : "border-gray-200"}`}>
                  {addr.isDefault && <div className="w-2.5 h-2.5 rounded-full bg-[#2D4A3E]" />}
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed font-sans mb-6 pl-1">
                {addr.areaStreet}, {addr.thanaUpazila}, {addr.cityDistrict} - {addr.postCode}, Bangladesh
              </p>
            </div>

            <div className="flex items-center gap-2 border-t border-gray-100/70 pt-3 mt-auto">
              <button
                onClick={(e) => { e.stopPropagation(); handleEditClick(addr); }}
                className="flex-1 flex items-center justify-center gap-1.5 font-sans text-xs font-semibold py-2 px-3 border border-gray-100 rounded-xl bg-white text-gray-600 hover:bg-gray-50 hover:text-[#1E1E1E] transition-all cursor-pointer"
              >
                <Pencil size={13} /> Edit Address
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(addr._id); }}
                className="flex-1 flex items-center justify-center gap-1.5 font-sans text-xs font-semibold py-2 px-3 border border-gray-100 rounded-xl bg-white text-gray-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all cursor-pointer"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        ))}

        {/* ADD NEW ADDRESS CARD */}
        <div
          onClick={() => {
            setSelectedFormData(initialFormState);
            setIsEditing(false);
            setIsModalOpen(true);
          }}
          className="border-2 border-dashed border-gray-200 hover:border-[#2D4A3E]/40 hover:bg-gray-50/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 min-h-[180px] transition-all duration-300 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#E8F0EC] flex items-center justify-center border border-gray-100 transition-colors">
            <Plus size={20} className="text-gray-400 group-hover:text-[#2D4A3E]" />
          </div>
          <span className="text-xs font-semibold text-gray-500 group-hover:text-[#2D4A3E] font-sans">Add new address</span>
        </div>
      </div>

      {/* REUSABLE ADDRESS MODAL COMPONENT */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditing={isEditing}
        initialData={selectedFormData}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}