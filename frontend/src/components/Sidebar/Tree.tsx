import React, { useState, useCallback } from "react";
import { TreeItem } from "../../types";
import { Menu, X } from "lucide-react";
import TreeNode from "./TreeNode";

interface TreeProps {
  data: TreeItem[];
  onSelect: (item: TreeItem) => void;
  selectedItem: TreeItem | null;
  searchQuery: string;
  onItemMove: (itemId: string, newParentId: string) => void;
}

const Tree: React.FC<TreeProps> = ({
  data,
  onSelect,
  selectedItem,
  searchQuery,
  onItemMove,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<TreeItem | null>(null);

  const handleDragStart = useCallback((item: TreeItem) => {
    setDraggedItem(item);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const handleDrop = useCallback(
    (targetItem: TreeItem) => {
      if (draggedItem && draggedItem.type === "item") {
        let newParentId: string;

        if (targetItem.type === "location" && targetItem.isSubGodown === true) {
          newParentId = targetItem._id;
        } else if (targetItem.type === "item") {
          // Find the immediate parent of the target item
          const findParent = (items: TreeItem[]): string | null => {
            for (const item of items) {
              if (
                item.children?.some((child) => child._id === targetItem._id)
              ) {
                return item._id;
              }
              if (item.children) {
                const result = findParent(item.children);
                if (result) return result;
              }
            }
            return null;
          };
          const parentId = findParent(data);
          if (parentId) {
            newParentId = parentId;
          } else {
            console.error("Parent not found for target item");
            return;
          }
        } else {
          console.error("Invalid drop target");
          return;
        }

        onItemMove(draggedItem._id, newParentId);
      }
    },
    [draggedItem, onItemMove, data]
  );

  const renderTree = useCallback(
    (items: TreeItem[], level: number = 0) => {
      return items.map((item) => (
        <TreeNode
          key={item._id}
          item={item}
          onSelect={onSelect}
          level={level}
          parentExpanded={true}
          selectedItem={selectedItem}
          shouldExpand={item.shouldExpand || false}
          searchQuery={searchQuery}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          draggedItem={draggedItem}
        >
          {item.children && renderTree(item.children, level + 1)}
        </TreeNode>
      ));
    },
    [
      onSelect,
      selectedItem,
      searchQuery,
      handleDragStart,
      handleDragEnd,
      handleDrop,
      draggedItem,
    ]
  );

  return (
    <>
      {/* Hamburger menu for small devices */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-md text-white focus:outline-none"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 lg:w-full bg-gray-900 text-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}
      >
        <div className="flex flex-col h-full">
          <h2 className="p-4 text-lg font-bold text-center">Godowns</h2>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {data.length > 0 ? (
              renderTree(data)
            ) : (
              <div className="p-4 text-center text-gray-400">
                No items found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for small devices when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Tree;
