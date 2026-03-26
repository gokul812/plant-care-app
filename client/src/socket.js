import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL;

export const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket", "polling"], // 🔥 IMPORTANT FIX
  withCredentials: true,
});

// connect only if logged in
if (localStorage.getItem("token")) {
  socket.connect();
}

// debug
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("❌ Socket error:", err.message);
});