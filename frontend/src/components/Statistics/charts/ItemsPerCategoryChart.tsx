// src/components/Statistics/charts/ItemsPerCategoryChart.tsx

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ItemsPerCategoryChartProps {
  data: Record<string, number>;
}

const ItemsPerCategoryChart: React.FC<ItemsPerCategoryChartProps> = ({
  data,
}) => {
  const chartData = Object.entries(data).map(([category, count]) => ({
    category,
    count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ItemsPerCategoryChart;
