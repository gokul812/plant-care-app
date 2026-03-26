import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState("");
  const [days, setDays] = useState("");

  const token = localStorage.getItem("token");

  const fetchPlants = async () => {
    const res = await fetch(`${API_URL}/api/plants`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setPlants(data);
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const addPlant = async () => {
    const res = await fetch(`${API_URL}/api/plants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        waterIn: days,
      }),
    });

    const data = await res.json();

    setPlants((prev) => [...prev, data]);
    setName("");
    setDays("");
  };

  const deletePlant = async (id) => {
    await fetch(`${API_URL}/api/plants/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setPlants(plants.filter((p) => p._id !== id));
  };

  return (
    <div>
      <h2 className="text-xl mb-4">🌱 Your Plants</h2>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2"
          placeholder="Plant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Days"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />

        <button
          onClick={addPlant}
          className="bg-green-500 text-white px-4"
        >
          Add
        </button>
      </div>

      {plants.map((p) => (
        <div key={p._id} className="border p-3 mb-2 rounded">
          <h3>{p.name}</h3>
          <p>{p.waterIn} days</p>
          <button
            onClick={() => deletePlant(p._id)}
            className="text-red-500"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}