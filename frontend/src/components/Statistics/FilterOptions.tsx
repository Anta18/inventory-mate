// src/components/Statistics/FilterOptions.tsx

import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

interface FilterOptionsProps {
  selectedGodown: string;
  setSelectedGodown: (value: string) => void;
  selectedSubGodown: string;
  setSelectedSubGodown: (value: string) => void;
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({
  selectedGodown,
  setSelectedGodown,
  selectedSubGodown,
  setSelectedSubGodown,
  selectedBrand,
  setSelectedBrand,
  selectedCategory,
  setSelectedCategory,
  onApply,
  onReset,
}) => {
  const [godowns, setGodowns] = useState<
    { _id: string; name: string; parent_godown: string | null }[]
  >([]);
  const [subGodowns, setSubGodowns] = useState<
    { _id: string; name: string; parent_godown: string | null }[]
  >([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Fetch Godowns on Mount
    axiosInstance
      .get("/godown/list")
      .then((res) => setGodowns(res.data))
      .catch((err) => console.error("Error fetching godowns:", err));

    // Initial Fetch for Brands and Categories (No Filters Applied)
    axiosInstance
      .get("/godown/options")
      .then((res) => {
        setBrands(res.data.brands);
        setCategories(res.data.categories);
      })
      .catch((err) => console.error("Error fetching filter options:", err));
  }, []);

  useEffect(() => {
    // Fetch SubGodowns and Update Brands & Categories Based on Current Selections
    const fetchOptions = async () => {
      try {
        const params: any = {};

        if (selectedGodown) {
          params.godown = selectedGodown;
        }
        if (selectedSubGodown) {
          params.subgodown = selectedSubGodown;
        }
        if (selectedBrand) {
          params.brand = selectedBrand;
        }
        if (selectedCategory) {
          params.category = selectedCategory;
        }

        const response = await axiosInstance.get("/godown/options", {
          params,
        });

        // Update Brands and Categories Based on Response
        setBrands(response.data.brands);
        setCategories(response.data.categories);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };

    fetchOptions();
  }, [selectedGodown, selectedSubGodown, selectedBrand, selectedCategory]);

  useEffect(() => {
    if (selectedGodown) {
      // Fetch SubGodowns Based on Selected Godown
      axiosInstance
        .get("/godown/list", {
          params: { parent_godown: selectedGodown },
        })
        .then((res) => {
          setSubGodowns(res.data);
        })
        .catch((err) => console.error("Error fetching subgodowns:", err));
    } else {
      setSubGodowns([]);
      setSelectedSubGodown("");
    }
  }, [selectedGodown, setSelectedSubGodown]);

  const handleApply = () => {
    onApply();
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <h2 className="text-xl font-semibold mb-4">Filter Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Godown Selector */}
        <div>
          <label className="block text-gray-300">Godown</label>
          <select
            value={selectedGodown}
            onChange={(e) => setSelectedGodown(e.target.value)}
            className="w-full mt-1 p-2 bg-gray-700 text-white rounded"
          >
            <option value="">All Godowns</option>
            {godowns.map((godown) => (
              <option key={godown._id} value={godown._id}>
                {godown.name}
              </option>
            ))}
          </select>
        </div>

        {/* SubGodown Selector */}
        <div>
          <label className="block text-gray-300">SubGodown</label>
          <select
            value={selectedSubGodown}
            onChange={(e) => setSelectedSubGodown(e.target.value)}
            className="w-full mt-1 p-2 bg-gray-700 text-white rounded"
            disabled={!selectedGodown}
          >
            <option value="">All SubGodowns</option>
            {subGodowns.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-gray-300">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full mt-1 p-2 bg-gray-700 text-white rounded"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {/* Brand Selector */}
        <div>
          <label className="block text-gray-300">Brand</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full mt-1 p-2 bg-gray-700 text-white rounded"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Apply and Reset Buttons */}
      <div className="mt-4 flex justify-end space-x-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterOptions;
