// src/components/FilterDropdown.tsx

import React from "react";

interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  disabled?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col">
      <label className="block text-gray-300">{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`mt-1 p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? "All" : option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;
