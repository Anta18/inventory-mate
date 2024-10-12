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
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Tree: React.FC<TreeProps> = ({
  data,
  onSelect,
  selectedItem,
  searchQuery,
  onItemMove,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
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
    <div
      className={`bg-gray-900 text-white h-full w-full ${
        isSidebarOpen ? "block" : "hidden"
      } lg:block`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold lg:pl-4 md:pl-4">Godowns</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white focus:outline-none lg:hidden md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {data.length > 0 ? (
            renderTree(data)
          ) : (
            <div className="p-4 text-center text-gray-400">No items found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tree;
