import React, { useState } from "react";
import { Search, Menu, X } from "lucide-react";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string;
  onFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  categories: string[];
}

const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  categories,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white px-4 py-3">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <img
            className="h-10 object-contain"
            src="inventorymate_logo_horizontal.png"
            alt="INVENTORY MATE"
          />

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white focus:outline-none"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop search and filter */}
          <div className="hidden lg:flex items-center space-x-4">
            <SearchInput
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
            <FilterDropdown
              filterType={filterType}
              onFilterChange={onFilterChange}
              categories={categories}
            />
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="mt-4 lg:hidden space-y-4">
            <SearchInput
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
            <FilterDropdown
              filterType={filterType}
              onFilterChange={onFilterChange}
              categories={categories}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

const SearchInput: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({ searchQuery, onSearchChange }) => (
  <div className="relative flex-grow max-w-md">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search..."
      className="w-full px-4 py-2 pl-10 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <Search
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      size={18}
    />
  </div>
);

const FilterDropdown: React.FC<{
  filterType: string;
  onFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  categories: string[];
}> = ({ filterType, onFilterChange, categories }) => (
  <select
    value={filterType}
    onChange={onFilterChange}
    className="px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {categories.length > 0 ? (
      categories.map((category) => (
        <option key={category} value={category}>
          {category === "All" ? "All Categories" : category}
        </option>
      ))
    ) : (
      <option value="All">All Categories</option>
    )}
  </select>
);

export default Navbar;
