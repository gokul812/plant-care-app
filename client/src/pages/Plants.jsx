import { useEffect, useState } from "react";
import { socket } from "../socket";

const API_URL = import.meta.env.VITE_API_URL;

export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState("");
  const [waterIn, setWaterIn] = useState("");
  const [loading, setLoading] = useState(true);
  const [editPlant, setEditPlant] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [adding, setAdding] = useState(false);

  // IMAGE STATES
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // SEARCH & SORT
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // FETCH
  const fetchPlants = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API_URL}/api/plants`, {
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

  // SOCKET
  useEffect(() => {
    fetchPlants();

    socket.off("plant_added");
    socket.off("plant_deleted");

    socket.on("plant_added", (newPlant) => {
      setPlants((prev) => {
        const exists = prev.some((p) => p._id === newPlant._id);
        if (exists) return prev;
        return [newPlant, ...prev];
      });
    });

    socket.on("plant_deleted", (id) => {
      setPlants((prev) => prev.filter((p) => p._id !== id));
    });
  }, []);

  // IMAGE UPLOAD
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "image/heic" || file.name.endsWith(".heic")) {
      alert("HEIC not supported. Use JPG/PNG.");
      return;
    }

    setSelectedFile(file);
    setImage(URL.createObjectURL(file));
  };

  // ADD
  const addPlant = async () => {
    if (adding) return;

    if (!name.trim() || !waterIn.trim()) {
      alert("Fill all fields");
      return;
    }

    try {
      setAdding(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("waterIn", waterIn);

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      await fetch(`${API_URL}/api/plants`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setName("");
      setWaterIn("");
      setImage(null);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  // DELETE
  const deletePlant = async (id) => {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/api/plants/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchPlants();
  };

  // UPDATE
  const updatePlant = async () => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", editPlant.name);
    formData.append("waterIn", editPlant.waterIn);

    if (editImage) {
      formData.append("image", editImage);
    }

    const res = await fetch(`${API_URL}/api/plants/${editPlant._id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      setEditPlant(null);
      setEditImage(null);
      fetchPlants();
    }
  };

  // FILTERED & SORTED PLANTS
  const filtered = plants
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "water-asc") return Number(a.waterIn) - Number(b.waterIn);
      if (sortBy === "water-desc") return Number(b.waterIn) - Number(a.waterIn);
      return 0; // "newest" — preserve fetch order
    });

  if (loading) {
    return <div className="text-center mt-10">Loading plants...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto w-full">
      <h2 className="text-2xl font-semibold mb-6">🌱 Your Plants</h2>

      {/* ADD FORM */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-white p-4 rounded-xl shadow w-full">
        <input
          className="border p-2 rounded w-full"
          placeholder="Plant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 rounded w-full"
          placeholder="Water in days"
          type="number"
          min="1"
          value={waterIn}
          onChange={(e) => setWaterIn(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="imageUpload"
        />

        {image && (
          <img
            src={image}
            alt="preview"
            className="w-20 h-20 object-cover rounded"
          />
        )}

        <label htmlFor="imageUpload" className="bg-gray-200 px-3 py-2 rounded cursor-pointer whitespace-nowrap">
          📷 Image
        </label>

        <button onClick={addPlant} disabled={adding} className="bg-green-500 text-white px-4 rounded whitespace-nowrap">
          {adding ? "Adding..." : "Add"}
        </button>
      </div>

      {/* SEARCH & SORT */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="border p-2 rounded w-full bg-white text-gray-800 placeholder-gray-400"
          placeholder="🔍 Search plants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded bg-white text-gray-800 sm:w-48"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Sort: Newest</option>
          <option value="name-asc">Name A → Z</option>
          <option value="name-desc">Name Z → A</option>
          <option value="water-asc">Water: Soonest</option>
          <option value="water-desc">Water: Latest</option>
        </select>
      </div>

      {/* EMPTY STATE */}
      {plants.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🪴</p>
          <p className="text-lg">No plants yet. Add your first plant above!</p>
        </div>
      )}

      {filtered.length === 0 && plants.length > 0 && (
        <div className="text-center py-10 text-gray-400">
          <p>No plants match "{search}"</p>
        </div>
      )}

      {/* LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((plant) => (
          <div key={plant._id} className="bg-white rounded-xl shadow overflow-hidden">
            <div className="h-48 bg-gray-100">
              <img
                src={
                  plant.image && plant.image.startsWith("http")
                    ? plant.image
                    : "/default-plant.jpg"
                }
                alt="plant"
                onError={(e) => (e.target.src = "/default-plant.jpg")}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4">
              <h3 className="font-medium text-gray-800 truncate">{plant.name}</h3>
              <p className={`text-sm mt-1 ${Number(plant.waterIn) <= 1 ? "text-red-500 font-semibold" : "text-gray-500"}`}>
                💧 {Number(plant.waterIn) <= 1 ? "Water today!" : `${plant.waterIn} days`}
              </p>

              <div className="flex justify-between mt-3">
                <button onClick={() => setEditPlant(plant)} className="text-blue-500 text-sm">
                  Edit
                </button>
                <button onClick={() => deletePlant(plant._id)} className="text-red-500 text-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editPlant && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded-xl w-96 shadow-2xl">

            <h3 className="mb-4 font-semibold text-black">Edit Plant</h3>

            <input
              className="border p-2 w-full mb-2 text-black bg-white placeholder-gray-500"
              value={editPlant.name}
              onChange={(e) => setEditPlant({ ...editPlant, name: e.target.value })}
            />

            <input
              className="border p-2 w-full mb-2 text-black bg-white placeholder-gray-500"
              type="number"
              min="1"
              value={editPlant.waterIn}
              onChange={(e) => setEditPlant({ ...editPlant, waterIn: e.target.value })}
            />

            <div className="mt-2">
              <label className="block text-sm font-medium text-black mb-1">
                Change Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditImage(e.target.files[0])}
                className="block w-full text-sm text-black border p-2 rounded bg-white"
              />
            </div>

            {editImage && (
              <img
                src={URL.createObjectURL(editImage)}
                className="w-20 h-20 mt-3 rounded object-cover"
              />
            )}

            <div className="flex justify-between mt-4">
              <button
                onClick={updatePlant}
                className="bg-green-500 text-white px-4 py-1 rounded"
              >
                Save
              </button>

              <button
                onClick={() => setEditPlant(null)}
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
