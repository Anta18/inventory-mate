// src/context/SearchFilterContext.tsx

import React, { createContext, useState, ReactNode } from "react";

interface AppliedFilters {
  category?: string;
  status?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
}

interface SearchFilterContextProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  appliedFilters: AppliedFilters;
  setAppliedFilters: (filters: AppliedFilters) => void;
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
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [brands, setBrands] = useState<string[]>(["All"]);
  const [statuses, setStatuses] = useState<string[]>(["All"]);

  return (
    <SearchFilterContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        appliedFilters,
        setAppliedFilters,
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
