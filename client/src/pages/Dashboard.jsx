import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function Dashboard() {
  const data = JSON.parse(localStorage.getItem("notifications")) || [];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Analytics 📊</h2>

      <BarChart width={400} height={300} data={data}>
        <XAxis dataKey="msg" hide />
        <YAxis />
        <Tooltip />
        <Bar dataKey={() => 1} />
      </BarChart>
    </div>
  );
}