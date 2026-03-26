import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const data = [
    { name: "Plants", count: 5 },
    { name: "Watered", count: 3 },
  ];

  return (
    <div className="w-full">

      <h2 className="text-xl font-bold mb-6">Dashboard 📊</h2>

      <div className="bg-white p-6 rounded shadow w-full">

        <h3 className="mb-4 font-semibold">Analytics</h3>

        {/* IMPORTANT FIX */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}