import { useEffect, useState } from "react";
import { socket } from "../socket";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL;

  // 🔥 FETCH DATA (SAFE + CACHE)
  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API}/api/plants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setPlants(data);

        // ✅ cache
        localStorage.setItem("plants", JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 INITIAL LOAD (USE CACHE FIRST)
  useEffect(() => {
    const cached = localStorage.getItem("plants");

    if (cached) {
      setPlants(JSON.parse(cached));
      setLoading(false);
    }

    fetchPlants();

    // 🔔 SOCKET LIVE UPDATE
    socket.on("plant_added", (newPlant) => {
      setPlants((prev) => [newPlant, ...prev]);
    });

    return () => {
      socket.off("plant_added");
    };
  }, []);

  // 📊 CALCULATIONS
  const totalPlants = plants.length;

  const watered = plants.filter(p => Number(p.waterIn) <= 1).length;

  const needsWater = totalPlants - watered;

  const chartData = [
    { name: "Watered", value: watered },
    { name: "Needs Water", value: needsWater },
  ];

  // ⏳ LOADING UI
  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500 animate-pulse">
        Loading dashboard 📊...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Dashboard 📊</h2>

      {/* 🔥 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-gray-500">Total Plants</h3>
          <p className="text-2xl font-bold">{totalPlants}</p>
        </div>

        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-gray-500">Watered</h3>
          <p className="text-2xl font-bold text-green-500">{watered}</p>
        </div>

        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-gray-500">Needs Water</h3>
          <p className="text-2xl font-bold text-red-500">{needsWater}</p>
        </div>
      </div>

      {/* 📊 CHART */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="mb-4 font-medium">Plant Status</h3>

        {totalPlants === 0 ? (
          <p className="text-gray-400 text-center">
            Add plants to see analytics 🌱
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={chartData}
    margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
  >
    {/* GRID */}
    <CartesianGrid strokeDasharray="3 3" />

    {/* AXIS */}
    <XAxis dataKey="name" />
    <YAxis allowDecimals={false} />

    {/* TOOLTIP */}
    <Tooltip
      contentStyle={{
        backgroundColor: "#fff",
        borderRadius: "10px",
        border: "1px solid #eee",
      }}
    />

    {/* BARS */}
    <Bar
      dataKey="value"
      radius={[10, 10, 0, 0]}
      barSize={60}
    >
      {chartData.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={entry.name === "Watered" ? "#22c55e" : "#ef4444"}
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
        )}
      </div>

      {/* 📌 RECENT ACTIVITY */}
      <div className="bg-white p-4 rounded shadow mt-6">
        <h3 className="mb-2 font-medium">Recent Activity</h3>

        {plants.length === 0 ? (
          <p className="text-gray-400">No plants yet</p>
        ) : (
          <ul className="text-sm text-gray-600">
            {plants.slice(0, 5).map((p) => (
              <li key={p._id}>🌿 Added {p.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}