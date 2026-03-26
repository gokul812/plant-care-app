import { useEffect, useState } from "react";

function App() {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState("");
  const [waterIn, setWaterIn] = useState("");
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  const fetchPlants = async () => {
    setLoading(true);
    const res = await fetch(`${API}/plants`);
    const data = await res.json();
    setPlants(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const addPlant = async () => {
    if (!name || !waterIn) return;

    await fetch(`${API}/plants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    });
    fetchPlants();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🌱 Plant Care Dashboard</h1>

      {/* Add Form */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Plant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Water in"
          value={waterIn}
          onChange={(e) => setWaterIn(e.target.value)}
        />
        <button onClick={addPlant}>Add</button>
      </div>

      {/* List */}
      {loading ? (
        <p>Loading...</p>
      ) : plants.length === 0 ? (
        <p>No plants found</p>
      ) : (
        plants.map((plant) => (
          <div key={plant._id} style={{ marginBottom: "10px" }}>
            <h3>{plant.name}</h3>
            <p>Water in: {plant.waterIn}</p>
            <button onClick={() => deletePlant(plant._id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

export default App;