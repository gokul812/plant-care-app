import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const data =
      JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(data);
  }, []);

  return (
    <div className="relative">

      <button onClick={() => setOpen(!open)}>
        <Bell />
      </button>

      {notifications.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
          {notifications.length}
        </span>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded p-3 z-50">
          <h4 className="font-semibold mb-2">Notifications</h4>

          {notifications.map((n, i) => (
            <p key={i} className="text-sm text-gray-600 mb-1">
              {n.msg}
            </p>
          ))}

          {notifications.length === 0 && (
            <p className="text-sm text-gray-400">No notifications</p>
          )}
        </div>
      )}

    </div>
  );
}