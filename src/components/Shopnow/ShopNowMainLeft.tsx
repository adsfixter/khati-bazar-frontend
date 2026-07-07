"use client";

import React, { useState } from "react";
import { IWeight } from "@/src/types/product.interface";

const FilterGroup: React.FC<{ 
  title: string; 
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}> = ({
  title,
  children,
  isOpen,
  onToggle,
}) => (
  <div className="border-b border-[#E9E9E9] py-4">
    <div 
      className="flex justify-between items-center cursor-pointer mb-2" 
      onClick={onToggle}
    >
      <p className="body-medium font-semibold text-[#1E1E1E]">{title}</p>
      <svg 
        className={`w-4 h-4 text-[#6B6B6B] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    <div className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-[350px] overflow-y-auto pr-2" : "max-h-0"}`}>
      <div className="pt-2 pb-1">
        {children}
      </div>
    </div>
  </div>
);

const Checkbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: () => void;
}> = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2 py-1 text-[13px] text-[#3C3C3C]">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 accent-[#37651B]"
    />
    {label}
  </label>
);

const toggle = (
  list: string[],
  setList: (v: string[]) => void,
  value: string,
) => {
  setList(
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
  );
};

interface FilterLeftProps {
  categoryList: {
    _id: string;
    name: string;
    subCategories?: { _id: string; title: string; status: string }[];
  }[];
  categoriesLoading: boolean;
  brandList: { _id: string; name: string }[];
  brandsLoading: boolean;
  weightList: IWeight[]; 
  weightsLoading: boolean; 

  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  subCategories: string[];
  setSubCategories: React.Dispatch<React.SetStateAction<string[]>>;
  origins: string[];
  setOrigins: React.Dispatch<React.SetStateAction<string[]>>;
  maxPrice: number;
  setMaxPrice: React.Dispatch<React.SetStateAction<number>>;
  availability: string[];
  setAvailability: React.Dispatch<React.SetStateAction<string[]>>;
  brands: string[];
  setBrands: React.Dispatch<React.SetStateAction<string[]>>;
  weights: string[]; 
  setWeights: React.Dispatch<React.SetStateAction<string[]>>; 
  clearAllFilters: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (val: boolean) => void;
}

const ShopNowMainLeft: React.FC<FilterLeftProps> = ({
  categories,
  setCategories,
  subCategories,
  setSubCategories,
  origins,
  setOrigins,
  maxPrice,
  setMaxPrice,
  availability,
  setAvailability,
  brands,
  setBrands,
  weights, 
  setWeights, 
  clearAllFilters,
  categoryList,
  categoriesLoading,
  brandList,
  brandsLoading,
  weightList, 
  weightsLoading, 
  isMobileOpen,
  setIsMobileOpen
}) => {
  const [openGroup, setOpenGroup] = useState<string | null>("Category");
  
  // 🎯 ইউজারের ম্যানুয়াল ক্লিক ট্র্যাক করার জন্য স্টেট (ডিফল্ট -১ অর্থাৎ খালি)
  const [activeManualCategory, setActiveManualCategory] = useState<string | null>(null);

  // 🎯 রেন্ডার টাইমে ডিরাইভড স্টেট (Derived State): কোনো useEffect ছাড়াই লাইভ ক্যাটাগরি ম্যাচ করবে
  const matchedCategory = categoryList.find((cat) => categories.includes(cat.name));
  
  // যদি ইউজার নিজে ক্লিক করে কিছু টগল না করে থাকে, তবে ইউআরএল বা স্টেট থেকে অটোমেটিক আইডি নিবে
  const currentOpenCategory = activeManualCategory !== null ? activeManualCategory : (matchedCategory?._id || null);

  const handleToggleGroup = (group: string) => {
    setOpenGroup(openGroup === group ? null : group);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && setIsMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <aside className={`${isMobileOpen ? "fixed inset-y-0 left-0 z-50 w-[280px] bg-white overflow-y-auto h-full translate-x-0" : "hidden -translate-x-full lg:translate-x-0"} transition-transform duration-300 lg:block lg:static lg:w-[260px] lg:h-auto lg:overflow-visible lg:z-auto flex-shrink-0`}>
        <div className="rounded-xl border-0 lg:border border-[#E9E9E9] p-4 h-full flex flex-col">
          <div className="mb-2 flex items-center justify-between shrink-0">
            <h3 className="body-large-semibold font-semibold text-[#1E1E1E]">
              Filter
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setActiveManualCategory(null); // ম্যানুয়াল স্টেট রিসেট
                  clearAllFilters();
                }}
                className="subtext-regular text-[#37651B]"
              >
                Clear all
              </button>
              {isMobileOpen && setIsMobileOpen && (
                <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-gray-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {/* Category */}
            <FilterGroup 
              title="Category"
              isOpen={openGroup === "Category"}
              onToggle={() => handleToggleGroup("Category")}
            >
              <div className="flex flex-col gap-1">
                {categoriesLoading ? (
                  <p className="text-[12px] text-gray-400">Loading Categories...</p>
                ) : (
                  categoryList.map((cat) => (
                    <div key={cat._id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between group">
                        <Checkbox
                          label={cat.name}
                          checked={categories.includes(cat.name)}
                          onChange={() => {
                            // নতুন ক্যাটাগরি টিক দিলে ম্যানুয়াল স্টেট আপডেট করে দেওয়া যাতে কলাপ্স সিঙ্ক থাকে
                            setActiveManualCategory(cat._id);
                            toggle(categories, setCategories, cat.name);
                          }}
                        />
                        {cat.subCategories && cat.subCategories.length > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // ইউজার নিজে ক্লিক করলে কারেন্ট ওপেন চেক করে টগল করবে
                              setActiveManualCategory(currentOpenCategory === cat._id ? "" : cat._id);
                            }}
                            className="text-[#6B6B6B] hover:text-[#37651B] p-1"
                          >
                            <svg className={`w-4 h-4 transition-transform ${currentOpenCategory === cat._id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {/* Subcategories */}
                      <div className={`ml-6 flex flex-col gap-1 overflow-hidden transition-all duration-300 ${currentOpenCategory === cat._id ? "max-h-[500px]" : "max-h-0"}`}>
                        {cat.subCategories && cat.subCategories.map((sub) => (
                          <Checkbox
                            key={sub._id}
                            label={sub.title}
                            checked={subCategories.includes(sub.title)}
                            onChange={() =>
                              toggle(subCategories, setSubCategories, sub.title)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </FilterGroup>

            {/* Origin */}
            <FilterGroup 
              title="Origin"
              isOpen={openGroup === "Origin"}
              onToggle={() => handleToggleGroup("Origin")}
            >
              <div className="flex flex-col gap-1">
                <Checkbox
                  label="Local"
                  checked={origins.includes("Local")}
                  onChange={() => toggle(origins, setOrigins, "Local")}
                />
                <Checkbox
                  label="Imported"
                  checked={origins.includes("International")}
                  onChange={() => toggle(origins, setOrigins, "International")}
                />
              </div>
            </FilterGroup>

            {/* Price Range */}
            <FilterGroup 
              title="Price Range"
              isOpen={openGroup === "Price Range"}
              onToggle={() => handleToggleGroup("Price Range")}
            >
              <div className="py-2">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#37651B]"
                />
                <div className="mt-1 flex justify-between text-[12px] text-[#6B6B6B]">
                  <span>৳0</span>
                  <span className="font-semibold text-[#1E1E1E]">৳{maxPrice}</span>
                  <span>৳1000</span>
                </div>
              </div>
            </FilterGroup>

            {/* Availability */}
            <FilterGroup 
              title="Availability"
              isOpen={openGroup === "Availability"}
              onToggle={() => handleToggleGroup("Availability")}
            >
              <div className="flex flex-col gap-1">
                <Checkbox
                  label="In Stock"
                  checked={availability.includes("In Stock")}
                  onChange={() => toggle(availability, setAvailability, "In Stock")}
                />
                <Checkbox
                  label="Out of Stock"
                  checked={availability.includes("Out of Stock")}
                  onChange={() =>
                    toggle(availability, setAvailability, "Out of Stock")
                  }
                />
              </div>
            </FilterGroup>

            {/* Brand */}
            <FilterGroup 
              title="Brand"
              isOpen={openGroup === "Brand"}
              onToggle={() => handleToggleGroup("Brand")}
            >
              <div className="flex flex-col gap-1">
                {brandsLoading ? (
                  <p className="text-[12px] text-gray-400">Loading Brands...</p>
                ) : (
                  brandList.map((b) => (
                    <Checkbox
                      key={b._id}
                      label={b.name}
                      checked={brands.includes(b.name)}
                      onChange={() => toggle(brands, setBrands, b.name)}
                    />
                  ))
                )}
              </div>
            </FilterGroup>

            {/* Weight */}
            <FilterGroup 
              title="Weight"
              isOpen={openGroup === "Weight"}
              onToggle={() => handleToggleGroup("Weight")}
            >
              <div className="flex flex-col gap-1">
                {weightsLoading ? (
                  <p className="text-[12px] text-gray-400">Loading Weights...</p>
                ) : (
                  weightList.map((w) => {
                    const weightLabel = `${w.value}${w.unit}`;
                    return (
                      <Checkbox
                        key={w._id}
                        label={weightLabel}
                        checked={weights.includes(weightLabel)}
                        onChange={() => toggle(weights, setWeights, weightLabel)}
                      />
                    );
                  })
                )}
              </div>
            </FilterGroup>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ShopNowMainLeft;