import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Leaf, Settings } from "lucide-react";
import Notifications from "./Notifications";

export default function Layout() {
  const navigate = useNavigate();

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");

    // optional: disconnect socket
    import("../socket").then(({ socket }) => {
      socket.disconnect();
    });

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
          className="bg-red-500 text-white px-3 py-2 rounded mt-6 hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6">

        {/* TOP BAR */}
        <div className="flex justify-end mb-4">
          <Notifications />
        </div>

        {/* PAGE CONTENT */}
        <Outlet />
      </div>
    </div>
  );
}