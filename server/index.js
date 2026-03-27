import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import http from "http";
import { Server } from "socket.io";
import Notification from "./models/Notification.js";
import User from "./models/User.js";
import upload from "./middleware/upload.js";

const app = express();
const server = http.createServer(app);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://plant-care-app-zefq.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔥 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ================= MIDDLEWARE =================
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://plant-care-app-zefq.vercel.app"
     //"https://plant-care-plum-ten.vercel.app",
    ],
    credentials: true,
  })
);

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// ================= MODELS =================
const plantSchema = new mongoose.Schema({
  name: String,
  waterIn: String,
  userId: String,
  image: String,
});

const Plant = mongoose.model("Plant", plantSchema);

// ================= AUTH =================

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({ email, password: hashed });

    res.json({ message: "Signup successful" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= AUTH MIDDLEWARE =================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ================= PLANTS =================

// GET plants
app.get("/api/plants", authMiddleware, async (req, res) => {
  try {
    const plants = await Plant.find({ userId: req.user.id });
    res.json(plants);
  } catch {
    res.status(500).json({ message: "Error fetching plants" });
  }
});

// ADD plant
app.post("/api/plants", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    console.log("FILE:", req.file); // debug
    const plant = await Plant.create({
      userId: req.user.id,
      name: req.body.name,
      waterIn: req.body.waterIn,
     image: req.file
  ? `https://plant-care-app-fyh5.onrender.com/${req.file.path}`
  : null,// ✅ important
    });

    // 🔥 REAL-TIME EMIT
    io.emit("plant_added", plant);

    // 🔔 Notification
    const notification = await Notification.create({
      message: `🌱 ${plant.name} added`,
      read: false,
    });

    io.emit("notification", notification);

    res.json(plant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE plant
app.delete("/api/plants/:id", authMiddleware, async (req, res) => {
  try {
    const plant = await Plant.findByIdAndDelete(req.params.id);

    // 🔥 EMIT DELETE
    io.emit("plant_deleted", req.params.id);

    // 🔔 Notification
    if (plant) {
      const notification = await Notification.create({
        message: `🗑️ ${plant.name} deleted`,
        read: false,
      });

      io.emit("notification", notification);
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Error deleting plant" });
  }
});

// UPDATE plant
app.put("/api/plants/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const updateData = {
        ...req.body,
      };

      if (req.file) {
        updateData.image = req.file.path;
      }
    const updated = await Plant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Error updating plant" });
  }
});

// ================= NOTIFICATIONS =================

// GET notifications
app.get("/api/notifications", async (req, res) => {
  try {
    const data = await Notification.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// mark as read
app.put("/api/notifications/:id", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      read: true,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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