import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Schema
const plantSchema = new mongoose.Schema({
  name: String,
  waterIn: String,
});

const Plant = mongoose.model("Plant", plantSchema);

// ✅ GET all plants
app.get("/plants", async (req, res) => {
  const plants = await Plant.find();
  res.json(plants);
});

// ✅ ADD plant
app.post("/plants", async (req, res) => {
  const plant = await Plant.create(req.body);
  res.json(plant);
});

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});