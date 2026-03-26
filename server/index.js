import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import { Server } from "socket.io";

const app = express();

// Middleware
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

// ================= MODELS =================

// Plant Schema
const plantSchema = new mongoose.Schema({
  name: String,
  waterIn: String,
  userId: String, // for multi-user
});

const Plant = mongoose.model("Plant", plantSchema);

// ================= AUTH =================

// Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashed,
    });

    res.json({ message: "Signup successful" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

    res.json({ token });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= AUTH MIDDLEWARE =================

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

// ================= PLANTS (PROTECTED) =================

// GET plants (user-specific)
app.get("/plants", authMiddleware, async (req, res) => {
  const plants = await Plant.find({ userId: req.user.id });
  res.json(plants);
});

// ADD plant
app.post("/plants", authMiddleware, async (req, res) => {
  const plant = await Plant.create({
    ...req.body,
    userId: req.user.id,
  });
  res.json(plant);
});

// DELETE plant
app.delete("/plants/:id", authMiddleware, async (req, res) => {
  await Plant.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// UPDATE plant
app.put("/plants/:id", authMiddleware, async (req, res) => {
  const updated = await Plant.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// ======== notification =========

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("newPlant", (data) => {
    io.emit("plantAdded", newPlant);
  });
});

// ================= TEST =================

app.get("/", (req, res) => {
  res.send("API is running");
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});