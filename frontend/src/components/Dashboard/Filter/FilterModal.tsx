// src/components/FilterModal.tsx

import React, { useEffect, useState, useContext } from "react";
import { X } from "lucide-react";
import FilterDropdown from "./FilterDropdown";
import RangeInput from "./RangeInput";
import axiosInstance from "../../../api/axiosInstance";
import { SearchFilterContext } from "../../../context/SearchFilterContext";

interface FilterModalProps {
  onClose: () => void;
  isDashboard?: boolean;
}

const FilterModal: React.FC<FilterModalProps> = ({ onClose, isDashboard }) => {
  const searchFilterContext = useContext(SearchFilterContext);

  if (!searchFilterContext) {
    throw new Error("FilterModal must be used within a SearchFilterProvider");
  }

  const {
    appliedFilters,
    setAppliedFilters,
    categories,
    setCategories,
    brands,
    setBrands,
    statuses,
    setStatuses,
  } = searchFilterContext;

  // Temporary filter states initialized with current applied filters
  const [tempCategory, setTempCategory] = useState<string>(
    appliedFilters.category || "All"
  );
  const [tempStatus, setTempStatus] = useState<string>(
    appliedFilters.status || "All"
  );
  const [tempBrand, setTempBrand] = useState<string>(
    appliedFilters.brand || "All"
  );
  const [tempMinPrice, setTempMinPrice] = useState<string>(
    appliedFilters.minPrice !== undefined ? String(appliedFilters.minPrice) : ""
  );
  const [tempMaxPrice, setTempMaxPrice] = useState<string>(
    appliedFilters.maxPrice !== undefined ? String(appliedFilters.maxPrice) : ""
  );
  const [tempMinQuantity, setTempMinQuantity] = useState<string>(
    appliedFilters.minQuantity !== undefined
      ? String(appliedFilters.minQuantity)
      : ""
  );
  const [tempMaxQuantity, setTempMaxQuantity] = useState<string>(
    appliedFilters.maxQuantity !== undefined
      ? String(appliedFilters.maxQuantity)
      : ""
  );

  // Local states for dropdown options
  const [localCategories, setLocalCategories] = useState<string[]>(["All"]);
  const [localBrands, setLocalBrands] = useState<string[]>(["All"]);

  // Separate Loading States
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [loadingBrands, setLoadingBrands] = useState<boolean>(false);

  // Separate Error States
  const [errorCategories, setErrorCategories] = useState<string>("");
  const [errorBrands, setErrorBrands] = useState<string>("");

  // Fetch initial filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingCategories(true);
      setLoadingBrands(true);
      try {
        const response = await axiosInstance.get("/godown/options");
        setLocalCategories(["All", ...response.data.categories]);
        setLocalBrands(["All", ...response.data.brands]);
        setStatuses(["All", "In Stock", "Out of Stock"]); // Assuming fixed statuses
        setErrorCategories("");
        setErrorBrands("");
      } catch (error) {
        console.error("Error fetching filter options:", error);
        setErrorCategories("Failed to load categories.");
        setErrorBrands("Failed to load brands.");
      } finally {
        setLoadingCategories(false);
        setLoadingBrands(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Function to fetch options for other filters based on the changed filter
  const fetchOtherFilterOptions = async (
    changedFilter: "category" | "brand",
    newValue: string
  ) => {
    if (changedFilter === "category") {
      setLoadingBrands(true);
      setErrorBrands("");
    } else if (changedFilter === "brand") {
      setLoadingCategories(true);
      setErrorCategories("");
    }

    try {
      const params: Record<string, string> = {};

      if (changedFilter === "category" && newValue !== "All") {
        params.category = newValue;
      } else if (changedFilter === "brand" && newValue !== "All") {
        params.brand = newValue;
      }

      const response = await axiosInstance.get("/godown/options", { params });

      if (changedFilter === "category") {
        setLocalBrands(["All", ...response.data.brands]);
      } else if (changedFilter === "brand") {
        setLocalCategories(["All", ...response.data.categories]);
      }
    } catch (error) {
      console.error("Error fetching dynamic filter options:", error);
      if (changedFilter === "category") {
        setErrorBrands("Failed to update brands.");
      } else if (changedFilter === "brand") {
        setErrorCategories("Failed to update categories.");
      }
    } finally {
      if (changedFilter === "category") {
        setLoadingBrands(false);
      } else if (changedFilter === "brand") {
        setLoadingCategories(false);
      }
    }
  };

  // Handlers for filter changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setTempCategory(newCategory);

    // Fetch and update Brands based on new Category
    fetchOtherFilterOptions("category", newCategory);
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBrand = e.target.value;
    setTempBrand(newBrand);

    // Fetch and update Categories based on new Brand
    fetchOtherFilterOptions("brand", newBrand);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setTempStatus(newStatus);
    // Assuming statuses are fixed, no need to update other filters
  };

  // Handle Apply Filters
  const handleApply = () => {
    const filters: any = {};

    if (tempCategory && tempCategory !== "All") {
      filters.category = tempCategory;
    }
    if (tempStatus && tempStatus !== "All") {
      filters.status = tempStatus;
    }
    if (tempBrand && tempBrand !== "All") {
      filters.brand = tempBrand;
    }
    if (tempMinPrice !== "") {
      filters.minPrice = parseFloat(tempMinPrice);
    }
    if (tempMaxPrice !== "") {
      filters.maxPrice = parseFloat(tempMaxPrice);
    }
    if (tempMinQuantity !== "") {
      filters.minQuantity = parseInt(tempMinQuantity, 10);
    }
    if (tempMaxQuantity !== "") {
      filters.maxQuantity = parseInt(tempMaxQuantity, 10);
    }

    setAppliedFilters(filters);
    onClose();
  };

  // Handle Reset Filters
  const handleReset = () => {
    setTempCategory("All");
    setTempStatus("All");
    setTempBrand("All");
    setTempMinPrice("");
    setTempMaxPrice("");
    setTempMinQuantity("");
    setTempMaxQuantity("");

    setAppliedFilters({});
    const fetchFilterOptions = async () => {
      setLoadingCategories(true);
      setLoadingBrands(true);
      try {
        const response = await axiosInstance.get("/godown/options");
        setLocalCategories(["All", ...response.data.categories]);
        setLocalBrands(["All", ...response.data.brands]);
        setStatuses(["All", "In Stock", "Out of Stock"]);
        setErrorCategories("");
        setErrorBrands("");
      } catch (error) {
        console.error("Error fetching filter options:", error);
        setErrorCategories("Failed to load categories.");
        setErrorBrands("Failed to load brands.");
      } finally {
        setLoadingCategories(false);
        setLoadingBrands(false);
      }
    };
    fetchFilterOptions();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 text-white rounded-lg w-11/12 max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Filter Items</h2>

        {/* Display Error Messages */}
        {errorCategories && (
          <div className="mb-4 p-2 bg-red-600 text-white rounded">
            {errorCategories}
          </div>
        )}
        {errorBrands && (
          <div className="mb-4 p-2 bg-red-600 text-white rounded">
            {errorBrands}
          </div>
        )}

        {/* Filter Controls */}
        <div className="space-y-4">
          {/* Category Dropdown */}
          <FilterDropdown
            label="Category"
            value={tempCategory}
            onChange={handleCategoryChange}
            options={localCategories}
            disabled={loadingCategories}
          />

          {/* Status Dropdown */}
          <FilterDropdown
            label="Status"
            value={tempStatus}
            onChange={handleStatusChange}
            options={statuses} // Assuming statuses are fixed and passed from context
          />

          {/* Brand Dropdown */}
          <FilterDropdown
            label="Brand"
            value={tempBrand}
            onChange={handleBrandChange}
            options={localBrands}
            disabled={loadingBrands}
          />

          {/* Price Range Inputs */}
          <RangeInput
            label="Price"
            min={tempMinPrice}
            max={tempMaxPrice}
            onMinChange={(e) => setTempMinPrice(e.target.value)}
            onMaxChange={(e) => setTempMaxPrice(e.target.value)}
            placeholderMin="Min"
            placeholderMax="Max"
          />

          {/* Quantity Range Inputs */}
          <RangeInput
            label="Quantity"
            min={tempMinQuantity}
            max={tempMaxQuantity}
            onMinChange={(e) => setTempMinQuantity(e.target.value)}
            onMaxChange={(e) => setTempMaxQuantity(e.target.value)}
            placeholderMin="Min"
            placeholderMax="Max"
          />
        </div>

        {/* Apply and Reset Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
