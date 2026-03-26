import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {

  const data = [
    { name: "Plants", count: 5 },
    { name: "Watered", count: 3 },
  ];

  return (
    <div>

      <h2 className="text-xl font-bold mb-6">Dashboard 📊</h2>

      <div className="bg-white p-4 rounded shadow">

        <h3 className="mb-4 font-semibold">Analytics</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}