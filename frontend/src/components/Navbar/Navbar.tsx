// src/components/Navbar/Navbar.tsx

import React, { useContext, useState } from "react";
import { Filter, LogOut, BarChart, Home, Menu } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import SearchInput from "../Dashboard/Filter/SearchInput";
import { SearchFilterContext } from "../../context/SearchFilterContext";
import FilterModal from "../Dashboard/Filter/FilterModal";

const Navbar: React.FC = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  // Access search and filter states from context
  const {
    searchQuery,
    setSearchQuery,
    // filterType,
    // setFilterType,
    // statusFilter,
    // setStatusFilter,
    // brandFilter,
    // setBrandFilter,
    // minPrice,
    // setMinPrice,
    // maxPrice,
    // setMaxPrice,
    // minQuantity,
    // setMinQuantity,
    // maxQuantity,
    // setMaxQuantity,
    // categories,
    // brands,
    // statuses,
  } = useContext(SearchFilterContext)!;

  // Determine current route
  const isDashboard = location.pathname === "/dashboard";

  // Define navigation button based on current route
  const navButton = isDashboard ? (
    <Link
      to="/statistics"
      className="flex items-center px-4 py-2 bg-purple-950 text-white rounded hover:bg-purple-900 focus:outline-none"
    >
      <BarChart className="h-5 w-5 mr-2" />
      <span>Statistics</span>
    </Link>
  ) : (
    <Link
      to="/dashboard"
      className="flex items-center px-4 py-2 bg-green-950 text-white rounded hover:bg-green-900 focus:outline-none"
    >
      <Home className="h-5 w-5 mr-2" />
      <span>Dashboard</span>
    </Link>
  );

  // Logout handler
  const handleLogout = () => {
    logout(); // Clear authentication state
    navigate("/login", { state: { fromLogout: true } }); // Redirect to login with state
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex flex-col md:flex-row lg:flex-row justify-between items-center">
        {/* Logo */}
        <div className="flex items-center justify-between w-full md:w-auto lg:w-auto">
          <Link to="/dashboard">
            <img
              src="inventorymate_logo_horizontal_bg.png"
              className="w-36"
              alt="InventoryMate Logo"
            />
          </Link>

          {/* Mobile buttons */}
          <div className="flex items-center space-x-2 md:hidden lg:hidden">
            {/* Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white focus:outline-none flex items-center"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Desktop Search and Filter Button */}
        <div className="hidden md:flex lg:flex items-center space-x-4 mt-4 md:mt-0 lg:mt-0">
          {/* Render Search and Filter only on Dashboard */}
          {isDashboard && (
            <>
              <SearchInput
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-950 text-white rounded hover:bg-blue-900 focus:outline-none"
              >
                <Filter className="h-5 w-5 mr-2" />
                <span>Filter</span>
              </button>
            </>
          )}
          {/* Navigation Button */}
          {navButton}
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-950 text-white rounded hover:bg-red-900 focus:outline-none"
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden lg:hidden bg-gray-800 p-4">
          {/* Render Search and Filter only on Dashboard */}
          {isDashboard && (
            <div className="flex flex-row mb-4 gap-x-2">
              <div className="flex-1">
                <SearchInput
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
              <div>
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-blue-950 text-white rounded hover:bg-blue-900 focus:outline-none h-full"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  <span>Filter</span>
                </button>
              </div>
            </div>
          )}
          {/* Navigation and Logout Buttons */}
          <div className="flex flex-col gap-y-2 w-32">
            <div>{navButton}</div>
            <div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-950 text-white rounded hover:bg-red-900 focus:outline-none w-full"
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && isDashboard && (
        <FilterModal onClose={() => setIsFilterModalOpen(false)} isDashboard />
      )}
    </nav>
  );
};

export default Navbar;
