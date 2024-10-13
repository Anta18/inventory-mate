// src/components/Navbar/RangeInput.tsx

import React from "react";

interface RangeInputProps {
  label: string;
  min: number | "";
  max: number | "";
  onMinChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholderMin: string;
  placeholderMax: string;
}

const RangeInput: React.FC<RangeInputProps> = ({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
  placeholderMin,
  placeholderMax,
}) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-300 mb-1">{label} Range</label>
    <div className="flex space-x-2">
      <input
        type="number"
        value={min}
        onChange={onMinChange}
        placeholder={placeholderMin}
        className="w-1/2 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        min="0"
      />
      <input
        type="number"
        value={max}
        onChange={onMaxChange}
        placeholder={placeholderMax}
        className="w-1/2 px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        min="0"
      />
    </div>
  </div>
);

export default RangeInput;
