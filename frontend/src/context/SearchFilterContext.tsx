// src/context/SearchFilterContext.tsx

import React, { createContext, useState, ReactNode } from "react";

interface SearchFilterContextProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  brandFilter: string;
  setBrandFilter: (brand: string) => void;
  minPrice: number | "";
  setMinPrice: (price: number | "") => void;
  maxPrice: number | "";
  setMaxPrice: (price: number | "") => void;
  minQuantity: number | "";
  setMinQuantity: (quantity: number | "") => void;
  maxQuantity: number | "";
  setMaxQuantity: (quantity: number | "") => void;
  categories: string[];
  brands: string[];
  statuses: string[];
  setCategories: (categories: string[]) => void;
  setBrands: (brands: string[]) => void;
  setStatuses: (statuses: string[]) => void;
}

export const SearchFilterContext = createContext<
  SearchFilterContextProps | undefined
>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export const SearchFilterProvider: React.FC<ProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [brandFilter, setBrandFilter] = useState<string>("All");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minQuantity, setMinQuantity] = useState<number | "">("");
  const [maxQuantity, setMaxQuantity] = useState<number | "">("");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [brands, setBrands] = useState<string[]>(["All"]);
  const [statuses, setStatuses] = useState<string[]>(["All"]);

  return (
    <SearchFilterContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        statusFilter,
        setStatusFilter,
        brandFilter,
        setBrandFilter,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        minQuantity,
        setMinQuantity,
        maxQuantity,
        setMaxQuantity,
        categories,
        brands,
        statuses,
        setCategories,
        setBrands,
        setStatuses,
      }}
    >
      {children}
    </SearchFilterContext.Provider>
  );
};
