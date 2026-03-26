import { useEffect, useState } from "react";

export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState("");
  const [waterIn, setWaterIn] = useState("");

  const API = import.meta.env.VITE_API_URL;

  const fetchPlants = async () => {
    const res = await fetch(`${API}/plants`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    const data = await res.json();
    if (Array.isArray(data)) setPlants(data);
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const addPlant = async () => {
    await fetch(`${API}/plants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ name, waterIn }),
    });

    setName("");
    setWaterIn("");
    fetchPlants();
  };

  const deletePlant = async (id) => {
    await fetch(`${API}/plants/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    fetchPlants();
  };

  return (
    <div>

      <h2 className="text-lg font-semibold mb-4">🌱 Your Plants</h2>

      <div className="flex gap-2 mb-6">
        <input
          placeholder="Plant name"
          className="border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Water in"
          className="border p-2 rounded"
          value={waterIn}
          onChange={(e) => setWaterIn(e.target.value)}
        />
        <button onClick={addPlant} className="bg-green-500 text-white px-4 rounded">
          Add
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {plants.map((plant) => (
          <div key={plant._id} className="bg-white p-4 rounded shadow">
            <h3>{plant.name}</h3>
            <p>{plant.waterIn}</p>

            <button
              onClick={() => deletePlant(plant._id)}
              className="text-red-500 text-sm mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}