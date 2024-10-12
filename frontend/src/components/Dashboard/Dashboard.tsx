// src/components/Dashboard/Dashboard.tsx

import React, { useState, useEffect, useCallback } from "react";
import Tree from "../Sidebar/Tree";
import ItemDetails from "./ItemDetails";
import Navbar from "../Navbar"; // Import Navbar
import axiosInstance from "../../api/axiosInstance";
import { TreeItem, Location } from "../../types";
import debounce from "lodash.debounce";
import { Menu } from "lucide-react";

const Dashboard: React.FC = () => {
  // State declarations
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [filteredTreeData, setFilteredTreeData] = useState<TreeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TreeItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // States for search and filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>(["All"]);

  // Fetch tree data on component mount
  useEffect(() => {
    // Helper function to recursively collect categories
    const collectCategories = (items: TreeItem[], categorySet: Set<string>) => {
      items.forEach((item) => {
        if (item.type === "item" && item.itemDetails?.category) {
          categorySet.add(item.itemDetails.category);
        }
        if (item.children) {
          collectCategories(item.children, categorySet);
        }
      });
    };

    // Fetch tree data from backend
    const fetchTreeData = async () => {
      try {
        const response = await axiosInstance.get("/godown"); // Adjusted endpoint
        const locations: Location[] = response.data;

        // Convert Location[] to TreeItem[]
        const convertLocationsToTreeItems = (
          locations: Location[]
        ): TreeItem[] => {
          return locations.map(
            (loc): TreeItem => ({
              _id: loc._id,
              name: loc.name,
              type: "location",
              shouldExpand: false,
              isSubGodown: !(loc.subGodowns && loc.subGodowns.length > 0),
              children: [
                ...(loc.subGodowns
                  ? convertLocationsToTreeItems(loc.subGodowns)
                  : []),
                ...(loc.items
                  ? loc.items.map(
                      (item): TreeItem => ({
                        _id: item._id,
                        name: item.name,
                        type: "item",
                        itemDetails: item,
                        shouldExpand: false,
                      })
                    )
                  : []),
              ],
            })
          );
        };

        const treeItems = convertLocationsToTreeItems(locations);
        setTreeData(treeItems);
        setFilteredTreeData(treeItems); // Initialize filtered data

        // Collect unique categories
        const categorySet = new Set<string>();
        collectCategories(treeItems, categorySet);
        setCategories(["All", ...Array.from(categorySet).sort()]);
      } catch (error) {
        console.error("Error fetching tree data:", error);
        setError("Failed to load tree data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, []);

  // Debounced search handler to optimize performance
  const handleSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      if (query) {
        setIsSidebarOpen(true);
      }
    }, 150),
    []
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };

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

  // Effect to filter tree data based on searchQuery and filterType
  // useEffect(() => {
  //   if (!searchQuery && filterType === "All") {
  //     // Reset shouldExpand for all nodes
  //     const resetExpand = (items: TreeItem[]): TreeItem[] => {
  //       return items.map((item) => ({
  //         ...item,
  //         shouldExpand: false,
  //         children: item.children ? resetExpand(item.children) : [],
  //       }));
  //     };
  //     setFilteredTreeData(resetExpand(treeData));
  //     return;
  //   }

  //   const filterTree = (items: TreeItem[]): TreeItem[] => {
  //     return items
  //       .map((item) => {
  //         if (item.type === "item") {
  //           const matchesFilter =
  //             filterType === "All" ||
  //             (item.itemDetails?.category &&
  //               item.itemDetails.category.toLowerCase() ===
  //                 filterType.toLowerCase());

  //           const matchesSearch = searchQuery
  //             ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //               (item.itemDetails &&
  //                 Object.values(item.itemDetails.attributes || {}).some(
  //                   (attr) =>
  //                     String(attr)
  //                       .toLowerCase()
  //                       .includes(searchQuery.toLowerCase())
  //                 ))
  //             : true; // If no searchQuery, consider it as a match

  //           if (matchesFilter && matchesSearch) {
  //             return { ...item, shouldExpand: false };
  //           }
  //           return null;
  //         } else if (item.type === "location" && item.children) {
  //           if (searchQuery) {
  //             const locationMatchesSearch = item.name
  //               .toLowerCase()
  //               .includes(searchQuery.toLowerCase());

  //             if (locationMatchesSearch) {
  //               // If the location itself matches, include all its children without filtering
  //               // Also, set shouldExpand to true
  //               const filteredChildren =
  //                 filterType !== "All"
  //                   ? item.children.filter((child) => {
  //                       if (child.type === "item") {
  //                         return (
  //                           child.itemDetails?.category &&
  //                           child.itemDetails.category.toLowerCase() ===
  //                             filterType.toLowerCase()
  //                         );
  //                       }
  //                       return true; // For sublocations, include them as is
  //                     })
  //                   : item.children;

  //               return {
  //                 ...item,
  //                 children: filteredChildren,
  //                 shouldExpand: true,
  //               };
  //             } else {
  //               // If the location doesn't match, filter its children
  //               const filteredChildren = filterTree(item.children);
  //               if (filteredChildren.length > 0) {
  //                 return {
  //                   ...item,
  //                   children: filteredChildren,
  //                   shouldExpand: true,
  //                 };
  //               }
  //               return null;
  //             }
  //           } else {
  //             // When searchQuery is empty but filterType is not "All"
  //             // Recursively filter children
  //             const filteredChildren =
  //               filterType !== "All"
  //                 ? filterTree(item.children)
  //                 : item.children;

  //             if (filterType !== "All") {
  //               if (filteredChildren.length > 0) {
  //                 return {
  //                   ...item,
  //                   children: filteredChildren,
  //                   shouldExpand: false, // Do not expand when only filtering
  //                 };
  //               }
  //             } else {
  //               // When filterType is "All" but searchQuery is empty, handled earlier
  //               return null;
  //             }
  //             return null;
  //           }
  //         }
  //         return null;
  //       })
  //       .filter((item): item is TreeItem => item !== null); // Type predicate here
  //   };

  //   const newFilteredData = filterTree(treeData);
  //   setFilteredTreeData(newFilteredData);
  // }, [searchQuery, filterType, treeData]);

  useEffect(() => {
    if (!searchQuery && filterType === "All") {
      // Reset shouldExpand for all nodes
      const resetExpand = (items: TreeItem[]): TreeItem[] => {
        return items.map((item) => ({
          ...item,
          shouldExpand: false,
          children: item.children ? resetExpand(item.children) : [],
        }));
      };
      setFilteredTreeData(resetExpand(treeData));
      return;
    }

    const filterTree = (items: TreeItem[]): TreeItem[] => {
      return items
        .map((item) => {
          if (item.type === "item") {
            const matchesFilter =
              filterType === "All" ||
              (item.itemDetails?.category &&
                item.itemDetails.category.toLowerCase() ===
                  filterType.toLowerCase());

            const matchesSearch = searchQuery
              ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
              : true; // If no searchQuery, consider it as a match

            if (matchesFilter && matchesSearch) {
              return { ...item, shouldExpand: false };
            }
            return null;
          } else if (item.type === "location" && item.children) {
            if (searchQuery) {
              const locationMatchesSearch = item.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

              if (locationMatchesSearch) {
                // If the location itself matches, include all its children without filtering
                // Also, set shouldExpand to true
                const filteredChildren =
                  filterType !== "All"
                    ? item.children.filter((child) => {
                        if (child.type === "item") {
                          return (
                            child.itemDetails?.category &&
                            child.itemDetails.category.toLowerCase() ===
                              filterType.toLowerCase()
                          );
                        }
                        return true; // For sublocations, include them as is
                      })
                    : item.children;

                return {
                  ...item,
                  children: filteredChildren,
                  shouldExpand: true,
                };
              } else {
                // If the location doesn't match, filter its children
                const filteredChildren = filterTree(item.children);
                if (filteredChildren.length > 0) {
                  return {
                    ...item,
                    children: filteredChildren,
                    shouldExpand: true,
                  };
                }
                return null;
              }
            } else {
              // When searchQuery is empty but filterType is not "All"
              // Recursively filter children
              const filteredChildren =
                filterType !== "All"
                  ? filterTree(item.children)
                  : item.children;

              if (filterType !== "All") {
                if (filteredChildren.length > 0) {
                  return {
                    ...item,
                    children: filteredChildren,
                    shouldExpand: false, // Do not expand when only filtering
                  };
                }
              } else {
                // When filterType is "All" but searchQuery is empty, handled earlier
                return null;
              }
              return null;
            }
          }
          return null;
        })
        .filter((item): item is TreeItem => item !== null); // Type predicate here
    };

    const newFilteredData = filterTree(treeData);
    setFilteredTreeData(newFilteredData);
  }, [searchQuery, filterType, treeData]);

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
        const updatedTreeData = updateTreeDataAfterMove(
          treeData,
          itemId,
          newParentId
        );
        setTreeData(updatedTreeData);
        setFilteredTreeData(updatedTreeData);

        // Find the moved item in the updated tree
        const movedItem = findItemById(updatedTreeData, itemId);

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
      // Optionally, set an error state or show a notification to the user
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
            shouldExpand: false, // Optionally set to true to show the new child
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

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        filterType={filterType}
        onFilterChange={handleFilterChange}
        categories={categories}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Hamburger menu for small devices */}
      <div className="lg:hidden md:hidden bg-gray-800 p-2 m-2 w-10 h-10 lg:p-0 lg:m-0">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white focus:outline-none "
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden bg-gray-900">
        {/* Sidebar */}
        <div
          className={`w-64 bg-gray-900 border-r overflow-auto custom-scrollbar ${
            isSidebarOpen
              ? "fixed inset-y-0 left-0 z-50  mt-16 lg:mt-0 lg:relative lg:z-0"
              : "hidden"
          } lg:block md:block`}
        >
          <Tree
            data={filteredTreeData}
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;
