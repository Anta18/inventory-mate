// src/components/LoadingSkeleton.tsx

import React from "react";

const LoadingSkeleton: React.FC = () => {
  return (
    <div className=" mt-4 space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex space-x-2">
          <div className="h-4 w-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
