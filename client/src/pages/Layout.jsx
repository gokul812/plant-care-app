import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Leaf, Settings, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import Notifications from "./Notifications";

export default function Layout() {
  const navigate = useNavigate();

  // 🔔 Notification state
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const data =
      JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(data);
  }, []);

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-md p-5 flex flex-col justify-between">

        <div>
          <h1 className="text-xl font-bold mb-6 text-green-600">
            🌿 Plant Care
          </h1>

          {/* NAVIGATION */}
          <nav className="space-y-3">

            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded ${
                  isActive
                    ? "bg-green-100 text-green-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>

            <NavLink
              to="/plants"
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded ${
                  isActive
                    ? "bg-green-100 text-green-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Leaf size={18} />
              Plants
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded ${
                  isActive
                    ? "bg-green-100 text-green-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Settings size={18} />
              Settings
            </NavLink>

          </nav>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-2 rounded mt-6"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6">

        {/* TOP BAR */}
        <div className="flex justify-end mb-4">

          {/* NOTIFICATIONS */}
          <div className="relative">

            <button onClick={() => setOpen(!open)}>
              <Bell />
            </button>

            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                {notifications.length}
              </span>
            )}

            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded p-3 z-50">
                <h4 className="font-semibold mb-2">Notifications</h4>

                {notifications.map((n, i) => (
                  <p key={i} className="text-sm text-gray-600 mb-1">
                    {n.msg}
                  </p>
                ))}

                {notifications.length === 0 && (
                  <p className="text-sm text-gray-400">
                    No notifications
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ROUTES RENDER HERE */}
        <Outlet />
      </div>

    </div>
  );
}