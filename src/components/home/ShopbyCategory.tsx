"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveCategories } from "@/src/api/category";
import { ICategory } from "@/src/types/category.interface";
import { defaultIcon } from "@/src/svgIcon/svg";

const ShopbyCategory = () => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // API Data, Loading and Error States
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getActiveCategories();
        setCategories(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(
        scrollWidth > clientWidth && scrollLeft + clientWidth < scrollWidth - 5,
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      const timer = setTimeout(() => {
        checkScrollPosition();
      }, 150);

      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
        clearTimeout(timer);
      };
    }
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 py-8 text-center text-gray-500">
        Loading categories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 py-8 text-red-500 text-center">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 py-8 select-none relative">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h4 className="text-[#0E2038] h4">Shop by Category</h4>
      </div>

      <div className="relative flex items-center w-full">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-2 z-30 bg-white border border-[#E9E9E9] text-[#1E1E1E] hover:text-[#37651B] w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all focus:outline-none hover:scale-105"
            aria-label="Scroll Left"
          >
            <svg
              width="6"
              height="10"
              viewBox="0 0 6 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 1L1 5L5 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 md:gap-[12px] overflow-x-auto scroll-smooth w-full py-2 px-1"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {categories.map((category: ICategory) => (
            <div
              key={category._id || category.id}
              className="w-[128px] h-[108px] bg-white border border-[#E9E9E9] rounded-[16px] p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_6px_20px_0px_rgba(0,0,0,0.1)] cursor-pointer flex-shrink-0"
              onClick={() => {
                const categoryName = category.name || category.title;
                if (categoryName) {
                  router.push(`/shopnow?category=${encodeURIComponent(categoryName)}`);
                }
              }}
            >
              <div className="w-[44px] h-[44px] flex items-center justify-center flex-shrink-0">
                {category.image || category.icon ? (
                  <img
                    src={category.image || category.icon}
                    alt={category.name || category.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  defaultIcon
                )}
              </div>

              <span className="text-[#0E2038] body-medium text-center truncate w-full">
                {category.name || category.title}
              </span>
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-2 z-30 bg-white border border-[#E9E9E9] text-[#1E1E1E] hover:text-[#37651B] w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all focus:outline-none hover:scale-105"
            aria-label="Scroll Right"
          >
            <svg
              width="6"
              height="10"
              viewBox="0 0 6 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L5 5L1 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ShopbyCategory;
