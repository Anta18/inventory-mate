// src/components/Navbar.tsx

import React from "react";
import { Search, Filter, X } from "lucide-react";

export interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string;
  onFilterTypeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  statusFilter: string;
  onStatusChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  brandFilter: string;
  onBrandChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  minPrice: number | "";
  onMinPriceChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxPrice: number | "";
  onMaxPriceChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  minQuantity: number | "";
  onMinQuantityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxQuantity: number | "";
  onMaxQuantityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  categories: string[];
  brands: string[];
  statuses: string[];
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  statusFilter,
  onStatusChange,
  brandFilter,
  onBrandChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  minQuantity,
  onMinQuantityChange,
  maxQuantity,
  onMaxQuantityChange,
  categories,
  brands,
  statuses,
  setIsSidebarOpen,
}) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = React.useState(false);

  // Open sidebar when search query is present
  React.useEffect(() => {
    if (searchQuery) {
      setIsSidebarOpen(true);
    }
  }, [searchQuery, setIsSidebarOpen]);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex flex-col lg:flex-row md:flex-row justify-between items-center">
        {/* Logo */}
        <div className="flex items-center justify-between w-full lg:w-auto md:w-auto">
          <img
            src="inventorymate_logo_horizontal_bg.png"
            className="w-36"
            alt="InventoryMate Logo"
          />

          {/* Mobile menu button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="lg:hidden md:hidden text-white focus:outline-none mt-2 flex items-center"
          >
            <Filter className="h-5 w-5 mr-1" />
            <span>Filter</span>
          </button>
        </div>

        {/* Desktop Search and Filter Button */}
        <div className="hidden lg:flex md:flex items-center space-x-4 mt-4 lg:mt-0">
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
          >
            <Filter className="h-5 w-5 mr-2" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setIsFilterModalOpen(false)}
        >
          <div
            className="bg-gray-900 text-white rounded-lg w-11/12 max-w-lg p-6 relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold mb-4">Filter Items</h2>

            {/* Filter Controls */}
            <div className="space-y-4">
              <FilterDropdown
                label="Category"
                value={filterType}
                onChange={onFilterTypeChange}
                options={categories}
              />
              <FilterDropdown
                label="Status"
                value={statusFilter}
                onChange={onStatusChange}
                options={statuses}
              />
              <FilterDropdown
                label="Brand"
                value={brandFilter}
                onChange={onBrandChange}
                options={brands}
              />
              <RangeInput
                label="Price"
                min={minPrice}
                max={maxPrice}
                onMinChange={onMinPriceChange}
                onMaxChange={onMaxPriceChange}
                placeholderMin="Min"
                placeholderMax="Max"
              />
              <RangeInput
                label="Quantity"
                min={minQuantity}
                max={maxQuantity}
                onMinChange={onMinQuantityChange}
                onMaxChange={onMaxQuantityChange}
                placeholderMin="Min"
                placeholderMax="Max"
              />
            </div>

            {/* Apply Filters Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Search Input Component
const SearchInput: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({ searchQuery, onSearchChange }) => (
  <div className="relative w-full max-w-xs">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search..."
      className="w-full px-4 py-2 pl-10 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// Filter Dropdown Component
const FilterDropdown: React.FC<{
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}> = ({ label, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-300 mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === "All" ? "All" : capitalize(option)}
        </option>
      ))}
    </select>
  </div>
);

// Range Input Component (for Price and Quantity)
const RangeInput: React.FC<{
  label: string;
  min: number | "";
  max: number | "";
  onMinChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholderMin: string;
  placeholderMax: string;
}> = ({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
  placeholderMin,
  placeholderMax,
}) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-300 mb-1">{label} Range</label>
    <div className="flex space-x-2">
      <input
        type="number"
        value={min}
        onChange={onMinChange}
        placeholder={placeholderMin}
        className="w-1/2 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        min="0"
      />
      <input
        type="number"
        value={max}
        onChange={onMaxChange}
        placeholder={placeholderMax}
        className="w-1/2 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        min="0"
      />
    </div>
  </div>
);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default Navbar;
