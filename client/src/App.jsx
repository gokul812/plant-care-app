import { useEffect, useState } from "react";
import { Trash2, Plus, Leaf, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function App() {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState("");
  const [waterIn, setWaterIn] = useState("");

  const API = import.meta.env.VITE_API_URL;

  const fetchPlants = async () => {
    const res = await fetch(`${API}/plants`);
    const data = await res.json();
    setPlants(data);
  };

  useEffect(() => {
    fetchPlants();
  }, []);

const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
  }
}, []);


  const addPlant = async () => {
    if (!name || !waterIn) return;

    await fetch(`${API}/plants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, waterIn }),
    });

    setName("");
    setWaterIn("");
    fetchPlants();
  };
  
  fetch(`${API}/plants`, {
  headers: {
    Authorization: localStorage.getItem("token"),
  },
});

  const deletePlant = async (id) => {
    await fetch(`${API}/plants/${id}`, {
      method: "DELETE",
    });
    fetchPlants();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <h2 className="text-xl font-bold text-green-600 flex items-center gap-2">
          <Leaf size={20}/> Plant SaaS
        </h2>

        <nav className="mt-10 space-y-4">
          <p className="text-gray-800 font-medium cursor-pointer">Dashboard</p>
          <p className="text-gray-500 hover:text-green-600 cursor-pointer">Plants</p>
          <p className="text-gray-500 hover:text-green-600 cursor-pointer">Settings</p>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">

        {/* Topbar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <div className="flex items-center gap-4">
            <Bell className="cursor-pointer text-gray-600 hover:text-black"/>
            <div className="w-9 h-9 bg-gray-300 rounded-full"></div>

            <button
  onClick={() => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }}
  className="text-sm bg-red-500 text-white px-3 py-1 rounded"
>
  Logout
</button>
          </div>
        </div>

        {/* Add Plant */}
        <div className="bg-white p-6 rounded-xl shadow mb-8 transition hover:shadow-lg">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus size={18}/> Add New Plant
          </h3>

          <div className="flex gap-3">
            <input
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Plant name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Water in"
              value={waterIn}
              onChange={(e) => setWaterIn(e.target.value)}
            />
            <button
              onClick={addPlant}
              className="bg-green-500 text-white px-4 rounded hover:bg-green-600 flex items-center gap-2"
            >
              <Plus size={16}/> Add
            </button>
          </div>
        </div>

        {/* Plants */}
        {plants.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <Leaf size={40} className="mx-auto mb-3 opacity-50"/>
            <p>No plants yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <div
                key={plant._id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-xl transition"
              >
                <h3 className="text-lg font-semibold">{plant.name}</h3>
                <p className="text-gray-500">💧 {plant.waterIn}</p>

                <button
                  onClick={() => deletePlant(plant._id)}
                  className="mt-4 flex items-center gap-1 text-red-500 hover:text-red-600 text-sm"
                >
                  <Trash2 size={16}/> Delete
                </button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}