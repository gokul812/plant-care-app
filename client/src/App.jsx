import { useEffect, useState } from "react";
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/plants`)
      .then((res) => res.json())
      .then((data) => setPlants(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Plants 🌱</h1>

      {plants.length === 0 ? (
        <p>No plants found</p>
      ) : (
        plants.map((plant) => (
          <div key={plant._id} style={{ marginBottom: "10px" }}>
            <h3>{plant.name}</h3>
            <p>Water in: {plant.waterIn}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;