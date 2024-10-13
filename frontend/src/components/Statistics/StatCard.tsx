// src/components/Statistics/StatCard.tsx

import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-gray-700 p-4 rounded-lg shadow">
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default StatCard;
