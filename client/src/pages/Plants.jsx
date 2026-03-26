import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState("");
  const [waterIn, setWaterIn] = useState("");
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL;

  // 🌿 FETCH PLANTS (SAFE + CACHE)
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

        // ✅ cache for faster reload
        localStorage.setItem("plants", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🌱 INITIAL LOAD (WITH CACHE)
  useEffect(() => {
    const cached = localStorage.getItem("plants");

    if (cached) {
      setPlants(JSON.parse(cached));
      setLoading(false);
    }

    fetchPlants();

    // 🔔 SOCKET LISTENER
    socket.on("plant_added", (newPlant) => {
      setPlants((prev) => [newPlant, ...prev]);
    });

    return () => {
      socket.off("plant_added");
    };
  }, []);

  // ➕ ADD PLANT
  const addPlant = async () => {
    try {
      if (!name || !waterIn) {
        alert("Fill all fields");
        return;
      }

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/plants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, waterIn }),
      });

      const data = await res.json();

      if (res.ok) {
        setPlants((prev) => [data, ...prev]);
        setName("");
        setWaterIn("");

        // 🔔 notify others
        socket.emit("plant_added", data);
      } else {
        alert(data.message || "Error adding plant");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE PLANT
  const deletePlant = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API}/api/plants/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPlants((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ⏳ LOADING UI
  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500 animate-pulse">
        Loading plants 🌿...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">🌱 Your Plants</h2>

      {/* ➕ ADD FORM */}
      <div className="flex gap-2 mb-6">
        <input
          className="border p-2 rounded w-full"
          placeholder="Plant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Water in (days)"
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

      {/* 🌿 PLANTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plants.map((plant) => (
          <div
            key={plant._id}
            className="bg-white p-4 rounded shadow text-center"
          >
            <h3 className="font-semibold text-lg">{plant.name}</h3>
            <p className="text-gray-500">💧 {plant.waterIn} days</p>

            <button
              onClick={() => deletePlant(plant._id)}
              className="text-red-500 mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {plants.length === 0 && (
        <p className="text-center text-gray-400 mt-6">
          No plants yet 🌱
        </p>
      )}
    </div>
  );
}