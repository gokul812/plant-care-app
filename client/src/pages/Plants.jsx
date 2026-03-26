import { useEffect, useState } from "react";
import { socket } from "../socket";

const API_URL = "https://plant-care-app-fyh5.onrender.com/api";

export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState("");
  const [waterIn, setWaterIn] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingPlant, setEditingPlant] = useState(null);

  // 🌿 FETCH PLANTS
  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API_URL}/plants`, {
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
        localStorage.setItem("plants", JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔌 SOCKET + INITIAL LOAD
  useEffect(() => {
    const cached = localStorage.getItem("plants");

    if (cached) {
      setPlants(JSON.parse(cached));
      setLoading(false);
    }

    fetchPlants();

    // ✅ FIX: no duplicate add
    socket.on("plant_added", () => {
      fetchPlants();
    });

    socket.on("plant_deleted", () => {
      fetchPlants();
    });

    return () => {
      socket.off("plant_added");
      socket.off("plant_deleted");
    };
  }, []);

  // ➕ ADD PLANT
  const addPlant = async () => {
    if (!name || !waterIn) return;

    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/plants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        waterInDays: waterIn, // ✅ FIX
      }),
    });

    setName("");
    setWaterIn("");

    fetchPlants(); // ✅ refresh
  };

  // ❌ DELETE
  const deletePlant = async (id) => {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/plants/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchPlants(); // ✅ refresh
  };

  // ✏️ UPDATE
  const updatePlant = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/plants/${editingPlant._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editingPlant.name,
        waterInDays: editingPlant.waterIn, // ✅ FIX
      }),
    });

    if (res.ok) {
      setEditingPlant(null);
      fetchPlants();
    }
  };

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500 animate-pulse">
        Loading plants 🌿...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">🌱 Your Plants</h2>

      {/* ➕ FORM */}
      <div className="flex gap-3 mb-6 bg-white p-4 rounded-xl shadow">
        <input
          className="border p-2 rounded w-full"
          placeholder="Plant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 rounded w-full"
          placeholder="Water in days"
          value={waterIn}
          onChange={(e) => setWaterIn(e.target.value)}
        />

        <button
          onClick={addPlant}
          className="bg-green-500 text-white px-4 rounded hover:bg-green-600"
        >
          Add
        </button>
      </div>

      {/* 🌿 LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plants.map((plant) => (
          <div
            key={plant._id}
            className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-lg">{plant.name}</h3>

            <p className="text-gray-500 mb-3">
              💧 {plant.waterInDays} days
            </p>

            <div className="flex justify-between">
              <button
                onClick={() => setEditingPlant(plant)}
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

      {/* EMPTY */}
      {plants.length === 0 && (
        <div className="text-center mt-10 text-gray-400">
          🌱 No plants yet
        </div>
      )}

      {/* ✏️ EDIT MODAL */}
      {editingPlant && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow w-80">
            <h3 className="mb-4 font-semibold">Edit Plant</h3>

            <input
              className="border p-2 w-full mb-2"
              value={editingPlant.name}
              onChange={(e) =>
                setEditingPlant({
                  ...editingPlant,
                  name: e.target.value,
                })
              }
            />

            <input
              className="border p-2 w-full mb-4"
              value={editingPlant.waterIn}
              onChange={(e) =>
                setEditingPlant({
                  ...editingPlant,
                  waterIn: e.target.value,
                })
              }
            />

            <div className="flex justify-between">
              <button
                onClick={updatePlant}
                className="bg-green-500 text-white px-4 py-1 rounded"
              >
                Save
              </button>

              <button
                onClick={() => setEditingPlant(null)}
                className="text-red-500"
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