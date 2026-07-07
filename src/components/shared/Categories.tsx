"use client";


import { getActiveCategories } from "@/src/api/category";
import { ICategory } from "@/src/types/category.interface";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Categories = () => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLUListElement>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<ICategory | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLLIElement>, cat: ICategory) => {
    if (containerRef.current) {
      const liRect = e.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      setHoverPosition({ 
        left: liRect.left - containerRect.left, 
        width: liRect.width 
      });
      setHoveredCategory(cat);
    }
  };

  // API থেকে ডাটা লোড করার লজিক
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await getActiveCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // স্ক্রোল পজিশন চেক করে অ্যারো বাটন হাইড বা শো করার ফাংশন
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      
      // বামে স্ক্রোল করার জায়গা থাকলে Left Arrow দেখাবে
      setShowLeftArrow(scrollLeft > 5);
      
      // ডানে স্ক্রোল করার জায়গা থাকলে Right Arrow দেখাবে
      setShowRightArrow(scrollWidth > clientWidth && scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
      
      // Next.js / Turbopack এর ডম রেন্ডারিং এবং ডাটা পপুলেট কমপ্লিট হওয়ার জন্য সামান্য ডিলে দিয়ে চেক করা হচ্ছে
      const timer = setTimeout(() => {
        checkScrollPosition();
      }, 150);

      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
        clearTimeout(timer);
      };
    }
  }, [categories]); // ডাটা লোড হওয়ার পর স্ক্রোল পজিশন রি-ক্যালকুলেট হবে

  // অ্যারো বাটনে ক্লিক করলে মুভ হওয়ার লজিক
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; 
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // ডাটা ফেচিং এর সময় লেআউট ব্রেক না হওয়ার জন্য সেফ কন্ডিশন
  if (loading || categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 w-full">
        <nav className="flex items-center py-4 w-full h-[53px]" />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="max-w-7xl mx-auto px-4 w-full relative" 
      onMouseLeave={() => setHoveredCategory(null)}
    >
      <nav className="flex items-center py-4 w-full select-none relative">
        {/* ক্যাটাগরি কন্টেইনার ও অ্যারো নেভিগেশন */}
        <div className="relative flex-1 flex items-center overflow-hidden w-full">
          
          {/* Left Arrow Button */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 z-10 bg-white border border-[#E9E9E9] text-[#1E1E1E] hover:text-[#37651B] w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all focus:outline-none hover:scale-105"
              aria-label="Scroll Left"
            >
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 1L1 5L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Categories List */}
          <ul
            ref={scrollContainerRef}
            className="flex flex-1 items-center gap-6 lg:gap-10 text-[15px] text-[#1E1E1E] whitespace-nowrap overflow-x-auto scroll-smooth py-1 px-2"
            style={{
              scrollbarWidth: "none", /* Firefox */
              msOverflowStyle: "none", /* IE and Edge */
            }}
          >
            {/* Chrome, Safari এবং Opera থেকে স্ক্রোলবার হাইড করার স্টাইল */}
            <style jsx>{`
              ul::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {categories.map((cat, index) => (
              <li
                key={cat._id}
                className={`cursor-pointer transition-colors flex-shrink-0 py-2 ${
                  index === 0 ? "text-[#37651B] font-semibold" : "hover:text-[#37651B]"
                }`}
                onMouseEnter={(e) => handleMouseEnter(e, cat)}
                onClick={() => {
                  if (cat.name) {
                    router.push(`/shopnow?category=${encodeURIComponent(cat.name)}`);
                    setHoveredCategory(null);
                  }
                }}
              >
                {cat.name}
              </li>
            ))}
          </ul>

          {/* Right Arrow Button */}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 z-10 bg-white border border-[#E9E9E9] text-[#1E1E1E] hover:text-[#37651B] w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all focus:outline-none hover:scale-105"
              aria-label="Scroll Right"
            >
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          
        </div>
      </nav>

      {/* Subcategories Dropdown */}
      {hoveredCategory && hoveredCategory.subCategories && hoveredCategory.subCategories.length > 0 && hoverPosition && (
        <div 
          className="absolute z-50 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-[#E9E9E9] rounded-xl p-3 transition-all duration-300 origin-top min-w-[180px]"
          style={{ 
            top: "100%", 
            left: `${hoverPosition.left + hoverPosition.width / 2}px`,
            transform: "translateX(-50%)"
          }}
        >
          <div className="flex flex-col gap-1">
            {hoveredCategory.subCategories.map((sub) => (
              <div
                key={sub._id}
                className="cursor-pointer px-3 py-2 rounded-lg text-[#3C3C3C] hover:text-[#37651B] hover:bg-[#F4F8F1] transition-all text-[14px] font-medium whitespace-nowrap"
                onClick={() => {
                  router.push(`/shopnow?category=${encodeURIComponent(hoveredCategory.name)}&subcategory=${encodeURIComponent(sub.title)}`);
                  setHoveredCategory(null);
                }}
              >
                {sub.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;