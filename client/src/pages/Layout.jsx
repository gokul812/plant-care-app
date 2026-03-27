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
    <div
  className="flex h-screen relative bg-cover bg-center"
  style={{
    backgroundImage: `url("https://images.unsplash.com/photo-1501004318641-b39e6451bec6")`
  }}
>
  {/* overlay */}
  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

  <div className="flex w-full relative z-10">

      {/* SIDEBAR */}
      <div className="w-64 backdrop-blur-xl bg-white/10 border border-white/20 
                shadow-lg p-5 flex flex-col justify-between text-white">

        <div>
          <h1 className="text-xl font-bold mb-6 text-green-300">
            🌿 Plant Care
          </h1>

          {/* NAVIGATION */}
          <nav className="space-y-3">

            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded ${
                  isActive
                   ? "bg-white/20 text-green-300 font-semibold"
                   : "text-gray-200 hover:bg-white/10"
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
                   ? "bg-white/20 text-green-300 font-semibold"
                   : "text-gray-200 hover:bg-white/10"
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
                     ? "bg-white/20 text-green-300 font-semibold"
                     : "text-gray-200 hover:bg-white/10"
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
          className="bg-red-500/80 backdrop-blur text-white px-3 py-2 rounded mt-6 hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 text-white">

        {/* TOP BAR */}
        <div className="flex justify-end mb-4 backdrop-blur-lg bg-white/10 px-4 py-2 rounded-xl border border-white/20">
          <Notifications />
        </div>

        {/* PAGE CONTENT */}
        <Outlet />
      </div>
    </div>
    </div>
  );
}