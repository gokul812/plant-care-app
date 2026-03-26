import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import http from "http";
import { Server } from "socket.io";

import User from "./models/User.js";

const app = express();

// ✅ Create HTTP server (IMPORTANT)
const server = http.createServer(app);

// ================= SOCKET.IO =================

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://plant-care-app-zefq.vercel.app",
    ],
  },
  transports: ["websocket", "polling"], // ✅ FIX for Render
});

// Make io available everywhere
app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ================= MIDDLEWARE =================

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://plant-care-app-zefq.vercel.app",
    ],
  })
);

// ================= DATABASE =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log(err));

// ================= MODELS =================

const plantSchema = new mongoose.Schema({
  name: String,
  waterIn: String,
  userId: String,
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

    if (!isMatch)
      return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

    res.json({ token });
  } catch (err) {
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

// ================= PLANTS =================

// GET plants
app.get("/api/plants", authMiddleware, async (req, res) => {
  const plants = await Plant.find({ userId: req.user.id });
  res.json(plants);
});

// ADD plant
app.post("/api/plants", authMiddleware, async (req, res) => {
  const plant = await Plant.create({
    ...req.body,
    userId: req.user.id,
  });

  // ✅ SOCKET EMIT (PRO WAY)
  const io = req.app.get("io");
  io.emit("plantAdded", plant);

  res.json(plant);
});

// DELETE plant
app.delete("/api/plants/:id", authMiddleware, async (req, res) => {
  await Plant.findByIdAndDelete(req.params.id);

  const io = req.app.get("io");
  io.emit("plantDeleted", req.params.id);

  res.json({ success: true });
});

// UPDATE plant
app.put("/api/plants/:id", authMiddleware, async (req, res) => {
  const updated = await Plant.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});

// ================= TEST =================

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});