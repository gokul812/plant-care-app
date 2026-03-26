import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 🔔 Listen for real-time events
    socket.on("plantAdded", (data) => {
      setNotifications((prev) => [
        ...prev,
        {
          msg: `🌱 ${data.name} added (water in ${data.waterIn})`,
        },
      ]);
    });

    return () => {
      socket.off("plantAdded");
    };
  }, []);

  return (
    <div className="relative">
      {/* 🔔 Bell Icon */}
      <button onClick={() => setOpen(!open)}>
        <Bell className="cursor-pointer" />
      </button>

      {/* 🔴 Badge */}
      {notifications.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
          {notifications.length}
        </span>
      )}

      {/* 📥 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded p-3 z-50">
          <h4 className="font-semibold mb-2">Notifications</h4>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400">
              No notifications
            </p>
          ) : (
            notifications.map((n, i) => (
              <div
                key={i}
                className="text-sm text-gray-700 mb-2 border-b pb-1"
              >
                {n.msg}
              </div>
            ))
          )}

          {/* Clear button */}
          {notifications.length > 0 && (
            <button
              onClick={() => setNotifications([])}
              className="text-xs text-red-500 mt-2"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}