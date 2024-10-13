// src/components/SearchInput.tsx

import React from "react";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={handleChange}
        placeholder="Search..."
        className="w-full p-2 pl-10 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {/* You can replace this with a search icon */}
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
          />
        </svg>
      </div>
    </div>
  );
};

export default SearchInput;
