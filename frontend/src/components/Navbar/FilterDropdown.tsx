// src/components/Navbar/FilterDropdown.tsx

import React from "react";

interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  onChange,
  options,
}) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-300 mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === "All" ? "All" : capitalize(option)}
        </option>
      ))}
    </select>
  </div>
);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default FilterDropdown;
