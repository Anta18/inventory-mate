import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string;
  onFilterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  categories: string[];
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  categories,
  setIsSidebarOpen,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      setIsSidebarOpen(true);
    }
  }, [searchQuery]);

  return (
    <nav className="bg-gray-800 p-4 h-16">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <img src="inventorymate_logo_horizontal_bg.png" className="w-36" />

          {/* Desktop search and filter */}
          <div className="hidden lg:flex md:flex items-center space-x-4">
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

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden md:hidden text-white focus:outline-none"
          >
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="mt-4 lg:hidden md:hidden">
            <SearchInput
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
            <div className="mt-2">
              <FilterDropdown
                filterType={filterType}
                onFilterChange={onFilterChange}
                categories={categories}
              />
            </div>
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
  <div className="relative">
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
