import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const data =
        JSON.parse(localStorage.getItem("notifications")) || [];
      setNotifications(data);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <Bell />

      {notifications.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
          {notifications.length}
        </span>
      )}
    </div>
  );
}