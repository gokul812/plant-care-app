import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  // 🔔 listen to socket
  useEffect(() => {
  socket.on("connect", () => {
    console.log("✅ Socket connected");
  });

  socket.on("plant_added", (plant) => {
    console.log("🔥 RECEIVED:", plant);

    const newNotif = {
      id: Date.now(),
      message: `🌱 New plant added: ${plant.name}`,
    };

    setNotifications((prev) => [newNotif, ...prev]);
  });

  return () => socket.off("plant_added");
}, []);

  return (
    <div className="relative">
      {/* 🔔 BELL */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-xl"
      >
        🔔

        {/* 🔴 BADGE */}
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* 📦 DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-xl p-3 z-50">
          <h4 className="font-semibold mb-2">Notifications</h4>

          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm">No notifications</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="bg-gray-100 p-2 rounded"
                >
                  {n.message}
                </li>
              ))}
            </ul>
          )}

          {/* CLEAR */}
          {notifications.length > 0 && (
            <button
              onClick={() => setNotifications([])}
              className="text-xs text-blue-500 mt-2"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}