// src/components/Statistics/StatisticsPage.tsx

import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Statistics, Location, ItemDetails } from "../../types";
import LoadingSkeleton from "../LoadingSkeleton";
import ErrorMessage from "../ErrorMessage";
import StockStatusChart from "./charts/StockStatusChart";
import ItemsPerCategoryChart from "./charts/ItemsPerCategoryChart";
import ItemsPerBrandChart from "./charts/ItemsPerBrandChart";
import StatCard from "./StatCard";
import FilterOptions from "./FilterOptions";

const StatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);

  // Filter Selection States
  const [filterGodown, setFilterGodown] = useState<string>("");
  const [filterSubGodown, setFilterSubGodown] = useState<string>("");
  const [filterBrand, setFilterBrand] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  // Applied Filters State
  const [appliedFilters, setAppliedFilters] = useState<{
    godown?: string;
    subgodown?: string;
    brand?: string;
    category?: string;
  }>({});

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Use Applied Filters for Fetching
      const { godown, subgodown, brand, category } = appliedFilters;

      const response = await axiosInstance.get("/godown/filtered", {
        params: {
          godown: godown || undefined,
          subgodown: subgodown || undefined,
          brand: brand || undefined,
          category: category || undefined,
        },
      });
      const locations: Location[] = response.data;

      const allItems: ItemDetails[] = [];

      let godownCount = 0;
      let subGodownCount = 0;

      const traverseLocations = (locs: Location[]) => {
        locs.forEach((loc) => {
          godownCount += 1;
          if (loc.items) {
            allItems.push(...loc.items);
          }
          if (loc.subGodowns && loc.subGodowns.length > 0) {
            subGodownCount += loc.subGodowns.length;
            traverseLocations(loc.subGodowns);
          }
        });
      };

      traverseLocations(locations);

      godownCount -= subGodownCount;
      // Compute Statistics
      const totalItems = allItems.length;
      const totalLocations = godownCount + subGodownCount;
      const inStock = allItems.filter(
        (item) => item.status === "in_stock"
      ).length;
      const outOfStock = allItems.filter(
        (item) => item.status === "out_of_stock"
      ).length;
      const totalInventoryValue = allItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      // Items per Category
      const itemsPerCategory: Record<string, number> = {};
      allItems.forEach((item) => {
        itemsPerCategory[item.category] =
          (itemsPerCategory[item.category] || 0) + 1;
      });

      // Items per Brand
      const itemsPerBrand: Record<string, number> = {};
      allItems.forEach((item) => {
        itemsPerBrand[item.brand] = (itemsPerBrand[item.brand] || 0) + 1;
      });

      // Low Stock Items (quantity < 10)
      const lowStockThreshold = 10;
      const lowStockItems = allItems.filter(
        (item) => item.quantity < lowStockThreshold
      );

      setStatistics({
        totalItems,
        totalLocations,
        totalGodowns: godownCount,
        totalSubGodowns: subGodownCount,
        inStock,
        outOfStock,
        totalInventoryValue,
        itemsPerCategory,
        itemsPerBrand,
        lowStockItems,
      });
    } catch (err: any) {
      console.error("Error fetching statistics:", err);
      setError("Failed to load statistics.");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      godown: filterGodown || undefined,
      subgodown: filterSubGodown || undefined,
      brand: filterBrand || undefined,
      category: filterCategory || undefined,
    });
  };

  // Handle Resetting Filters
  const handleResetFilters = () => {
    setFilterGodown("");
    setFilterSubGodown("");
    setFilterBrand("");
    setFilterCategory("");
    setAppliedFilters({});
  };

  return (
    <div className="p-6 bg-black text-white h-full overflow-auto custom-scrollbar">
      {/* Heading and Toggle Filter Button */}
      <div className="w-full flex justify-between">
        <h1 className="text-3xl font-bold mb-6">Inventory Statistics</h1>
        {/* Toggle Filter Button */}
        <button
          onClick={() => setIsFilterVisible(!isFilterVisible)}
          className="px-4 py-2 bg-blue-950 text-white rounded hover:bg-blue-900 mb-4"
        >
          {isFilterVisible ? "Hide Filters" : "Filter Stats"}
        </button>
      </div>

      {/* Filter Options */}
      {isFilterVisible && (
        <FilterOptions
          selectedGodown={filterGodown}
          setSelectedGodown={setFilterGodown}
          selectedSubGodown={filterSubGodown}
          setSelectedSubGodown={setFilterSubGodown}
          selectedCategory={filterCategory}
          setSelectedCategory={setFilterCategory}
          selectedBrand={filterBrand}
          setSelectedBrand={setFilterBrand}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : !statistics ? null : (
        <>
          {/* Numerical Statistics */}
          <div
            className={`${
              appliedFilters.godown
                ? "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                : "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            }`}
          >
            {!appliedFilters.godown && (
              <>
                <StatCard
                  title="Total Locations"
                  value={statistics.totalLocations}
                />
                <StatCard
                  title="Total Godowns"
                  value={statistics.totalGodowns}
                />
              </>
            )}
            {!appliedFilters.subgodown && (
              <StatCard
                title="Total SubGodowns"
                value={statistics.totalSubGodowns}
              />
            )}
            <StatCard title="Total Items" value={statistics.totalItems} />
            <StatCard title="In Stock" value={statistics.inStock} />
            <StatCard title="Out of Stock" value={statistics.outOfStock} />
            <StatCard
              title="Low Stock Items"
              value={statistics.lowStockItems.length}
            />
            <StatCard
              title="Total Inventory Value"
              value={`$${statistics.totalInventoryValue.toFixed(2)}`}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Stock Status</h2>
              <StockStatusChart
                inStock={statistics.inStock}
                outOfStock={statistics.outOfStock}
              />
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Items per Category</h2>
              <ItemsPerCategoryChart data={statistics.itemsPerCategory} />
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Items per Brand</h2>
              <ItemsPerBrandChart data={statistics.itemsPerBrand} />
            </div>
          </div>

          {/* Low Stock Items Table */}
          <div className="mt-8 bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Low Stock Items</h2>
            {statistics.lowStockItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-700">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Item Name</th>
                      <th className="py-2 px-4 border-b">Category</th>
                      <th className="py-2 px-4 border-b">Brand</th>
                      <th className="py-2 px-4 border-b">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.lowStockItems.map((item) => (
                      <tr key={item._id} className="text-center">
                        <td className="py-2 px-4 border-b">{item.name}</td>
                        <td className="py-2 px-4 border-b">{item.category}</td>
                        <td className="py-2 px-4 border-b">{item.brand}</td>
                        <td className="py-2 px-4 border-b">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-300">
                No items are currently low in stock.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StatisticsPage;
