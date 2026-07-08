"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";

import { CartItem, CheckoutOrderPayload } from "@/src/types/checkout.interface";
import { API_BASE_URL } from "@/src/config/api";

import Deliveryslot from "@/src/components/Shopnow/Deliveryslot";
import {
  BackArrowIcon,
  BkashIcon,
  CardIcon,
  CashIcon,
  FamilyTypeIcon,
  HomeTypeIcon,
  NagadIcon,
  OfficeTypeIcon,
  OthersTypeIcon,
  Spinner,
} from "@/src/svgIcon/svg";
import {
  CustomerFormData,
  DBPaymentMethod,
  DeliverySlotWithDateType,
  PaymentUIInfo,
} from "@/src/types/check.interface";
import { getActivePaymentMethods, submitCheckoutOrder } from "@/src/api/check";
import { createUserAddress } from "@/src/api/cart";

const CHECKOUT_STORAGE_KEY = "checkoutOrder";

type AddressType = "Home" | "Office" | "Family" | "Others";

type PaymentUIInfoMap = Record<string, PaymentUIInfo>;

const PAYMENT_UI_MAP: PaymentUIInfoMap = {
  "Cash on Delivery": { icon: <CashIcon />, subLabel: "Pay when you receive" },
  SSL: { icon: <CardIcon />, subLabel: "Card / Net Banking via SSL Commerce" },
  Bkash: { icon: <BkashIcon />, subLabel: "Pay with bkash", comingSoon: true },
  Nagad: { icon: <NagadIcon />, subLabel: "Pay with Nagad", comingSoon: true },
  Card: { icon: <CardIcon />, subLabel: "Pay with card", comingSoon: true },
};

const SSL_NAME_ALIASES = ["ssl", "ssl commerce", "sslcommerz", "ssl commerz"];
const isSSLPaymentMethod = (name: string) =>
  SSL_NAME_ALIASES.includes(name.trim().toLowerCase());
const isCODPaymentMethod = (name: string) =>
  name.trim().toLowerCase() === "cash on delivery";

const getPaymentUI = (name: string): PaymentUIInfo => {
  if (isCODPaymentMethod(name)) return PAYMENT_UI_MAP["Cash on Delivery"];
  if (isSSLPaymentMethod(name)) return PAYMENT_UI_MAP["SSL"];
  return (
    PAYMENT_UI_MAP[name] ?? {
      icon: <CardIcon />,
      subLabel: name,
      comingSoon: true,
    }
  );
};

const ComingSoonBadge = () => (
  <span className="absolute -top-2 -right-2 bg-orange-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap z-10">
    Soon
  </span>
);

// ─── Address Type Icons ───
// const HomeTypeIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M2 7L8 2L14 7M3.5 6V13.5H12.5V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
//   </svg>
// );
// const OfficeTypeIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
//     <path d="M5 7h2M9 7h2M5 10h2M9 10h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
//   </svg>
// );
// const FamilyTypeIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <circle cx="5.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
//     <circle cx="10.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
//     <path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
//     <path d="M10.5 9c2 0 4 1.5 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
//   </svg>
// );
// const OthersTypeIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
//     <circle cx="3" cy="8" r="1.2" stroke="currentColor" strokeWidth="1.2" />
//     <circle cx="13" cy="8" r="1.2" stroke="currentColor" strokeWidth="1.2" />
//   </svg>
// );

const ADDRESS_TYPE_OPTIONS: {
  value: AddressType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "Home", label: "Home", icon: <HomeTypeIcon /> },
  { value: "Office", label: "Office", icon: <OfficeTypeIcon /> },
  { value: "Family", label: "Family", icon: <FamilyTypeIcon /> },
  { value: "Others", label: "Others", icon: <OthersTypeIcon /> },
];

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

const NotSaveAddress = () => {
  const router = useRouter();

  const [orderData] = useState<CheckoutOrderPayload | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
      console.warn("No checkoutOrder found in localStorage.");
      return null;
    } catch (error) {
      console.error("Failed to parse checkoutOrder:", error);
      return null;
    }
  });

  const [isLoggedIn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const token =
      localStorage.getItem("token") || localStorage.getItem("refreshToken");
    return !!token;
  });

  const [selectedSlot, setSelectedSlot] =
    useState<DeliverySlotWithDateType | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // ─── Address Type Selection ───
  const [selectedAddressType, setSelectedAddressType] =
    useState<AddressType>("Home");

  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    area: "",
    landmark: "",
    city: "",
    thana: "",
    postCode: "",
    additionalNotes: "",
    saveAsDefault: false,
  });

  const [dbPaymentMethods, setDbPaymentMethods] = useState<DBPaymentMethod[]>(
    [],
  );
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");

  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      const parsed: CheckoutOrderPayload | null = raw ? JSON.parse(raw) : null;
      const keys = (parsed?.items || []).map(
        (item) => `${item.productId}-${item.variantId}`,
      );
      return new Set(keys);
    } catch {
      return new Set();
    }
  });

  const allItems = orderData?.items || [];

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
            (p: { _id: string; variants?: { _id: string; stock: number }[] }) =>
              p._id === cartItem.productId,
          );
          if (!product) continue;

          const variant = product.variants?.find(
            (v: { _id: string; stock: number }) => v._id === cartItem.variantId,
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

  const getItemKey = (item: CartItem) => `${item.productId}-${item.variantId}`;

  const toggleItemSelection = (item: CartItem) => {
    const key = getItemKey(item);
    setSelectedItemKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const allSelected =
    allItems.length > 0 && selectedItemKeys.size === allItems.length;

  const toggleSelectAll = () => {
    setSelectedItemKeys(
      allSelected ? new Set() : new Set(allItems.map(getItemKey)),
    );
  };

  const selectedItems = allItems.filter((item) =>
    selectedItemKeys.has(getItemKey(item)),
  );
  const selectedSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const selectedDeliveryCharge =
    selectedItems.length > 0 ? orderData?.deliveryCharge || 0 : 0;
  const selectedDiscount = allSelected ? orderData?.discount || 0 : 0;
  const selectedTotal = Math.max(
    0,
    selectedSubtotal + selectedDeliveryCharge - selectedDiscount,
  );

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

  const selectedPaymentMethod =
    dbPaymentMethods.find((m) => m._id === selectedPaymentId) || null;

  const handlePaymentMethodClick = (method: DBPaymentMethod) => {
    const ui = getPaymentUI(method.name);
    if (ui.comingSoon) {
      toast.info(
        "🚧 Coming soon! Only Cash on Delivery and SSL Commerce are available right now.",
        {
          position: "top-center",
          autoClose: 2500,
        },
      );
      return;
    }
    setSelectedPaymentId(method._id);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const cleanUpOrderedItems = (orderedItems: CartItem[]) => {
    try {
      localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      const mainCartKey = localStorage.getItem("cart") ? "cart" : "cartItems";
      const rawCart = localStorage.getItem(mainCartKey);
      if (rawCart) {
        const currentCartItems: CartItem[] = JSON.parse(rawCart);
        const remainingItems = currentCartItems.filter(
          (cartItem) =>
            !orderedItems.some(
              (ordered) =>
                ordered.productId === cartItem.productId &&
                ordered.variantId === cartItem.variantId,
            ),
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
    if (!isLoggedIn) {
      toast.error("Please log in first to place your order!");
      router.push("/login");
      return;
    }
    if (!formData.fullName.trim() || !formData.phoneNumber.trim()) {
      toast.error("Full name and phone number are required!");
      return;
    }
    if (
      !formData.area.trim() ||
      !formData.city.trim() ||
      !formData.thana.trim()
    ) {
      toast.error("Please complete the delivery address!");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please select a delivery slot!");
      return;
    }
    if (!selectedPaymentId) {
      toast.error("Please select a payment method!");
      return;
    }
    if (!orderData?.items?.length) {
      toast.error("Your cart is empty!");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to order!");
      return;
    }

    for (const item of selectedItems) {
      const itemKey = getItemKey(item);
      const availableStock = stockMap[itemKey];

      if (availableStock !== undefined && item.quantity > availableStock) {
        toast.error(
          `🚨 ${item.name} (${item.weight}) is out of stock! Available stock: ${availableStock}. Please reduce the quantity or remove the item.`,
          { position: "top-center", autoClose: 4000 },
        );
        return;
      }
    }

    const token =
      localStorage.getItem("token") || localStorage.getItem("refreshToken");
    if (!token) {
      toast.error("Please log in first to place your order!");
      router.push("/login");
      return;
    }
    const userId = getUserIdFromToken(token);
    if (!userId) {
      toast.error("Could not verify your account. Please log in again.");
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const addressPayload = {
        userId,
        addressType: selectedAddressType, // ✅ dynamic from selector
        fullName: formData.fullName,
        phone: formData.phoneNumber,
        email: formData.email || undefined,
        areaStreet: formData.area,
        landmark: formData.landmark || undefined,
        cityDistrict: formData.city,
        thanaUpazila: formData.thana, // ✅ correct backend field name
        postCode: formData.postCode || undefined,
        additionalNotes: formData.additionalNotes || undefined,
        isDefault: formData.saveAsDefault,
      };

      const addressRes = await createUserAddress(addressPayload, token);
      if (!addressRes.ok) {
        const errData = await addressRes.json().catch(() => ({}));
        toast.error(
          errData?.message || "Failed to save address. Please try again.",
        );
        setSubmitting(false);
        return;
      }

      const addressData = await addressRes.json();
      const newAddressId = addressData?.data?._id;
      if (!newAddressId) {
        toast.error("Address was not saved properly. Please try again.");
        setSubmitting(false);
        return;
      }

      const products = selectedItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        weight: item.weight,
        image: item.image,
      }));

      const orderPayload = {
        products,
        addressId: newAddressId,
        deliverySlotId: selectedSlot._id,
        deliveryDateType: selectedSlot.dateType ?? "Today",
        paymentMethodId: selectedPaymentId,
        couponCode: allSelected ? orderData.appliedCoupons?.[0] : undefined,
        additionalNotes: formData.additionalNotes || "",
      };

      console.log("📦 Order payload:", JSON.stringify(orderPayload, null, 2));

      const orderRes = await submitCheckoutOrder(orderPayload, token);
      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        toast.error(errData?.message || "Order failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const data = await orderRes.json();
      console.log("📩 Order response:", data);

      if (!data || (data.success !== undefined && !data.success)) {
        toast.error(data?.message || "Order processing failed on server.");
        setSubmitting(false);
        return;
      }

      if (data?.data?.paymentType === "Gateway" && data?.data?.paymentUrl) {
        toast.success("Redirecting to payment gateway...");
        sessionStorage.setItem(
          "pendingOrderItems",
          JSON.stringify(selectedItems),
        );
        window.location.assign(data.data.paymentUrl);
        return;
      }

      if (data?.data?.paymentType === "COD") {
        cleanUpOrderedItems(selectedItems);
        toast.success("🎉 Order placed successfully!");
        router.push(
          `/checkout/success?orderId=${data.data.order?._id || data.data._id}`,
        );
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

  const items = allItems;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center"
        >
          <BackArrowIcon />
        </button>
        <h4 className="font-semibold text-[#1E1E1E] font-montserrat">
          Checkout
        </h4>
      </div>

      {/* ---------- Welcome Banner ---------- */}
      {!isLoggedIn && (
        <div className="flex items-center justify-between rounded-2xl border border-[#E9E9E9] bg-[#FAFAFA] px-6 py-4 mb-6">
          <div>
            <p className="text-[15px] font-semibold text-[#1E1E1E]">
              Welcome! You&apos;re shopping with us for the first time 👋
            </p>
            <p className="text-[13px] text-[#7F8482]">
              Please fill in your details to continue
            </p>
          </div>
          <Image
            src="/img/welcome-basket.png"
            alt="Welcome"
            width={64}
            height={64}
            className="hidden sm:block"
          />
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        {/* ---------- Left: Customer Information ---------- */}
        <div className="rounded-2xl border border-[#E9E9E9] bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[18px] font-bold text-[#1E1E1E]">
              Customer Information
            </h3>
          </div>

          {/* ── Address Type Selector ── */}
          <div className="mb-5">
            <p className="text-[13px] font-semibold text-[#6B6B6B] mb-2">
              Address Type
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {ADDRESS_TYPE_OPTIONS.map((opt) => {
                const isActive = selectedAddressType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedAddressType(opt.value)}
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

          {/* ── Contact Information ── */}
          <div className="rounded-xl border border-[#F2F2F2] p-5 mb-5">
            <p className="text-[14px] font-semibold text-[#1E1E1E] mb-3">
              Contact Information
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-[13px] text-[#6B6B6B] mb-1 block">
                  Full Name *
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B]"
                />
              </div>
              <div>
                <label className="text-[13px] text-[#6B6B6B] mb-1 block">
                  Phone Number *
                </label>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B]"
                />
              </div>
              <div>
                <label className="text-[13px] text-[#6B6B6B] mb-1 block">
                  Email (Optional)
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B]"
                />
              </div>
            </div>
          </div>

          {/* ── Delivery Address ── */}
          <div className="rounded-xl border border-[#F2F2F2] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-semibold text-[#1E1E1E]">
                Delivery Address
              </p>
              <label className="flex items-center gap-1.5 text-[12px] text-[#6B6B6B] cursor-pointer">
                <input
                  type="checkbox"
                  name="saveAsDefault"
                  checked={formData.saveAsDefault}
                  onChange={handleInputChange}
                  className="accent-[#37651B]"
                />
                Save as default address
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[13px] text-[#6B6B6B] mb-1 block">
                  Area / Street *
                </label>
                <input
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Enter area, street or house no."
                  className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B]"
                />
              </div>
              <div>
                <label className="text-[13px] text-[#6B6B6B] mb-1 block">
                  Landmark (Optional)
                </label>
                <input
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="E.g. Near BM College"
                  className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4">
              <div>
                <label className="text-[13px] text-[#6B6B6B] mb-1 block">
                  City / District *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
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
                <label className="text-[13px] text-[#6B6B6B] mb-1 block">
                  Thana / Upazila *
                </label>
                <select
                  name="thana"
                  value={formData.thana}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B] bg-white"
                >
                  <option value="">Select thana</option>
                  <option value="Sadar">Sadar</option>
                  <option value="Kotwali">Kotwali</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[13px] text-[#6B6B6B] mb-1 block">
                  Post Code (Optional)
                </label>
                <input
                  name="postCode"
                  value={formData.postCode}
                  onChange={handleInputChange}
                  placeholder="Enter post code"
                  className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[13px] text-[#6B6B6B] mb-1 block">
                Additional Notes (Optional)
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                placeholder="Any special instructions for your order..."
                rows={3}
                className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2.5 text-[14px] outline-none focus:border-[#37651B] resize-none"
              />
            </div>
          </div>
        </div>

        {/* ---------- Right: Order Summary ---------- */}
        <div className="rounded-2xl border border-[#E9E9E9] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-bold text-[#1E1E1E]">
              Order Summary
            </h3>
            {items.length > 1 && (
              <button
                onClick={toggleSelectAll}
                className="text-[12px] font-medium text-[#37651B] hover:underline"
              >
                {allSelected ? "Deselect all" : "Select all"}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 mb-4">
            {items.length === 0 ? (
              <p className="text-[13px] text-[#7F8482]">Your cart is empty.</p>
            ) : (
              items.map((item, idx) => {
                const key = getItemKey(item);
                const isChecked = selectedItemKeys.has(key);
                const outOfStock =
                  stockMap[key] !== undefined && item.quantity > stockMap[key];

                return (
                  <label
                    key={`${key}-${idx}`}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItemSelection(item)}
                      className="h-4 w-4 flex-shrink-0 accent-[#37651B] cursor-pointer"
                    />
                    <div
                      className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#FAFAFA] transition-opacity ${isChecked ? "opacity-100" : "opacity-40"}`}
                    >
                      <Image
                        src={item.image || "/img/card.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized={item.image?.startsWith("http")}
                      />
                    </div>
                    <div
                      className={`flex-1 transition-opacity ${isChecked ? "opacity-100" : "opacity-40"}`}
                    >
                      <p className="text-[13px] font-semibold text-[#1E1E1E]">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] text-[#7F8482]">
                          {item.weight}{" "}
                          {item.quantity > 1 ? `x ${item.quantity}` : ""}
                        </p>
                        {outOfStock && (
                          <span className="text-[10px] font-medium bg-red-50 text-red-600 px-1 rounded">
                            Stock Out ({stockMap[key]})
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[13px] font-semibold text-[#1E1E1E] transition-opacity ${isChecked ? "opacity-100" : "opacity-40"}`}
                    >
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
              <span className="text-[#1E1E1E] font-medium">
                ৳{selectedSubtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#6B6B6B]">
              <span>Delivery Charge</span>
              <span className="text-[#1E1E1E] font-medium">
                {selectedDeliveryCharge ? `৳${selectedDeliveryCharge}` : "Free"}
              </span>
            </div>
            {selectedDiscount > 0 && (
              <div className="flex items-center justify-between text-[#37651B]">
                <span>
                  Discount{" "}
                  {orderData?.appliedCoupons?.[0] &&
                    `(${orderData.appliedCoupons[0]})`}
                </span>
                <span className="font-medium">
                  -৳{selectedDiscount.toLocaleString()}
                </span>
              </div>
            )}
            {!allSelected && (orderData?.discount || 0) > 0 && (
              <p className="text-[11px] text-[#B45309]">
                ⚠️ Coupon discount applies only when all cart items are
                selected.
              </p>
            )}
          </div>

          <div className="border-t border-[#E9E9E9] mt-3 pt-3 flex items-center justify-between">
            <span className="text-[16px] font-semibold text-[#1E1E1E]">
              Total
            </span>
            <span className="text-[22px] font-bold text-[#37651B] font-aeonik">
              ৳{selectedTotal.toLocaleString()}
            </span>
          </div>

          {selectedPaymentMethod && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F4F8F1] px-3 py-2">
              <span className="text-[12px] text-[#7F8482]">Paying via</span>
              <span className="text-[12px] font-semibold text-[#37651B]">
                {selectedPaymentMethod.name}
              </span>
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={submitting || selectedItems.length === 0}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#37651B] text-[15px] font-semibold text-white transition-all hover:bg-[#2c5215] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Spinner />
                <span>Processing...</span>
              </>
            ) : (
              `Place Order (${selectedItems.length})`
            )}
          </button>

          <p className="mt-2 text-center text-[11px] text-[#7F8482]">
            By continuing, you agree to our{" "}
            <span className="text-[#37651B] font-medium cursor-pointer hover:underline">
              Terms & Conditions
            </span>
          </p>
        </div>
      </div>

      {/* ---------- Delivery Slot ---------- */}
      <div className="mt-6">
        <Deliveryslot onSlotSelect={setSelectedSlot} />
      </div>

      {/* ---------- Payment Method ---------- */}
      <div className="mt-6 rounded-2xl border border-[#E9E9E9] bg-white p-6">
        <h3 className="text-[18px] font-bold text-[#1E1E1E] mb-1">
          Payment Method
        </h3>
        <p className="text-[12px] text-[#7F8482] mb-4">
          Only Cash on Delivery and SSL Commerce (cards / net banking) are
          available right now. Other options are coming soon.
        </p>

        {loadingPayments ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : dbPaymentMethods.length === 0 ? (
          <p className="text-[13px] text-[#7F8482]">
            No payment methods available.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {dbPaymentMethods.map((method) => {
              const ui = getPaymentUI(method.name);
              const isSelected =
                selectedPaymentId === method._id && !ui.comingSoon;
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
                    {method.logo ? (
                      <Image
                        src={method.logo}
                        alt={method.name}
                        width={28}
                        height={28}
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      ui.icon
                    )}
                    <div>
                      <p className="text-[14px] font-semibold text-[#1E1E1E]">
                        {method.name}
                      </p>
                      <p className="text-[11px] text-[#7F8482]">
                        {ui.subLabel}
                      </p>
                    </div>
                  </div>
                  {!ui.comingSoon && (
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? "border-[#37651B]" : "border-[#E9E9E9]"}`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-[#37651B]" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotSaveAddress;
