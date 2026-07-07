"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import axiosInstance from "@/src/api/axiosInstance";
import { ICategoryPopulated, IProduct } from "@/src/types/product.interface";

const getShopNowUrlFromProduct = (product: IProduct): string => {
  const params = new URLSearchParams({ search: product.name });

  if (product.categoryId && typeof product.categoryId === "object") {
    const category = product.categoryId as ICategoryPopulated;
    params.set("category", category.name);

    if (product.subCategoryId && category.subCategories?.length) {
      const subCategory = category.subCategories.find(
        (sub) => sub._id === product.subCategoryId,
      );
      if (subCategory) {
        params.set("subcategory", subCategory.title);
      }
    }
  }

  return `/shopnow?${params.toString()}`;
};

interface StoredUser {
  name: string;
  role: string;
  profileImage?: string | null;
}

const Navbar = () => {
  const router = useRouter();

  // স্টেটসমূহ
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [suggestions, setSuggestions] = useState<IProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // 🎯 লোগো ও শপ সেটিংসের জন্য স্টেট
  const [logoUrl, setLogoUrl] = useState<string>("/img/shared/logo.png"); 
  const [shopPhone, setShopPhone] = useState<string>("01700000000");

  // 🎯 এپیআই থেকে শপ সেটিংস নিয়ে আসা
  useEffect(() => {
    const fetchShopSettings = async () => {
      try {
        const res = await axiosInstance.get("/shop-settings");
        if (res.data?.success && res.data?.data) {
          if (res.data.data.logo) setLogoUrl(res.data.data.logo);
          if (res.data.data.phone) setShopPhone(res.data.data.phone);
        }
      } catch (err) {
        console.error("Error fetching shop settings:", err);
      }
    };
    fetchShopSettings();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get("/products");
        if (res.data?.success) {
          setAllProducts(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      const filtered = allProducts
        .filter((p) => p.name.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = () => {
    const query = searchQuery.trim();
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);

    if (query) {
      router.push(`/shopnow?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/shopnow");
    }
  };

  const syncUser = () => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    } else if (token) {
      setUser({ name: "User", role: "user", profileImage: "" });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    const syncCartCount = () => {
      const cart = localStorage.getItem("cart");
      if (!cart) {
        setCartCount(0);
        return;
      }
      try {
        const items = JSON.parse(cart);
        const total = items.reduce(
          (sum: number, item: { quantity: number }) => sum + (item.quantity || 1),
          0,
        );
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener("cartUpdated", syncCartCount);

    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("cartUpdated", syncCartCount);
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axiosInstance.get("/users/my-profile");
          const profileData = res.data?.data || res.data;

          if (profileData && profileData.name) {
            const userData = {
              name: profileData.name || profileData.firstName || "User",
              role: profileData.role || "user",
              profileImage: profileData.profileImage || profileData.image || "",
            };
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }
      }
    };

    fetchProfile();
    const timeoutId = setTimeout(syncUser, 0);

    window.addEventListener("storage", syncUser);
    window.addEventListener("userLogin", fetchProfile);
    window.addEventListener("userLogin", syncUser);

    const interval = setInterval(syncUser, 1000);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("userLogin", fetchProfile);
      window.removeEventListener("userLogin", syncUser);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const authOnlyPaths = ["/login", "/signup", "/register"];

      if (token && authOnlyPaths.includes(window.location.pathname)) {
        router.replace("/");
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);
    setIsDropdownOpen(false);
    toast.success("Logged out successfully");
    router.push("/");
  };

  const avatarSrc =
    user?.profileImage && user.profileImage !== ""
      ? user.profileImage
      : "https://avatar.iran.liara.run/public/boy";

  return (
    <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm transition-all duration-200">
      {/* --- 1. Top Banner Bar --- */}
      <div className="w-full bg-[#2A3C1B] text-[#FFFDF6] py-2 text-xs sm:subtext-large-medium">
        <div className="max-w-7xl px-4 mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-2 text-center sm:text-left">
          <div>
            Free delivery on orders <span className="font-semibold">৳500+</span>
          </div>
          <div className="hidden md:block font-medium">
            Fresh products delivered daily
          </div>
          <div className="flex items-center gap-3 opacity-90 text-[11px] sm:text-sm">
            <span className="hover:underline cursor-pointer">Track Order</span>
            <span className="opacity-40">|</span>
            <span>Contact: {shopPhone}</span>
          </div>
        </div>
      </div>

      {/* --- 2. Main Navbar Action Row --- */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
        {/* Brand Logo Section */}
        <div
          onClick={() => router.push("/")}
          className="relative flex h-[40px] w-[120px] flex-shrink-0 cursor-pointer select-none sm:h-[50px] sm:w-[180px]"
        >
          <Image
            src={logoUrl}
            alt="Khati Bazar"
            fill
            sizes="(max-width: 640px) 120px, 180px"
            className="object-contain"
            unoptimized={logoUrl.startsWith("http")}
            priority
          />
        </div>

        {/* --- Search Block (Desktop Only) --- */}
        <div className="hidden md:flex flex-1 max-w-[500px] relative">
          <div className="flex items-center w-full h-[44px] bg-white border border-[#E9E9E9] rounded-lg pl-3 overflow-hidden">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M15.75 15.75L11.2533 11.2533M11.2533 11.2533C12.3663 10.1398 13.0546 8.60184 13.0546 6.90305C13.0546 3.50481 10.3001 0.75 6.9023 0.75C3.50448 0.75 0.75 3.50481 0.75 6.90305C0.75 10.3013 3.50448 13.0561 6.9023 13.0561C8.60154 13.0561 10.1399 12.3671 11.2533 11.2533Z" stroke="#7F8482" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setShowSuggestions(false), handleSearch())}
              onFocus={() => { if (searchQuery.trim()) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full bg-transparent border-none outline-none pl-2 text-sm text-[#0E2038] placeholder-[#7F8482] subtext-large-regular font-medium"
            />
            <button
              onClick={handleSearch}
              style={{ width: "125px", height: "44px" }}
              className="bg-[#37651B] hover:bg-[#2C5215] text-white flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 transition-colors duration-200 flex-shrink-0"
            >
              <span className="body/body-medium font-medium tracking-normal select-none">Search</span>
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[50px] left-0 w-[calc(100%-125px)] bg-white border border-[#E9E9E9] rounded-lg shadow-[0px_4px_20px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
              {suggestions.map((p) => (
                <div
                  key={p._id}
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                    router.push(getShopNowUrlFromProduct(p));
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-[#E9E9E9] last:border-0 transition-colors"
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">Img</div>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] text-[#0E2038] font-medium truncate">{p.name}</span>
                    <span className="text-[12px] text-[#37651B] font-semibold">৳{p.variants?.[0]?.offerPrice || p.variants?.[0]?.originalPrice || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Action Buttons Segment --- */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          
          {/* 🎯 কন্ডিশনাল উইশলিস্ট বাটন */}
          {user && (
            <Link href="/dashboard/wishlist" className="hidden sm:inline-block">
              <button style={{ width: "44px", height: "44px" }} className="border border-[#E9E9E9] bg-white hover:bg-gray-50 flex items-center justify-center rounded-lg p-2 transition-all duration-200 group">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110">
                  <path d="M20.894 9.44503C19.8474 15.4754 11.9949 20.5 11.9949 20.5C11.9949 20.5 4.08463 15.4753 3.09582 9.44536C2.10702 3.41545 9.02855 1.40524 11.9949 6.0795C14.9613 1.40515 21.9407 3.41463 20.894 9.44503Z" stroke="#0E2038" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </Link>
          )}

          {/* Cart Button */}
          <Link href="/shopping-cart">
            <button style={{ width: "44px", height: "44px" }} className="border border-[#E9E9E9] bg-white hover:bg-gray-50 flex items-center justify-center rounded-lg p-2 transition-all duration-200 group relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.5 19C9.5 19.8284 8.82843 20.5 8 20.5C7.17157 20.5 6.5 19.8284 6.5 19C6.5 18.1716 7.17157 17.5 8 17.5C8.82843 17.5 9.5 18.1716 9.5 19Z" stroke="#0E2038" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.5 19C17.5 19.8284 16.8284 20.5 16 20.5C15.1716 20.5 14.5 19.8284 14.5 19C14.5 18.1716 15.1716 17.5 16 17.5C16.8284 17.5 17.5 18.1716 17.5 19Z" stroke="#0E2038" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 2.6C2.50294 2.6 2.1 3.00294 2.1 3.5C2.1 3.99706 2.50294 4.4 3 4.4V3.5V2.6ZM18.6264 13.0443L19.427 13.4554L18.6264 13.0443ZM8.6 5.5V6.4H16.6048V5.5V4.6H8.6V5.5ZM19.8073 10.7443L19.0067 10.3332L17.8258 12.6332L18.6264 13.0443L19.427 13.4554L20.6079 11.1554L19.8073 10.7443ZM15.4239 15V14.1H8.5V15V15.9H15.4239V15ZM5 11.5H5.9V9.1H5H4.1V11.5H5ZM5 11.5H5.9V5.5H5H4.1V11.5H5ZM8.5 15V14.1C7.06406 14.1 5.9 12.9359 5.9 11.5H5H4.1V11.5H5ZM8.5 15V14.1C7.06406 14.1 5.9 12.9359 5.9 11.5H5H4.1C4.1 13.9301 6.06995 15.9 8.5 15.9V15ZM18.6264 13.0443L17.8258 12.6332C17.3634 13.5338 16.4361 14.1 15.4239 14.1V15V15.9C17.111 15.9 18.6564 14.9563 19.427 13.4554L18.6264 13.0443ZM16.6048 5.5V6.4C18.6246 6.4 19.9292 8.53647 19.0067 10.3332L19.8073 10.7443L20.6079 11.1554C22.1455 8.16079 19.9711 4.6 16.6048 4.6V5.5ZM5 5.5H5.9C5.9 3.89837 4.60163 2.6 3 2.6V3.5V4.4C3.60751 4.4 4.1 4.89249 4.1 5.5H5ZM8.6 5.5V4.6C6.11472 4.6 4.1 6.61472 4.1 9.1H5H5.9C5.9 7.60883 7.10883 6.4 8.6 6.4V5.5Z" fill="#0E2038"/>
              </svg>
              <span className="absolute -top-1.5 -right-1.5 bg-[#37651B] text-white text-[11px] sm:text-[12px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </button>
          </Link>

          {/* User / Login Block */}
          {user ? (
            <div className="relative">
              <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] relative rounded-lg overflow-hidden border border-[#E9E9E9]">
                  <Image src={avatarSrc} alt={user?.name || "User"} fill className="object-cover" unoptimized={avatarSrc.startsWith("https://avatar.iran.liara.run")}/>
                </div>
                <svg className={`w-4 h-4 text-[#0E2038] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-[180px] bg-white border border-[#E9E9E9] rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#E9E9E9] mb-1">
                    <p className="text-sm font-bold text-[#0E2038] truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-[#7F8482] capitalize">{user?.role || "user"}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-[#0E2038] hover:bg-gray-50 transition-colors">Dashboard</Link>
                  <button type="button" onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-[#E9E9E9] mt-1">Logout</button>
                </div>
              )}
            </div>
          ) : (
            /* 🎯 রেসপন্সিভ লগইন বাটন ফিক্স */
            <Link href="/login">
              <button style={{ height: "44px" }} className="bg-[#37651B] hover:bg-[#2C5215] text-white flex items-center justify-center gap-2 rounded-lg transition-colors duration-200 flex-shrink-0 w-11 sm:w-[123px] px-2 sm:px-5 py-2.5">
                {/* ডেক্সটপে টেক্সট দেখাবে */}
                <span className="hidden sm:inline font-[family-name:var(--font-montserrat)] font-semibold text-base">Log In</span>
                {/* মোবাইলে ইউজার আইকন দেখাবে */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:hidden">
                  <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* --- 3. Mobile Search Sub-Row --- */}
      <div className="w-full px-4 pb-4 md:hidden relative">
        <div className="flex items-center w-full h-[44px] bg-[#F7F7F7] border border-[#E9E9E9] rounded-lg pl-3 overflow-hidden">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M15.75 15.75L11.2533 11.2533M11.2533 11.2533C12.3663 10.1398 13.0546 8.60184 13.0546 6.90305C13.0546 3.50481 10.3001 0.75 6.9023 0.75C3.50448 0.75 0.75 3.50481 0.75 6.90305C0.75 10.3013 3.50448 13.0561 6.9023 13.0561C8.60154 13.0561 10.1399 12.3671 11.2533 11.2533Z" stroke="#7F8482" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search products, brands..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setShowSuggestions(false), handleSearch())}
            onFocus={() => { if (searchQuery.trim()) setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full bg-transparent border-none outline-none pl-2 text-sm text-[#0E2038] font-[family-name:var(--font-montserrat)]"
          />
          <button onClick={() => { setShowSuggestions(false); handleSearch(); }} className="bg-[#37651B] h-full text-white px-4 text-sm font-medium font-[family-name:var(--font-montserrat)] flex-shrink-0">Search</button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-[56px] left-4 right-4 bg-white border border-[#E9E9E9] rounded-lg shadow-[0px_4px_20px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
            {suggestions.map((p) => (
              <div
                key={p._id}
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                  router.push(getShopNowUrlFromProduct(p));
                }}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-[#E9E9E9] last:border-0 transition-colors"
              >
                <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">Img</div>
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[13px] text-[#0E2038] font-medium truncate">{p.name}</span>
                  <span className="text-[12px] text-[#37651B] font-semibold">৳{p.variants?.[0]?.offerPrice || p.variants?.[0]?.originalPrice || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;