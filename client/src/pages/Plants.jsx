import { useEffect, useState } from "react";
import { socket } from "../socket"; // make sure this file exists

const Plants = () => {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState("");
  const [waterIn, setWaterIn] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ Correct API URL (works in production)
  const API_URL = import.meta.env.VITE_API_URL;

  // 🔄 Fetch plants from backend
  const fetchPlants = () => {
    fetch(`${API_URL}/api/plants`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlants(data);
        } else {
          setPlants([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching plants:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlants();

    // 🔔 SOCKET LISTENERS (PRO ARCHITECTURE)
    socket.on("plantAdded", (newPlant) => {
      setPlants((prev) => [newPlant, ...prev]);
    });

    socket.on("plantDeleted", (id) => {
      setPlants((prev) => prev.filter((p) => p._id !== id));
    });

    return () => {
      socket.off("plantAdded");
      socket.off("plantDeleted");
    };
  }, []);

  // ➕ Add Plant
  const addPlant = () => {
    if (!name || !waterIn) {
      alert("Please fill all fields");
      return;
    }

    fetch(`${API_URL}/api/plants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, waterIn }),
    })
      .then((res) => res.json())
      .then(() => {
        setName("");
        setWaterIn("");

        // ❌ No socket.emit here (backend handles it)
      })
      .catch((err) => console.error("Error adding plant:", err));
  };

  // ❌ Delete Plant
  const deletePlant = (id) => {
    fetch(`${API_URL}/api/plants/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch((err) => console.error("Error deleting plant:", err));
  };

  if (loading) {
    return <p className="p-6">Loading plants...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">🌱 Your Plants</h1>

      {/* ➕ ADD PLANT FORM */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Plant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          type="text"
          placeholder="Water in (e.g. 2 days)"
          value={waterIn}
          onChange={(e) => setWaterIn(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <button
          onClick={addPlant}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* 🌿 PLANT LIST */}
      {plants.length === 0 ? (
        <p className="text-gray-500">
          No plants added yet. Start growing 🌱
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plants.map((plant) => (
            <div
              key={plant._id}
              className="bg-white p-4 rounded-2xl shadow"
            >
              <h2 className="font-semibold text-lg">
                {plant.name}
              </h2>

              <p className="text-gray-500">
                💧 {plant.waterIn}
              </p>

              <div className="flex gap-3 mt-3">
                <button className="text-blue-500 text-sm">
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
      )}
    </div>
  );
};

export default Plants;