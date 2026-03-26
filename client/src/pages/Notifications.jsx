import { useEffect, useState } from "react";
import { socket } from "../socket";

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

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="text-xl">
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-xl p-3">
          <h4 className="font-semibold mb-2">Notifications</h4>

          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm">No notifications</p>
          ) : (
            notifications.map((n) => (
              <p key={n.id} className="bg-gray-100 p-2 rounded mb-1">
                {n.message}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
}