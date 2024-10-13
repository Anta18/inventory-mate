// src/components/Statistics/charts/StockStatusChart.tsx

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StockStatusChartProps {
  inStock: number;
  outOfStock: number;
}

const StockStatusChart: React.FC<StockStatusChartProps> = ({
  inStock,
  outOfStock,
}) => {
  const data = [
    { name: "In Stock", value: inStock },
    { name: "Out of Stock", value: outOfStock },
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StockStatusChart;
