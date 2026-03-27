import { useEffect, useState } from "react";
import { socket } from "../socket";

const API_URL = "https://plant-care-app-fyh5.onrender.com/api";

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

  // FETCH
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

      await fetch(`${API_URL}/plants`, {
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

    await fetch(`${API_URL}/plants/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchPlants();
  };

  // UPDATE (FIXED IMAGE SUPPORT)
  const updatePlant = async () => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", editPlant.name);
    formData.append("waterIn", editPlant.waterIn);

    if (editImage) {
      formData.append("image", editImage);
    }

    const res = await fetch(`${API_URL}/plants/${editPlant._id}`, {
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

        <label htmlFor="imageUpload" className="bg-gray-200 px-3 py-2 rounded cursor-pointer">
          📷 Image
        </label>

        <button onClick={addPlant} disabled={adding} className="bg-green-500 text-white px-4 rounded">
          {adding ? "Adding..." : "Add"}
        </button>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {plants.map((plant) => (
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
              <h3>{plant.name}</h3>
              <p>💧 {plant.waterIn} days</p>

              <div className="flex justify-between mt-3">
                <button onClick={() => setEditPlant(plant)} className="text-blue-500">
                  Edit
                </button>
                <button onClick={() => deletePlant(plant._id)} className="text-red-500">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editPlant && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="mb-4 font-semibold">Edit Plant</h3>

            <input
              className="border p-2 w-full mb-2"
              value={editPlant.name}
              onChange={(e) =>
                setEditPlant({ ...editPlant, name: e.target.value })
              }
            />

            <input
              className="border p-2 w-full mb-2"
              value={editPlant.waterIn}
              onChange={(e) =>
                setEditPlant({ ...editPlant, waterIn: e.target.value })
              }
            />

            <p className="text-sm mt-2">Change Image</p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditImage(e.target.files[0])}
              className="mt-2 w-full"
            />

            {editImage && (
              <img
                src={URL.createObjectURL(editImage)}
                className="w-20 h-20 mt-2 rounded object-cover"
              />
            )}

            <div className="flex justify-between mt-4">
              <button onClick={updatePlant} className="bg-green-500 text-white px-4 py-1 rounded">
                Save
              </button>

              <button onClick={() => setEditPlant(null)} className="text-red-500">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}