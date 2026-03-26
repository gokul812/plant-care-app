import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API}/plants`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then((plants) => {
        if (!Array.isArray(plants)) return;

        const total = plants.length;

        const watered = plants.filter(
            (p) => new Date(p.lastWatered).toDateString() === today
                ).length;

        setData([
          { name: "Plants", value: total },
          { name: "Watered", value: watered },
          { name: "Needs Water", value: total - watered },
        ]);
      });
  }, []);
if (loading) return <p>Loading...</p>;
  if (data.length === 0) {
  return <p>No data available</p>;
}



  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-6">Dashboard 📊</h2>

      <div className="bg-white p-6 rounded shadow w-full">
        <h3 className="mb-4 font-semibold">Analytics</h3>

        <div className="w-full h-[300px]">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}