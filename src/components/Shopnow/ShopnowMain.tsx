"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ShopNowMainLeft from "./ShopNowMainLeft";
import ShopnowModal from "./ShopnowModal";
import axiosInstance from "@/src/api/axiosInstance";
import {
  IProduct,
  ICategoryPopulated,
  IWeight,
  IBrandPopulated,
} from "@/src/types/product.interface";
import { GridIcon, ListIcon } from "@/src/svgIcon/svg";
import ProductCard from "../home/ProductCard";

const ITEMS_PER_PAGE = 12;

const ShopnowMain: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryList, setCategoryList] = useState<{ _id: string; name: string; subCategories?: { _id: string; title: string; status: string }[] }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brandList, setBrandList] = useState<{ _id: string; name: string }[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [weightList, setWeightList] = useState<IWeight[]>([]);
  const [weightsLoading, setWeightsLoading] = useState(true);

  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlSubCategory = searchParams.get("subcategory");
  const urlSearch = searchParams.get("search");
  const searchQueryParam = urlSearch?.toLowerCase() || "";


  const initialFilters = useMemo(() => {
    if (urlCategory || urlSubCategory) {
      return {
        categories: urlCategory ? [urlCategory] : [],
        subCategories: urlSubCategory ? [urlSubCategory] : [],
      };
    }

    if (!urlSearch || products.length === 0) {
      return { categories: [], subCategories: [] };
    }

    const matchedProduct = products.find(
      (p) => p.name.toLowerCase() === urlSearch.toLowerCase()
    );

    if (!matchedProduct) {
      return { categories: [], subCategories: [] };
    }

    const categoryObj =
      matchedProduct.categoryId && typeof matchedProduct.categoryId === "object"
        ? (matchedProduct.categoryId as ICategoryPopulated)
        : null;

    if (!categoryObj) {
      return { categories: [], subCategories: [] };
    }

    const subCategoryObj = categoryObj.subCategories?.find(
      (sub) => sub._id === matchedProduct.subCategoryId
    );

    return {
      categories: [categoryObj.name],
      subCategories: subCategoryObj ? [subCategoryObj.title] : [],
    };
  }, [urlCategory, urlSubCategory, urlSearch, products]);

  const [categories, setCategories] = useState<string[]>(initialFilters.categories);
  const [subCategories, setSubCategories] = useState<string[]>(initialFilters.subCategories);
  
  const [origins, setOrigins] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [availability, setAvailability] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [weights, setWeights] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);



  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/products");
        if (res.data?.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await axiosInstance.get("/categories");
        if (res.data?.success) {
          setCategoryList(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        const res = await axiosInstance.get("/brands");
        if (res.data?.success) {
          setBrandList(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      } finally {
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchWeights = async () => {
      try {
        setWeightsLoading(true);
        const res = await axiosInstance.get("/weights/active");
        if (res.data?.success) {
          setWeightList(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch weights:", err);
      } finally {
        setWeightsLoading(false);
      }
    };

    fetchWeights();
  }, []);

  const handleQuickView = (product: IProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const removeFilterChip = (value: string) => {
    setCategories((prev) => prev.filter((v) => v !== value));
  };

  const clearAllFilters = () => {
    setCategories([]);
    setSubCategories([]);
    setOrigins([]);
    setAvailability([]);
    setBrands([]);
    setWeights([]); 
    setMaxPrice(1000);
  };

  const processedProducts = useMemo(() => {
    const result = products.filter((p) => {
      const categoryName =
        p.categoryId && typeof p.categoryId === "object"
          ? (p.categoryId as ICategoryPopulated).name
          : "";

      const catObj = p.categoryId && typeof p.categoryId === "object" ? (p.categoryId as ICategoryPopulated) : null;
      const subCatObj = catObj?.subCategories?.find(s => s._id === p.subCategoryId);
      const subCategoryTitle = subCatObj ? subCatObj.title : "";

      const matchCategory =
        categories.length === 0 || categories.includes(categoryName);
      
      const matchSubCategory = 
        subCategories.length === 0 || (subCategoryTitle && subCategories.includes(subCategoryTitle));

      const matchOrigin =
        origins.length === 0 || origins.includes(p.productType);

      const price =
        p.variants?.[0]?.offerPrice || p.variants?.[0]?.originalPrice || 0;
      const matchPrice = price <= maxPrice;

      const isOutOfStock = p.totalStock <= 0;
      const matchAvailability =
        availability.length === 0 ||
        (availability.includes("In Stock") && !isOutOfStock) ||
        (availability.includes("Out of Stock") && isOutOfStock);

      const brandName =
        p.brandId && typeof p.brandId === "object"
          ? (p.brandId as unknown as IBrandPopulated).name
          : "";
      const matchBrand = brands.length === 0 || brands.includes(brandName);

      const variantWeightObj = p.variants?.[0]?.weightId;
      const productWeightString =
        variantWeightObj && typeof variantWeightObj === "object"
          ? `${(variantWeightObj as IWeight).value}${(variantWeightObj as IWeight).unit}`
          : "";
      const matchWeight = weights.length === 0 || weights.includes(productWeightString);

      const matchSearch =
        !searchQueryParam ||
        p.name.toLowerCase().includes(searchQueryParam) ||
        brandName.toLowerCase().includes(searchQueryParam) ||
        categoryName.toLowerCase().includes(searchQueryParam);

      return (
        matchCategory &&
        matchSubCategory &&
        matchOrigin &&
        matchPrice &&
        matchAvailability &&
        matchBrand &&
        matchWeight &&
        matchSearch
      );
    });

    if (sortBy === "Price: Low to High") {
      result.sort(
        (a, b) =>
          (a.variants?.[0]?.offerPrice || a.variants?.[0]?.originalPrice || 0) -
          (b.variants?.[0]?.offerPrice || b.variants?.[0]?.originalPrice || 0),
      );
    } else if (sortBy === "Price: High to Low") {
      result.sort(
        (a, b) =>
          (b.variants?.[0]?.offerPrice || b.variants?.[0]?.originalPrice || 0) -
          (a.variants?.[0]?.offerPrice || a.variants?.[0]?.originalPrice || 0),
      );
    }

    return result;
  }, [products, categories, subCategories, origins, maxPrice, availability, brands, weights, sortBy, searchQueryParam]);

  const totalPages = Math.max(
    1,
    Math.ceil(processedProducts.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(page, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return processedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [processedProducts, safePage]);

  if (loading) {
    return (
      <div className="py-20 text-center font-medium text-[#37651B]">
        Loading Products...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center gap-2 text-[13px] text-[#6B6B6B]">
        <span>Home</span>
        <span>&gt;</span>
        <span className="font-semibold text-[#1E1E1E]">Shop</span>
      </div>

      <div className="flex gap-6">
        <ShopNowMainLeft
          categoryList={categoryList}
          categoriesLoading={categoriesLoading}
          brandList={brandList}
          brandsLoading={brandsLoading}
          weightList={weightList}        
          weightsLoading={weightsLoading} 
          categories={categories}
          setCategories={setCategories}
          origins={origins}
          setOrigins={setOrigins}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          availability={availability}
          setAvailability={setAvailability}
          brands={brands}
          setBrands={setBrands}
          weights={weights}              
          setWeights={setWeights}       
          subCategories={subCategories}
          setSubCategories={setSubCategories}
          clearAllFilters={clearAllFilters}
          isMobileOpen={isMobileFilterOpen}
          setIsMobileOpen={setIsMobileFilterOpen}
        />

        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="body-regular text-[#7F8482]">
              Showing {processedProducts.length} Products for{" "}
              <span className="font-semibold">&quot;Shop&quot;</span>
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 rounded-lg border border-[#E9E9E9] px-3 py-2 text-[13px] text-[#1E1E1E]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filter
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-[#E9E9E9] px-3 py-2 text-[13px] text-[#1E1E1E]"
              >
                <option>Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>

              <button
                onClick={() => setViewMode("grid")}
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${viewMode === "grid" ? "bg-[#37651B]" : "border border-[#E9E9E9]"}`}
              >
                <GridIcon />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${viewMode === "list" ? "bg-[#37651B]" : "border border-[#E9E9E9]"}`}
              >
                <ListIcon />
              </button>
            </div>
          </div>

          {(categories.length > 0 || subCategories.length > 0) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {categories.map((chip) => (
                <span
                  key={chip}
                  className="flex items-center gap-1 rounded-full bg-[#EBF0E8] px-3 py-1 text-[12px] text-[#274813]"
                >
                  {chip}
                  <button
                    onClick={() => removeFilterChip(chip)}
                    className="font-semibold"
                  >
                    ×
                  </button>
                </span>
              ))}
              {subCategories.map((chip) => (
                <span
                  key={chip}
                  className="flex items-center gap-1 rounded-full bg-[#EBF0E8] px-3 py-1 text-[12px] text-[#274813]"
                >
                  {chip}
                  <button
                    onClick={() => setSubCategories((prev) => prev.filter((v) => v !== chip))}
                    className="font-semibold"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-[12px] text-[#6B6B6B] underline"
              >
                Clear all ×
              </button>
            </div>
          )}

          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                : "flex flex-col gap-4"
            }
          >
            {paginatedProducts.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onQuickView={handleQuickView}
              />
            ))}
          </div>

          {processedProducts.length === 0 && (
            <p className="py-10 text-center text-[14px] text-[#6B6B6B]">
              কোনো পণ্য পাওয়া যায়নি।
            </p>
          )}

          {processedProducts.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[#E9E9E9] px-4 py-2 text-[13px] text-[#6B6B6B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`h-9 w-9 rounded-lg text-[13px] ${safePage === num ? "bg-[#37651B] text-white" : "border border-[#E9E9E9] text-[#1E1E1E]"}`}
                  >
                    {num}
                  </button>
                ),
              )}
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-[#E9E9E9] px-4 py-2 text-[13px] text-[#1E1E1E] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <ShopnowModal
        key={selectedProduct?._id}
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default function ShopnowMainWrapper() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") || "";
  const urlSubCategory = searchParams.get("subcategory") || "";
  const urlSearch = searchParams.get("search") || "";
  
  const componentKey = `${urlCategory}-${urlSubCategory}-${urlSearch}`;

  return <ShopnowMain key={componentKey} />;
}