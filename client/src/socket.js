import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL;

// ❌ prevent auto connect
export const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

// ✅ CONNECT ONLY IF LOGGED IN
if (localStorage.getItem("token")) {
  socket.connect();
}

// 🔍 DEBUG (optional but useful)
socket.on("connect", () => {
  console.log("✅ Socket connected");
});

socket.on("connect_error", (err) => {
  console.log("❌ Socket error:", err.message);
});