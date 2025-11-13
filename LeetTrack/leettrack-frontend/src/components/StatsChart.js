//import React from "react";
//import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
//
//export default function StatsChart({ stats }) {
//  if (!stats) return null;
//
//  // Transform data for the chart
//  const chartData = stats.map((s) => ({
//    difficulty: s.difficulty,
//    solved: s.count,
//  }));
//
//  return (
//    <div className="bg-gray-700 p-4 rounded-xl mt-6">
//      <h3 className="text-lg font-semibold mb-3 text-green-400">Problems Solved</h3>
//      <ResponsiveContainer width="100%" height={250}>
//        <BarChart data={chartData}>
//          <XAxis dataKey="difficulty" stroke="#ddd" />
//          <YAxis />
//          <Tooltip />
//          <Bar dataKey="solved" fill="#22c55e" radius={[8, 8, 0, 0]} />
//        </BarChart>
//      </ResponsiveContainer>
//    </div>
//  );
//}
