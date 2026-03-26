import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#ef4444"];

const Dashboard = () => {
  const [plants, setPlants] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/plants", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((plants) => {
        if (!Array.isArray(plants)) {
          setLoading(false);
          return;
        }

        setPlants(plants);

        const total = plants.length;

        const watered = plants.filter(
          (p) => p.watered === true
        ).length;

        setData([
          { name: "Watered", value: watered },
          { name: "Needs Water", value: total - watered },
        ]);

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  const total = plants.length;
  const watered = plants.filter((p) => p.watered).length;
  const needsWater = total - watered;

  // 🧠 Smart Insight
  let insight = "";
  if (total === 0) {
    insight = "Start by adding your first plant 🌱";
  } else if (watered === total) {
    insight = "All plants are well maintained 🌿";
  } else if (watered < total / 2) {
    insight = "Many plants need watering ⚠️";
  } else {
    insight = "You're doing great! Keep it up 💪";
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard 📊</h1>

      {/* ✅ STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-gray-500">Total Plants</h2>
          <p className="text-2xl font-bold">{total}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-gray-500">Watered</h2>
          <p className="text-2xl font-bold text-green-600">
            {watered}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-gray-500">Needs Water</h2>
          <p className="text-2xl font-bold text-red-500">
            {needsWater}
          </p>
        </div>
      </div>

      {/* 📊 PIE CHART */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="mb-4 font-semibold">Plant Status</h2>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🤖 SMART INSIGHT */}
      <div className="bg-green-100 p-4 rounded-xl mb-6">
        <p className="font-medium">{insight}</p>
      </div>

      {/* 🔔 RECENT ACTIVITY */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="font-semibold mb-3">Recent Activity</h2>

        {plants.length === 0 ? (
          <p className="text-gray-500">No plants added yet</p>
        ) : (
          plants.slice(0, 5).map((plant) => (
            <div
              key={plant._id}
              className="flex justify-between py-2 border-b"
            >
              <span>{plant.name}</span>
              <span
                className={`text-sm ${
                  plant.watered
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {plant.watered ? "Watered" : "Pending"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;