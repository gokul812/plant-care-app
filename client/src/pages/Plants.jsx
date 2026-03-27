import { useEffect, useState } from "react";
import { socket } from "../socket";
// import defaultPlant from "../assets/default-plant.jpg";

const API_URL = "https://plant-care-app-fyh5.onrender.com/api";

export default function Plants() {
  const [plants, setPlants] = useState([]);
  const [name, setName] = useState("");
  const [waterIn, setWaterIn] = useState("");
  const [loading, setLoading] = useState(true);
  const [editPlant, setEditPlant] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [adding, setAdding] = useState(false);

  // ✅ IMAGE STATES
  const [image, setImage] = useState(null); // preview
  const [selectedFile, setSelectedFile] = useState(null); // actual file

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
  fetchPlants();

  // 🔥 REMOVE OLD LISTENERS FIRST
  socket.off("plant_added");
  socket.off("plant_deleted");

  // 🔥 ADD CLEAN LISTENERS
  socket.on("plant_added", (newPlant) => {
      console.log("PLANT ADDED EVENT"); // 👀 check count
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

  // 📷 IMAGE HANDLER
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

     if (file.type === "image/heic" || file.name.endsWith(".heic")) {
    alert("HEIC format is not fully supported. Please use JPG or PNG.");
    return;
  }

    setSelectedFile(file); // for upload
    setImage(URL.createObjectURL(file)); // preview
  };

  // ➕ ADD PLANT (FIXED)
  const addPlant = async () => {

     if (adding) return; // 🚫 prevent double click

  if (!name.trim() || !waterIn.trim()) {
    alert("Please fill all fields");
    return;
  }

  try {
    setAdding(true); // 🔒 lock button

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("waterIn", waterIn);

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    // ✅ FIX: define res
    const res = await fetch(`${API_URL}/plants`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    // const newPlant = await res.json();


    setName("");
    setWaterIn("");
    setImage(null);
    setSelectedFile(null);

  } catch (err) {
    console.error(err);
  } finally {
    setAdding(false); // 🔓 unlock
  }
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

    fetchPlants();
  };

  // ✏️ UPDATE (UNCHANGED LOGIC)
 const updatePlant = async () => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("name", editPlant.name);
  formData.append("waterIn", editPlant.waterIn);

  // ✅ ONLY ADD IMAGE IF SELECTED
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
    setEditImage(null); // ✅ reset
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
    <div className="max-w-6xl mx-auto w-full">
      <h2 className="text-2xl font-semibold mb-6">🌱 Your Plants</h2>

      {/* ➕ FORM */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-white p-4 rounded-xl shadow w-full">
        <input
          className="border p-2 rounded text-lg text-gray-900 w-full"
          placeholder="Plant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 rounded text-lg text-gray-900 w-full"
          placeholder="Water in days"
          value={waterIn}
          onChange={(e) => setWaterIn(e.target.value)}
        />

        {/* IMAGE INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="opacity-0 absolute w-0 h-0"
          id="imageUpload"
        />

        {/* PREVIEW */}
        {image && (
          <img
            src={image}
            alt="preview"
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}

        <label
          htmlFor="imageUpload"
          className="bg-gray-200 px-3 py-2 rounded cursor-pointer hover:bg-gray-300"
        >
          📷 Image
        </label>

        <button
  onClick={addPlant}
  disabled={adding}
  className={`px-4 rounded ${
    adding
      ? "bg-gray-400 cursor-not-allowed text-white"
      : "bg-green-500 hover:bg-green-600 text-white"
  }`}
>
  {adding ? "Adding..." : "Add"}
</button>
      </div>

      {/* 🌿 LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 w-full">
        {plants.map((plant) => (
          <div
            key={plant._id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
          >
            {/* IMAGE */}
          <div className="w-full h-48 md:h-52 overflow-hidden bg-gray-100 rounded-t-2xl">
 <img
  src={
    plant.image &&
    typeof plant.image === "string" &&
    plant.image.startsWith("http")
      ? plant.image
      : "/default-plant.jpg"
  }
  alt="plant"
  onError={(e) => {
    e.target.src = "/default-plant.jpg";
  }}
  className="w-full h-full object-cover md:object-contain"
/>

</div>

            {/* CONTENT */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900">
                {plant.name}
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                💧 Water in {plant.waterIn} days
              </p>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setEditPlant(plant)}
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
      {editPlant && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-gray-900 shadow w-96">
            <h3 className="mb-4  font-semibold text-gray-900">Edit Plant</h3>

            <input
              className="border p-2 w-full mb-2 text-gray-900 bg-white"
              value={editPlant.name}
              onChange={(e) =>
                setEditPlant({
                  ...editingPlant,
                  name: e.target.value,
                })
              }
            />

            <input
              className="border p-2 w-full mb-4  text-gray-900 bg-white"
              value={editingPlant.waterIn}
              onChange={(e) =>
                setEditPlant({
                  ...editingPlant,
                  waterIn: e.target.value,
                })
              }
            />
            <p className="text-sm text-gray-500 mt-2">Change Image</p>
            <input
  type="file"
  accept="image/*"
  onChange={(e) => setEditImage(e.target.files[0])}
  className="mt-2 w-full"
/>
  <img
    src={URL.createObjectURL(editImage)}
    className="w-20 h-20 object-cover mt-2 rounded"
  />

            <div className="flex justify-between">
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