import { useEffect, useState } from "react";
import { socket } from "../socket";

const API_URL = import.meta.env.VITE_API_URL;
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    socket.on("plant_added", (plant) => {
      console.log("🔥 RECEIVED:", plant);

      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `🌱 ${plant.name} added`,
        },
        ...prev,
      ]);
    });

    return () => {
      socket.off("plant_added");
    };
  }, []);

    // 🔊 sound
  const playSound = () => {
    const audio = new Audio("/notify.mp3");
    audio.play();
  };

  // 📥 load existing notifications
  const fetchNotifications = async () => {
    const res = await fetch(`${API_URL}/api/notifications`);
    const data = await res.json();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();

    socket.on("notification", (notif) => {
      console.log("🔔 NEW:", notif);

      setNotifications((prev) => {

      if (prev.find((n) => n._id === notif._id)) return prev;
      return [notif, ...prev];
      });
      playSound(); // 🔊 play sound
    });

  socket.off("notification"); // 🔥 important
  socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
    };
  }, []);

  // ✅ mark as read
  const markAsRead = async (id) => {
    await fetch(`${API_URL}/api/notifications/${id}`, {
      method: "PUT",
    });

    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, read: true } : n
      )
    );
  };

  // 🔴 unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

return (
    <div className="relative">
      {/* 🔔 Bell */}
      <button onClick={() => setOpen(!open)} className="text-xl relative">
        🔔

        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-xl p-3 z-50">
          <h4 className="font-semibold mb-2">Notifications</h4>

          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm">No notifications</p>
          ) : (
            <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={`p-2 rounded cursor-pointer ${
                    n.read ? "bg-gray-100" : "bg-green-100"
                  }`}
                >
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}