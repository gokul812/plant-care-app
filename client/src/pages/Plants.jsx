import { useEffect, useState } from "react";
import { io } from "socket.io-client";


export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState("");
  const [waterIn, setWaterIn] = useState("");

  // ✏️ Edit states
  const [editingPlant, setEditingPlant] = useState(null);
  const [editName, setEditName] = useState("");
  const [editWater, setEditWater] = useState("");
  const socket = io(import.meta.env.VITE_API_URL);

  const API = import.meta.env.VITE_API_URL;

  // 🌱 Fetch plants
  const fetchPlants = async () => {
    try {
      const res = await fetch(`${API}/plants`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setPlants(data);
      } else {
        console.log("Error:", data);
        setPlants([]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  // 🔔 Generate notifications
  useEffect(() => {
    const reminders = plants.map((p) => ({
      msg: `💧 Water ${p.name} in ${p.waterIn}`,
    }));

    localStorage.setItem("notifications", JSON.stringify(reminders));
  }, [plants]);

  // ➕ Add plant

const addPlant = async () => {
  if (!name) return;

  const smartWater = getSmartWatering(name);

  await fetch(`${API}/plants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
    body: JSON.stringify({
      name,
      waterIn: smartWater,
    }),
  });
  socket.emit("newPlant", { name, waterIn });
  setName("");
  fetchPlants();
};
  

  // ❌ Delete plant
  const deletePlant = async (id) => {
    await fetch(`${API}/plants/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    fetchPlants();
  };

  // ✏️ Open edit modal
  const openEdit = (plant) => {
    setEditingPlant(plant);
    setEditName(plant.name);
    setEditWater(plant.waterIn);
  };

  // ✏️ Update plant
  const updatePlant = async () => {
    await fetch(`${API}/plants/${editingPlant._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        name: editName,
        waterIn: editWater,
      }),
    });

    setEditingPlant(null);
    fetchPlants();
  };

  const getSmartWatering = (name) => {
  if (name.toLowerCase().includes("cactus")) return "7 days";
  if (name.toLowerCase().includes("rose")) return "2 days";
  if (name.toLowerCase().includes("fern")) return "1 day";

  return "3 days"; // default AI logic
};

  return (
    <div>

      <h2 className="text-lg font-semibold mb-4">🌱 Your Plants</h2>

      {/* Add Plant */}
      <div className="flex gap-2 mb-6">
        <input
          placeholder="Plant name"
          className="border p-2 rounded w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Water in"
          className="border p-2 rounded w-full"
          value={waterIn}
          onChange={(e) => setWaterIn(e.target.value)}
        />

        <button
          onClick={addPlant}
          className="bg-green-500 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* Plant List */}
      <div className="grid md:grid-cols-3 gap-4">
        {plants.map((plant) => (
          <div key={plant._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{plant.name}</h3>
            <p className="text-gray-500">💧 {plant.waterIn}</p>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => openEdit(plant)}
                className="text-blue-500 text-sm"
              >
                Edit
              </button>

              <button
                onClick={() => deletePlant(plant._id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✏️ Edit Modal */}
      {editingPlant && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-80">
            <h3 className="font-bold mb-4">Edit Plant</h3>

            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border p-2 w-full mb-3"
            />

            <input
              value={editWater}
              onChange={(e) => setEditWater(e.target.value)}
              className="border p-2 w-full mb-4"
            />

            <div className="flex justify-between">
              <button
                onClick={updatePlant}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>

              <button
                onClick={() => setEditingPlant(null)}
                className="text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}