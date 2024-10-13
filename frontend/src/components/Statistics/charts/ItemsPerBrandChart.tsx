// src/components/Statistics/charts/ItemsPerBrandChart.tsx

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ItemsPerBrandChartProps {
  data: Record<string, number>;
}

const ItemsPerBrandChart: React.FC<ItemsPerBrandChartProps> = ({ data }) => {
  const chartData = Object.entries(data).map(([brand, count]) => ({
    brand,
    count,
  }));

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AA336A",
    "#33AA99",
    "#6699CC",
    "#FF6666",
    "#9966FF",
    "#FFCC33",
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="brand"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          label
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend layout="vertical" verticalAlign="middle" align="right" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ItemsPerBrandChart;
