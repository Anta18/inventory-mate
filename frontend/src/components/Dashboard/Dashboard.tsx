// src/components/Dashboard/Dashboard.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import Tree from "../Sidebar/Tree";
import ItemDetails from "./ItemDetails";
import axiosInstance from "../../api/axiosInstance";
import { TreeItem, Location } from "../../types";
import debounce from "lodash.debounce";
import { Menu } from "lucide-react";
import { SearchFilterContext } from "../../context/SearchFilterContext";

const Dashboard: React.FC = () => {
  // State declarations
  const [filteredTreeData, setFilteredTreeData] = useState<TreeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TreeItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Access search and filter states from context
  const {
    searchQuery,
    setSearchQuery,
    filterType,
    statusFilter,
    brandFilter,
    minPrice,
    maxPrice,
    minQuantity,
    maxQuantity,
    setCategories,
    setBrands,
    setStatuses,
  } = useContext(SearchFilterContext)!;

  // Memoized function to convert Location to TreeItem
  const convertLocationsToTreeItems = useCallback(
    (locations: Location[]): TreeItem[] => {
      return locations
        .map((loc): TreeItem | null => {
          // Recursively convert sub-godowns
          const subGodowns = loc.subGodowns
            ? convertLocationsToTreeItems(loc.subGodowns)
            : [];

          // Map items to TreeItem objects
          const items = loc.items
            ? loc.items.map(
                (item): TreeItem => ({
                  _id: item._id,
                  name: item.name,
                  type: "item",
                  itemDetails: item,
                  shouldExpand: false,
                })
              )
            : [];

          // Combine sub-godowns and items
          const children = [...subGodowns, ...items];

          // If no children, exclude this godown
          if (children.length === 0) {
            return null;
          }

          return {
            _id: loc._id,
            name: loc.name,
            type: "location",
            shouldExpand: false,
            isSubGodown: !(loc.subGodowns && loc.subGodowns.length > 0),
            children: children,
          };
        })
        .filter((item): item is TreeItem => item !== null);
    },
    []
  );

  // Fetch all data or based on filters
  const fetchTreeData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Build query parameters for filtering
      const params: Record<string, string> = {};

      if (filterType && filterType !== "All") {
        params.category = filterType;
      }

      if (statusFilter && statusFilter !== "All") {
        params.status = statusFilter;
      }

      if (brandFilter && brandFilter !== "All") {
        params.brand = brandFilter;
      }

      if (minPrice !== "") {
        params.minPrice = String(minPrice);
      }

      if (maxPrice !== "") {
        params.maxPrice = String(maxPrice);
      }

      if (minQuantity !== "") {
        params.minQuantity = String(minQuantity);
      }

      if (maxQuantity !== "") {
        params.maxQuantity = String(maxQuantity);
      }

      const response = await axiosInstance.get("godown/filtered", {
        params,
      });
      const locations: Location[] = response.data;

      const treeItems = convertLocationsToTreeItems(locations);
      setFilteredTreeData(treeItems);

      // Update categories, brands, and statuses based on fetched data
      // Collect unique categories, brands, and statuses
      const categorySet = new Set<string>();
      const brandSet = new Set<string>();
      const statusSet = new Set<string>();

      const collectFilters = (items: TreeItem[]) => {
        items.forEach((item) => {
          if (item.type === "item" && item.itemDetails) {
            if (item.itemDetails.category) {
              categorySet.add(item.itemDetails.category);
            }
            if (item.itemDetails.brand) {
              brandSet.add(item.itemDetails.brand);
            }
            if (item.itemDetails.status) {
              statusSet.add(item.itemDetails.status);
            }
          }
          if (item.children) {
            collectFilters(item.children);
          }
        });
      };

      collectFilters(treeItems);

      // Update categories, brands, and statuses in context
      setCategories(["All", ...Array.from(categorySet).sort()]);
      setBrands(["All", ...Array.from(brandSet).sort()]);
      setStatuses(["All", ...Array.from(statusSet).sort()]);
    } catch (error: any) {
      console.error("Error fetching tree data:", error);
      setError("Failed to load tree data.");
    } finally {
      setLoading(false);
    }
  }, [
    filterType,
    statusFilter,
    brandFilter,
    minPrice,
    maxPrice,
    minQuantity,
    maxQuantity,
    convertLocationsToTreeItems,
    setCategories,
    setBrands,
    setStatuses,
  ]);

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchTreeData();
  }, [fetchTreeData]);

  // Debounced search handler to optimize performance
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
        if (query) {
          setIsSidebarOpen(true);
        }
      }, 100),
    []
  );

  // Handlers for additional filters are managed via context setters

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Helper function to find an item by its ID
  const findItemById = useCallback(
    (items: TreeItem[], id: string): TreeItem | null => {
      for (const item of items) {
        if (item._id === id) {
          return item;
        }
        if (item.children) {
          const found = findItemById(item.children, id);
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  const handleSelect = (item: TreeItem) => {
    setSelectedItem(item);
  };

  // Handle item movement within the tree
  const handleItemMove = async (itemId: string, newParentId: string) => {
    try {
      const response = await axiosInstance.post("/item/move", {
        itemId,
        toLocationId: newParentId,
      });

      if (response.status === 200) {
        // Update the tree data to reflect the move
        const updatedFilteredData = updateTreeDataAfterMove(
          filteredTreeData,
          itemId,
          newParentId
        );
        setFilteredTreeData(updatedFilteredData);

        // Find the moved item in the updated tree
        const movedItem = findItemById(updatedFilteredData, itemId);

        if (movedItem) {
          setSelectedItem(movedItem);
        } else {
          console.error(
            `Moved item with ID ${itemId} not found in the updated tree.`
          );
        }
      }
    } catch (error) {
      console.error("Error moving item:", error);
    }
  };

  // Function to update tree data after moving an item
  const updateTreeDataAfterMove = (
    data: TreeItem[],
    itemId: string,
    newParentId: string
  ): TreeItem[] => {
    let movedItem: TreeItem | null = null;

    // Step 1: Remove the item from its original location
    const removeItem = (items: TreeItem[]): TreeItem[] => {
      return items.reduce<TreeItem[]>((acc, item) => {
        if (item._id === itemId) {
          movedItem = { ...item };
          // Skip adding this item to the accumulator to remove it
          return acc;
        }

        if (item.children) {
          const updatedChildren = removeItem(item.children);
          acc.push({
            ...item,
            children: updatedChildren,
            shouldExpand: false,
          });
        } else {
          acc.push(item);
        }

        return acc;
      }, []);
    };

    // Step 2: Insert the item into the new parent
    const addItem = (items: TreeItem[]): TreeItem[] => {
      return items.map((item) => {
        if (item._id === newParentId && movedItem) {
          return {
            ...item,
            children: item.children
              ? [...item.children, movedItem]
              : [movedItem],
            shouldExpand: false,
          };
        }

        if (item.children) {
          return {
            ...item,
            children: addItem(item.children),
            shouldExpand: false,
          };
        }

        return item;
      });
    };

    // Perform the removal
    const treeAfterRemoval = removeItem(data);

    if (!movedItem) {
      console.error(`Item with ID ${itemId} not found.`);
      return data; // Return original data if item not found
    }

    // Perform the addition
    const treeAfterAddition = addItem(treeAfterRemoval);

    return treeAfterAddition;
  };

  // Compute displayed data by applying frontend search on filtered data
  const displayedTreeData = useMemo(() => {
    if (!searchQuery) {
      return filteredTreeData;
    }

    const searchLower = searchQuery.toLowerCase();

    // Recursive function to filter tree data based on search query
    const filterTree = (items: TreeItem[]): TreeItem[] => {
      return items
        .map((item) => {
          const itemNameLower = item.name.toLowerCase();
          const isItemMatch =
            item.type === "item" && itemNameLower.includes(searchLower);
          const isLocationMatch =
            item.type === "location" && itemNameLower.includes(searchLower);

          if (item.type === "item") {
            return isItemMatch ? { ...item } : null;
          }

          if (item.type === "location" && item.children) {
            if (isLocationMatch) {
              // If the location itself matches, include all its children but do NOT expand it
              return {
                ...item,
                children: item.children, // Include all children
                shouldExpand: false, // Do not expand
              };
            }

            // Otherwise, filter the children
            const filteredChildren = filterTree(item.children);

            if (filteredChildren.length > 0) {
              // If any child matches, include the location and expand it
              return {
                ...item,
                children: filteredChildren,
                shouldExpand: true, // Expand to show matching children
              };
            }

            // If neither the location nor its children match, exclude it
            return null;
          }

          return null;
        })
        .filter((item): item is TreeItem => item !== null);
    };

    return filterTree(filteredTreeData);
  }, [searchQuery, filteredTreeData]);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Hamburger menu for small devices */}
      <div className="sm:hidden bg-gray-800 p-2 m-2 w-10 h-10">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white focus:outline-none flex items-center"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden bg-gray-900">
        {/* Sidebar */}
        <div
          className={`w-64 bg-gray-900 overflow-auto custom-scrollbar ${
            isSidebarOpen
              ? "fixed inset-y-0 left-0 z-50 mt-16 sm:mt-0 sm:relative sm:z-0"
              : "hidden"
          } sm:block`}
        >
          <Tree
            data={displayedTreeData}
            loading={loading}
            error={error}
            onSelect={handleSelect}
            selectedItem={selectedItem}
            searchQuery={searchQuery}
            onItemMove={handleItemMove}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 bg-black custom-scrollbar">
          <ItemDetails item={selectedItem} />
        </div>
      </div>

      {/* Overlay for small devices when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;
