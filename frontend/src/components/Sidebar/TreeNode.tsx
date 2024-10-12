import React, { useState, useEffect, useCallback, memo } from "react";
import { TreeItem } from "../../types";
import { ChevronDown, ChevronRight, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { highlightMatch } from "../../utils/highlightMatch";

interface TreeNodeProps {
  item: TreeItem;
  onSelect: (item: TreeItem) => void;
  level: number;
  parentExpanded: boolean;
  selectedItem: TreeItem | null;
  shouldExpand: boolean;
  searchQuery: string;
  onDragStart: (item: TreeItem) => void;
  onDragEnd: () => void;
  onDrop: (targetItem: TreeItem) => void;
  draggedItem: TreeItem | null;
  children?: React.ReactNode;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  onSelect,
  level,
  selectedItem,
  shouldExpand,
  searchQuery,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedItem,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(shouldExpand);
  const [isHovering, setIsHovering] = useState(false);
  const [expandTimeout, setExpandTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    setIsExpanded(shouldExpand);
  }, [shouldExpand]);

  const hasChildren = item.children && item.children.length > 0;

  const handleClick = useCallback(() => {
    if (item.type === "location") {
      setIsExpanded(!isExpanded);
    } else if (item.type === "item") {
      onSelect(item);
    }
  }, [item, isExpanded, onSelect]);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onDragStart(item);
    },
    [item, onDragStart]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isHovering) {
        setIsHovering(true);
      }
      if (item.type === "location" && !isExpanded) {
        if (expandTimeout) clearTimeout(expandTimeout);
        setExpandTimeout(setTimeout(() => setIsExpanded(true), 1000));
      }
    },
    [isHovering, isExpanded, item.type]
  );

  const handleDragLeave = useCallback(() => {
    setIsHovering(false);
    if (expandTimeout) {
      clearTimeout(expandTimeout);
      setExpandTimeout(null);
    }
  }, [expandTimeout]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsHovering(false);
      if (expandTimeout) {
        clearTimeout(expandTimeout);
        setExpandTimeout(null);
      }
      onDrop(item);
    },
    [item, onDrop, expandTimeout]
  );

  const isSelected = selectedItem?._id === item._id;
  const isDraggable = item.type === "item";
  const isValidDropTarget = draggedItem && draggedItem._id !== item._id;
  const highlightedName = highlightMatch(item.name, searchQuery);

  return (
    <div className="relative">
      <div
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick();
          }
        }}
        className={`flex items-center cursor-pointer p-2 transition-colors duration-200 ${
          isSelected
            ? "bg-gray-800 "
            : item.type === "location"
            ? "hover:bg-gray-700"
            : "hover:bg-gray-800"
        } ${
          isHovering && isValidDropTarget ? "bg-blue-600" : ""
        } rounded relative`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleClick}
        draggable={isDraggable}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {level > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 border-l border-gray-600"
            style={{ left: `${(level - 1) * 20 + 16}px` }}
          ></div>
        )}
        {item.type === "location" ? (
          hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-5 w-5 mr-1 text-gray-400 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-5 w-5 mr-1 text-gray-400 transition-transform duration-200" />
            )
          ) : (
            <span className="h-5 w-5 mr-1" />
          )
        ) : (
          <Box className="h-5 w-5 mr-1 text-blue-400" />
        )}
        <span
          className={`flex-1 ${
            item.type === "item" ? "text-blue-300" : "text-gray-200"
          } font-medium`}
        >
          {highlightedName}
        </span>
      </div>
      {hasChildren && (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="overflow-hidden relative"
            >
              <div
                className="absolute left-0 top-0 bottom-0 border-l border-gray-600"
                style={{ left: `${level * 20 + 16}px` }}
              ></div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default memo(TreeNode);
