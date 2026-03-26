import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://plant-care-app-zefq.vercel.app"
  ]
}));

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

// DELETE
app.delete("/plants/:id", async (req, res) => {
  await Plant.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// UPDATE
app.put("/plants/:id", async (req, res) => {
  const updated = await Plant.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashed,
  });

  res.json(user);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET
  );

  res.json({ token });
});

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/plants", authMiddleware, async (req, res) => {
  const plants = await Plant.find();
  res.json(plants);
});

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});