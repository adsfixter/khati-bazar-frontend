"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";

import {
  AddressType,
  CartItem,
  CheckoutOrderPayload,
} from "@/src/types/checkout.interface";
import { getUserAddresses } from "@/src/api/checkout";
import { API_BASE_URL } from "@/src/config/api";

import Deliveryslot from "@/src/components/Shopnow/Deliveryslot";
import checkout from "../../../../../public/img/checkout.png";
import {
  BackArrowIcon,
  BkashIcon,
  CardIcon,
  CashIcon,
  EditIcon,
  HomeTypeIcon,
  NagadIcon,
  OfficeTypeIcon,
  OthersTypeIcon,
  PlusIcon,
  Spinner,
  TrashIcon,
} from "@/src/svgIcon/svg";
import { getActivePaymentMethods, submitCheckoutOrder } from "@/src/api/check";
import {
  DBPaymentMethod,
  DeliverySlotWithDateType,
  IAddress as ModalAddressType,
  PaymentUIInfo,
} from "@/src/types/check.interface";
import AddressEditModal from "../checkout-withoutsaveandlogout/_components/AddresseditModal";

const CHECKOUT_STORAGE_KEY = "checkoutOrder";

// ─── Family icon (inline) ───
const FamilyTypeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="10.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M10.5 9c2 0 4 1.5 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const SSL_NAME_ALIASES = ["ssl", "ssl commerce", "sslcommerz", "ssl commerz"];
const isSSLPaymentMethod = (name: string) => SSL_NAME_ALIASES.includes(name.trim().toLowerCase());
const isCODPaymentMethod = (name: string) => name.trim().toLowerCase() === "cash on delivery";

type PaymentUIInfoMap = Record<string, PaymentUIInfo>;

const PAYMENT_UI_MAP: PaymentUIInfoMap = {
  "Cash on Delivery": { icon: <CashIcon />, subLabel: "Pay when you receive" },
  SSL:   { icon: <CardIcon />,  subLabel: "Card / Net Banking via SSL Commerce" },
  Bkash: { icon: <BkashIcon />, subLabel: "Pay with bkash", comingSoon: true },
  Nagad: { icon: <NagadIcon />, subLabel: "Pay with Nagad", comingSoon: true },
  Card:  { icon: <CardIcon />,  subLabel: "Pay with card",  comingSoon: true },
};

const getPaymentUI = (name: string) => {
  if (isCODPaymentMethod(name)) return PAYMENT_UI_MAP["Cash on Delivery"];
  if (isSSLPaymentMethod(name)) return PAYMENT_UI_MAP["SSL"];
  return PAYMENT_UI_MAP[name] ?? { icon: <CardIcon />, subLabel: name, comingSoon: true };
};

const ComingSoonBadge = () => (
  <span className="absolute -top-2 -right-2 bg-orange-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap z-10">
    Soon
  </span>
);

// ✅ "Family" যোগ করা হয়েছে
const addressTypeIcons: Record<string, React.ReactNode> = {
  Home:   <HomeTypeIcon />,
  Office: <OfficeTypeIcon />,
  Family: <FamilyTypeIcon />,
  Others: <OthersTypeIcon />,
};

const getUserIdFromToken = (token: string): string | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.id || decoded._id || decoded.userId || null;
  } catch {
    return null;
  }
};

const AlreadySaveAddress = () => {
  const router = useRouter();

  const [orderData] = useState<CheckoutOrderPayload | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [token] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token") || localStorage.getItem("refreshToken");
  });

  const [userId] = useState<string | null>(() => {
    if (!token) return null;
    return getUserIdFromToken(token);
  });

  const [addresses, setAddresses]               = useState<ModalAddressType[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // ✅ tabs — "Family" যোগ
  const tabs: string[] = ["Home", "Office", "Family", "Others"];
  const [activeTab, setActiveTab] = useState<string>("Home");

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedSlot, setSelectedSlot]           = useState<DeliverySlotWithDateType | null>(null);
  const [dbPaymentMethods, setDbPaymentMethods]   = useState<DBPaymentMethod[]>([]);
  const [loadingPayments, setLoadingPayments]     = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");
  const [submitting, setSubmitting]               = useState(false);

  // 💡 রিয়েল-টাইম স্টক ডেটা ট্র্যাক করার জন্য নতুন স্টেট
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen]         = useState(false);
  const [selectedEditAddress, setSelectedEditAddress] = useState<ModalAddressType | null>(null);

  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      const parsed: CheckoutOrderPayload | null = raw ? JSON.parse(raw) : null;
      const keys = (parsed?.items || []).map((item) => `${item.productId}-${item.variantId}`);
      return new Set(keys);
    } catch { return new Set(); }
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!userId) { setLoadingAddresses(false); return; }
      try {
        const data = await getUserAddresses(userId);
        setAddresses(data);
        const def = data.find((a) => a.isDefault) || data[0];
        if (def) {
          setSelectedAddressId(def._id);
          setActiveTab(def.addressType || "Home");
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [userId]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const methods = await getActivePaymentMethods();
        setDbPaymentMethods(methods);
        const cod = methods.find((m) => isCODPaymentMethod(m.name));
        const ssl = methods.find((m) => isSSLPaymentMethod(m.name));
        if (cod) setSelectedPaymentId(cod._id);
        else if (ssl) setSelectedPaymentId(ssl._id);
        else if (methods[0]) setSelectedPaymentId(methods[0]._id);
      } catch (err) {
        console.error("Failed to fetch payment methods:", err);
        toast.error("Could not load payment methods.");
      } finally {
        setLoadingPayments(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  const allItems = orderData?.items || [];

  // 💡 কার্টের প্রোডাক্টগুলোর বর্তমান স্টক ব্যাকএন্ড থেকে চেক করা
  useEffect(() => {
    if (!allItems.length) return;

    const fetchStocks = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products`);
        const data = await res.json();

        if (!data?.data) return;

        const map: Record<string, number> = {};

        for (const cartItem of allItems) {
          const product = data.data.find(
            (p: { _id: string; variants?: { _id: string; stock: number }[] }) => p._id === cartItem.productId
          );
          if (!product) continue;

          // আপনার API রেসপন্স অনুযায়ী সরাসরি variant._id ম্যাচ করা হচ্ছে
          const variant = product.variants?.find(
            (v: { _id: string; stock: number }) => v._id === cartItem.variantId
          );
          if (variant) {
            map[`${cartItem.productId}-${cartItem.variantId}`] = variant.stock;
          }
        }
        setStockMap(map);
      } catch (err) {
        console.error("Failed to fetch stock info:", err);
      }
    };

    fetchStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allItems]);

  // ✅ activeTab যেকোনো string — "Family" সহ filter কাজ করবে
  const visibleAddresses    = addresses.filter((a) => a.addressType === activeTab);
  const selectedAddress     = addresses.find((a) => a._id === selectedAddressId) || null;
  const selectedPaymentMethod = dbPaymentMethods.find((m) => m._id === selectedPaymentId) || null;

  const handleEditAddress = (addr: ModalAddressType) => {
    setSelectedEditAddress(addr);
    setIsEditModalOpen(true);
  };

  const handleUpdateSuccess = (updatedAddress: ModalAddressType) => {
    setAddresses((prev) =>
      prev.map((item) => (item._id === updatedAddress._id ? { ...item, ...updatedAddress } : item))
    );
  };

  const handleRemoveAddress = async (_id: string) => {
    if (!window.confirm("Are you sure you want to remove this address?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/addresses/${_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Address removed successfully!");
        setAddresses((prev) => prev.filter((addr) => addr._id !== _id));
        if (selectedAddressId === _id) setSelectedAddressId("");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.message || "Failed to remove address");
      }
    } catch (error) {
      console.error("Delete address error:", error);
      toast.error("Something went wrong while removing address!");
    }
  };

  const handlePaymentMethodClick = (method: DBPaymentMethod) => {
    const ui = getPaymentUI(method.name);
    if (ui.comingSoon) {
      toast.info("🚧 Coming soon! Only Cash on Delivery and SSL Commerce are available right now.", {
        position: "top-center", autoClose: 2500,
      });
      return;
    }
    setSelectedPaymentId(method._id);
  };

  const getItemKey = (item: CartItem) => `${item.productId}-${item.variantId}`;
  const toggleItemSelection = (item: CartItem) => {
    const key = getItemKey(item);
    setSelectedItemKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const allSelected = allItems.length > 0 && selectedItemKeys.size === allItems.length;
  const toggleSelectAll = () => {
    setSelectedItemKeys(allSelected ? new Set() : new Set(allItems.map(getItemKey)));
  };

  const selectedItems          = allItems.filter((item) => selectedItemKeys.has(getItemKey(item)));
  const selectedSubtotal       = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedDeliveryCharge = selectedItems.length > 0 ? orderData?.deliveryCharge || 0 : 0;
  const selectedDiscount       = allSelected ? orderData?.discount || 0 : 0;
  const selectedTotal          = Math.max(0, selectedSubtotal + selectedDeliveryCharge - selectedDiscount);

  const cleanUpOrderedItems = (orderedItems: CartItem[]) => {
    try {
      localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      const mainCartKey = localStorage.getItem("cart") ? "cart" : "cartItems";
      const rawCart = localStorage.getItem(mainCartKey);
      if (rawCart) {
        const currentCartItems: CartItem[] = JSON.parse(rawCart);
        const remainingItems = currentCartItems.filter(
          (cartItem) => !orderedItems.some(
            (ordered) => ordered.productId === cartItem.productId && ordered.variantId === cartItem.variantId
          )
        );
        localStorage.setItem(mainCartKey, JSON.stringify(remainingItems));
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (e) {
      console.error("Storage cleanup failed:", e);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress)        { toast.error("Please select a delivery address!"); return; }
    if (!selectedSlot)           { toast.error("Please select a delivery slot!");    return; }
    if (!selectedPaymentId)      { toast.error("Please select a payment method!");   return; }
    if (selectedItems.length === 0) { toast.error("Please select at least one item to order!"); return; }

    // 🛑 সাবমিট করার আগে স্টক চেক (Validation)
    for (const item of selectedItems) {
      const itemKey = getItemKey(item);
      const availableStock = stockMap[itemKey];

if (availableStock !== undefined && item.quantity > availableStock) {
  toast.error(
    `🚨 ${item.name} (${item.weight}) is out of stock! Available stock: ${availableStock}. Please reduce the quantity or remove the item.`,
    { position: "top-center", autoClose: 4000 }
  );
  return; 
}
    }

    setSubmitting(true);
    try {
      const products = selectedItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity:  item.quantity,
        price:     item.price,
        name:      item.name,
        weight:    item.weight,
        image:     item.image,
      }));

      const payload = {
        products,
        addressId:        selectedAddress._id,
        deliverySlotId:   selectedSlot._id,
        deliveryDateType: selectedSlot.dateType ?? "Today",
        paymentMethodId:  selectedPaymentId,
        couponCode:       allSelected ? orderData?.appliedCoupons?.[0] : undefined,
        additionalNotes:  "",
      };

      console.log("📦 Order payload:", JSON.stringify(payload, null, 2));

      const res = await submitCheckoutOrder(payload, token);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.message || "Order failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      console.log("📩 Order response:", data);

      if (!data || (data.success !== undefined && !data.success)) {
        toast.error(data?.message || "Order processing failed on server.");
        setSubmitting(false);
        return;
      }

      if (data?.data?.paymentType === "Gateway" && data?.data?.paymentUrl) {
        toast.success("Redirecting to payment gateway...");
        sessionStorage.setItem("pendingOrderItems", JSON.stringify(selectedItems));
        window.location.assign(data.data.paymentUrl);
        return;
      }

      if (data?.data?.paymentType === "COD") {
        cleanUpOrderedItems(selectedItems);
        toast.success("🎉 Order placed successfully!");
        router.push(`/checkout/success?orderId=${data.data.order?._id || data.data._id}`);
        return;
      }

      cleanUpOrderedItems(selectedItems);
      toast.success("Order placed!");
      router.push("/");
    } catch (err) {
      console.error("Place order error:", err);
      toast.error("Network error or something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const customerName = selectedAddress?.fullName || "there";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center">
          <BackArrowIcon />
        </button>
        <h4 className="text-[24px] font-semibold text-[#1E1E1E] font-montserrat">Checkout</h4>
      </div>

      {/* Welcome Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-[#E9E9E9] bg-[#FAFAFA] px-6 py-4 mb-6">
        <div>
          <p className="text-[15px] font-semibold text-[#1E1E1E]">Welcome back, {customerName} 👋</p>
          <p className="text-[13px] text-[#7F8482]">Review your details and place your order in just a few clicks.</p>
        </div>
        <Image src={checkout} alt="Welcome" width={64} height={70} className="hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        {/* Delivery Address */}
        <div className="rounded-2xl border border-[#E9E9E9] bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[18px] font-bold text-[#1E1E1E]">Delivery Address</h3>
            <button
              onClick={() => router.push("/checkout-withoutsaveandlogout")}
              className="flex items-center gap-1.5 rounded-lg border border-[#E9E9E9] px-3 py-1.5 text-[13px] font-medium text-[#37651B] hover:bg-[#FAFAFA]"
            >
              <PlusIcon />
              Add New Address
            </button>
          </div>

          {/* ✅ Tabs — Home / Office / Family / Others */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              const count    = addresses.filter((a) => a.addressType === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-all ${
                    isActive
                      ? "border-[#37651B] bg-[#37651B] text-white"
                      : "border-[#E9E9E9] bg-white text-[#1E1E1E] hover:border-[#37651B]/40"
                  }`}
                >
                  {addressTypeIcons[tab]}
                  {tab}
                  {count > 0 && (
                    <span className={`text-[11px] ${isActive ? "text-white/80" : "text-[#7F8482]"}`}>
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Address List */}
          {loadingAddresses ? (
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="h-24 bg-gray-100 rounded-xl" />
              <div className="h-24 bg-gray-100 rounded-xl" />
            </div>
          ) : visibleAddresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E9E9E9] py-10 text-center">
              <p className="text-[13px] text-[#7F8482]">No {activeTab.toLowerCase()} address saved yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {visibleAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr._id;
                return (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddressId(addr._id)}
                    className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
                      isSelected
                        ? "border-[#37651B] bg-[#F4F8F1]"
                        : "border-[#E9E9E9] bg-white hover:border-[#37651B]/30"
                    }`}
                  >
                    {addr.isDefault && (
                      <span className="absolute -top-2.5 right-5 bg-[#37651B] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                        Default
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${isSelected ? "bg-[#37651B] text-white" : "bg-[#F0F0F0] text-[#6B6B6B]"}`}>
                        {addressTypeIcons[addr.addressType] || addressTypeIcons["Home"]}
                      </div>
                      <div className="flex-1">
                        <p className="text-[15px] font-semibold text-[#1E1E1E]">{addr.fullName}</p>
                        <p className="text-[12px] text-[#7F8482]">{addr.phone}</p>
                        <p className="mt-1 text-[13px] text-[#3C3C3C]">
                          {addr.areaStreet}, {addr.cityDistrict} - {addr.postCode}, Bangladesh
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                            className="flex items-center gap-1.5 rounded-lg border border-[#E9E9E9] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1E1E1E] hover:bg-[#FAFAFA]"
                          >
                            <EditIcon /> Edit Address
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveAddress(addr._id); }}
                            className="flex items-center gap-1.5 rounded-lg border border-[#E9E9E9] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1E1E1E] hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                          >
                            <TrashIcon /> Remove
                          </button>
                        </div>
                      </div>
                      <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-[#37651B]" : "border-[#E9E9E9]"}`}>
                        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-[#37651B]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="rounded-2xl border border-[#E9E9E9] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-bold text-[#1E1E1E]">Order Summary</h3>
            {allItems.length > 1 && (
              <button onClick={toggleSelectAll} className="text-[12px] font-medium text-[#37651B] hover:underline">
                {allSelected ? "Deselect all" : "Select all"}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 mb-4">
            {allItems.length === 0 ? (
              <p className="text-[13px] text-[#7F8482]">Your cart is empty.</p>
            ) : (
              allItems.map((item, idx) => {
                const key       = getItemKey(item);
                const isChecked = selectedItemKeys.has(key);
                
                // 💡 কার্ট কোয়ান্টিটি এভেইলেবল স্টকের চেয়ে বেশি কি না চেক করা হচ্ছে
                const outOfStock = stockMap[key] !== undefined && item.quantity > stockMap[key];

                return (
                  <label key={`${key}-${idx}`} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItemSelection(item)}
                      className="h-4 w-4 flex-shrink-0 accent-[#37651B] cursor-pointer"
                    />
                    <div className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#FAFAFA] transition-opacity ${isChecked ? "opacity-100" : "opacity-40"}`}>
                      <Image
                        src={item.image || "/img/checkout.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized={item.image?.startsWith("http")}
                      />
                    </div>
                    <div className={`flex-1 transition-opacity ${isChecked ? "opacity-100" : "opacity-40"}`}>
                      <p className="text-[13px] font-semibold text-[#1E1E1E]">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] text-[#7F8482]">
                          {item.weight} {item.quantity > 1 ? `x ${item.quantity}` : ""}
                        </p>
                        {/* 💡 স্টক এভেইলেবল না থাকলে UI-তে ওয়ার্নিং ট্যাগ */}
                        {outOfStock && (
                          <span className="text-[10px] font-medium bg-red-50 text-red-600 px-1 rounded">
                            Stock Out ({stockMap[key]})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[13px] font-semibold text-[#1E1E1E] transition-opacity ${isChecked ? "opacity-100" : "opacity-40"}`}>
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          <div className="border-t border-[#F2F2F2] pt-3 flex flex-col gap-2 text-[13px]">
            <div className="flex items-center justify-between text-[#6B6B6B]">
              <span>Subtotal ({selectedItems.length} selected)</span>
              <span className="text-[#1E1E1E] font-medium">৳{selectedSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[#6B6B6B]">
              <span>Delivery Charge</span>
              <span className="text-[#1E1E1E] font-medium">
                {selectedDeliveryCharge ? `৳${selectedDeliveryCharge}` : "Free"}
              </span>
            </div>
            {selectedDiscount > 0 && (
              <div className="flex items-center justify-between text-[#37651B]">
                <span>Discount {orderData?.appliedCoupons?.[0] && `(${orderData.appliedCoupons[0]})`}</span>
                <span className="font-medium">-৳{selectedDiscount.toLocaleString()}</span>
              </div>
            )}
            {!allSelected && (orderData?.discount || 0) > 0 && (
              <p className="text-[11px] text-[#B45309]">
                ⚠️ Coupon discount applies only when all cart items are selected.
              </p>
            )}
          </div>

          <div className="border-t border-[#E9E9E9] mt-3 pt-3 flex items-center justify-between">
            <span className="text-[16px] font-semibold text-[#1E1E1E]">Total</span>
            <span className="text-[22px] font-bold text-[#37651B] font-aeonik">
              ৳{selectedTotal.toLocaleString()}
            </span>
          </div>

          {selectedPaymentMethod && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F4F8F1] px-3 py-2">
              <span className="text-[12px] text-[#7F8482]">Paying via</span>
              <span className="text-[12px] font-semibold text-[#37651B]">{selectedPaymentMethod.name}</span>
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={submitting || selectedItems.length === 0}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#37651B] text-[15px] font-semibold text-white transition-all hover:bg-[#2c5215] disabled:opacity-60"
          >
            {submitting ? (
              <><Spinner /><span>Processing...</span></>
            ) : (
              `Place Order (${selectedItems.length})`
            )}
          </button>

          <p className="mt-2 text-center text-[11px] text-[#7F8482]">
            By continuing, you agree to our{" "}
            <span className="text-[#37651B] font-medium cursor-pointer hover:underline">Terms & Conditions</span>
          </p>
        </div>
      </div>

      {/* Delivery Slot */}
      <div className="mt-6">
        <Deliveryslot onSlotSelect={setSelectedSlot} />
      </div>

      {/* Payment Method */}
      <div className="mt-6 rounded-2xl border border-[#E9E9E9] bg-white p-6">
        <h3 className="text-[18px] font-bold text-[#1E1E1E] mb-1">Payment Method</h3>
        <p className="text-[12px] text-[#7F8482] mb-4">
          Only Cash on Delivery and SSL Commerce (cards / net banking) are available right now. Other options are coming soon.
        </p>

        {loadingPayments ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
          </div>
        ) : dbPaymentMethods.length === 0 ? (
          <p className="text-[13px] text-[#7F8482]">No payment methods available.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {dbPaymentMethods.map((method) => {
              const ui         = getPaymentUI(method.name);
              const isSelected = selectedPaymentId === method._id && !ui.comingSoon;
              return (
                <div
                  key={method._id}
                  onClick={() => handlePaymentMethodClick(method)}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 flex items-center justify-between transition-all ${
                    ui.comingSoon
                      ? "border-[#E9E9E9] bg-[#FAFAFA] opacity-70 cursor-not-allowed"
                      : isSelected
                      ? "border-[#37651B] bg-[#EBF0E8]"
                      : "border-[#E9E9E9] bg-white hover:border-[#37651B]/30"
                  }`}
                >
                  {ui.comingSoon && <ComingSoonBadge />}
                  <div className="flex items-center gap-2.5">
                    {method.logo
                      ? <Image src={method.logo} alt={method.name} width={28} height={28} className="object-contain" unoptimized />
                      : ui.icon
                    }
                    <div>
                      <p className="text-[14px] font-semibold text-[#1E1E1E]">{method.name}</p>
                      <p className="text-[11px] text-[#7F8482]">{ui.subLabel}</p>
                    </div>
                  </div>
                  {!ui.comingSoon && (
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? "border-[#37651B]" : "border-[#E9E9E9]"}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#37651B]" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Address Modal */}
      <AddressEditModal
        key={selectedEditAddress?._id || "edit-modal"}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        addressData={selectedEditAddress}
        onUpdateSuccess={handleUpdateSuccess}
        token={token || ""}
      />
    </div>
  );
};

export default AlreadySaveAddress;