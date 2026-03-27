import { useEffect, useState } from "react";
import { socket } from "../socket";

const API_URL = import.meta.env.VITE_API_URL;
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

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
  const handleNotification = (notif) => {
    console.log("🔔 NEW:", notif);

    setNotifications((prev) => {
      if (prev.find((n) => n._id === notif._id)) return prev;
      return [notif, ...prev];
    });
    // 🔔 ADD TOAST
  const toast = {
    id: Date.now(),
    message: notif.message || notif.text || "New notification",
  };

  setToasts((prev) => [toast, ...prev]);

  // ⏱ AUTO REMOVE (3 sec)
  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
  }, 3000);


    const audio = new Audio("/notify.mp3");
    audio.play();
  };

  socket.off("notification"); // clear old
  socket.on("notification", handleNotification);

  return () => {
    socket.off("notification", handleNotification);
  };
}, []);

  // ✅ mark as read
 const markAsRead = async (id) => {
  if (!id) return; // ✅ ADD THIS LINE

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

const Toasts = () => (
  <div className="fixed top-5 right-5 z-[99999] space-y-3">
    {toasts.map((t) => (
      <div
        key={t.id}
        className="bg-white text-gray-900 px-4 py-3 rounded-lg shadow-lg border animate-slideIn"
      >
        {t.message}
      </div>
    ))}
  </div>
);

return (
    <div className="relative">
      <Toasts />
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
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-xl p-4 z-[99999] text-gray-900 border animate-dropdown">
          <h4 className="font-semibold text-lg text-gray-900 mb-2">Notifications</h4>

          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm">No notifications</p>
          ) : (
            <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <li
 key={n._id || n.id}
    onClick={() => markAsRead(n._id)}
  className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition ${
    n.read ? "bg-gray-100" : "bg-green-100"
  }`}
>
  <span>{n.message || n.text}</span>

  {!n.read && (
    <span className="text-xs text-green-700 font-semibold">
      NEW
    </span>
  )}
</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}