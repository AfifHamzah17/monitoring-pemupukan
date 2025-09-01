'use client';
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

// ChartArea.tsx
export default function ChartArea({
  chartData,
}: {
  chartData: { cycle: string; value: number }[];
}) {
  return (
    <div className="h-[calc(100vh-200px)] p-4 border rounded">
      <h4 className="font-medium mb-2">Grafik Pemupukan (Cycle)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="cycle" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Kg" fill="#2B6A4A" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}