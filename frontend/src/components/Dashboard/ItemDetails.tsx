import React from "react";
import { TreeItem } from "../../types";
import { motion, AnimatePresence } from "framer-motion";

interface ItemDetailsProps {
  item: TreeItem | null;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ item }) => {
  if (!item || item.type !== "item" || !item.itemDetails) {
    return (
      <motion.div
        key="empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center h-full text-gray-500"
      >
        Select an item to view details
      </motion.div>
    );
  }

  const {
    name,
    attributes,
    category,
    quantity,
    image_url,
    price,
    status,
    brand,
  } = item.itemDetails;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={item._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-[#030b30] to-black p-4 sm:p-6 md:p-8 rounded-xl shadow-lg w-full h-full overflow-auto custom-scrollbar text-white"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-white"
        >
          {name}
        </motion.h2>
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-6 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex-1 bg-opacity-20 bg-[#1f213f] rounded-lg p-4 sm:p-6"
          >
            <InfoRow label="Category" value={category} />
            <InfoRow label="Quantity" value={quantity.toString()} />
            <InfoRow label="Price" value={formattedPrice} />
            <InfoRow
              label="Status"
              value={
                status === "out_of_stock" ? (
                  <span className="text-red-500 font-semibold">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-green-500 font-semibold">In Stock</span>
                )
              }
            />
            <InfoRow label="Brand" value={brand} />
          </motion.div>
          {image_url && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex-1 flex items-center justify-center"
            >
              <img
                src={image_url}
                alt={name}
                className="w-full max-w-sm min-h-64 max-h-72  bg-[#1f213f] rounded-lg"
              />
            </motion.div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full mt-6 sm:mt-8 flex justify-center"
        >
          <div className="w-full max-w-2xl bg-opacity-20 bg-[#1f213f] p-4 sm:p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 sm:mb-6 text-white text-center">
              Attributes
            </h3>
            {Object.entries(attributes).length > 0 ? (
              <ul className="space-y-3 sm:space-y-4">
                {Object.entries(attributes).map(([key, value], index) => (
                  <motion.li
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    className="text-base sm:text-lg flex flex-wrap sm:flex-nowrap"
                  >
                    <span className="text-white font-bold w-full sm:w-40 mb-1 sm:mb-0">
                      {key}:
                    </span>
                    <span className="text-gray-300 flex-1">
                      {value as React.ReactNode}
                    </span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-base sm:text-lg text-gray-300 text-center">
                No attributes available
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Updated InfoRow component to accept React.ReactNode for value
const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <motion.p
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="text-base sm:text-lg mb-2 sm:mb-4 flex flex-wrap sm:flex-nowrap"
  >
    <span className="text-white font-bold w-full sm:w-40 mb-1 sm:mb-0">
      {label}:
    </span>
    <span className="text-gray-300 flex-1">{value}</span>
  </motion.p>
);

export default ItemDetails;
