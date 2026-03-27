import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Leaf, Settings } from "lucide-react";
import Notifications from "./Notifications";
import { useState } from "react";

export default function Layout() {
  const navigate = useNavigate();
  const [openSidebar, setOpenSidebar] = useState(false);
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
    className="flex h-screen w-full relative bg-cover bg-center"
    style={{
      backgroundImage: `url("https://images.unsplash.com/photo-1501004318641-b39e6451bec6")`
    }}
  >
    {/* overlay */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

    <div className="flex w-full h-full relative z-10">

      {/* SIDEBAR (Desktop only) */}
      <div className="hidden md:flex md:w-64 backdrop-blur-xl bg-white/10 border border-white/20 
                      shadow-lg p-5 flex-col justify-between text-white">

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
      <div className="flex-1 flex flex-col">

        {/* MOBILE HEADER */}
        <div className="md:hidden flex justify-between items-center p-4 text-white backdrop-blur-lg bg-white/10 border-b border-white/20">

  <button onClick={() => setOpenSidebar(true)} className="text-2xl">
    ☰
  </button>

  <h1 className="text-lg font-bold">🌿 Plant Care</h1>

</div>
{openSidebar && (
  <div className="fixed inset-0 z-[9999] flex">

    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/50"
      onClick={() => setOpenSidebar(false)}
    ></div>

    {/* Sidebar */}
    <div className="relative w-64 bg-white text-gray-900 p-5 shadow-lg">

      <h1 className="text-xl font-bold mb-6 text-green-600">
        🌿 Plant Care
      </h1>

      <nav className="flex flex-col space-y-3">

        <NavLink
  to="/"
  onClick={() => setOpenSidebar(false)}
  className={({ isActive }) =>
  `block p-3 rounded-lg ${
    isActive
      ? "bg-green-100 text-green-700 font-semibold"
      : "hover:bg-gray-100"
  }`
}
>
  Dashboard
</NavLink>

<NavLink
  to="/plants"
  onClick={() => setOpenSidebar(false)}
  className={({ isActive }) =>
  `block p-3 rounded-lg ${
    isActive
      ? "bg-green-100 text-green-700 font-semibold"
      : "hover:bg-gray-100"
  }`
}
>
  Plants
</NavLink>

<NavLink
  to="/settings"
  onClick={() => setOpenSidebar(false)}
  className={({ isActive }) =>
  `block p-3 rounded-lg ${
    isActive
      ? "bg-green-100 text-green-700 font-semibold"
      : "hover:bg-gray-100"
  }`
}
>
  Settings
</NavLink>

      </nav>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 text-white px-3 py-2 rounded w-full"
      >
        Logout
      </button>
    </div>
  </div>
)}


        {/* CONTENT AREA */}
        <div className="flex-1 p-4 md:p-6 text-white overflow-y-auto">

          {/* TOP BAR */}
          <div className="flex justify-end mb-4 backdrop-blur-lg bg-white/10 px-4 py-2 rounded-xl border border-white/20 relative z-50">
            <Notifications />
          </div>

          {/* PAGE CONTENT */}
          <div className="w-full">
            <Outlet />
          </div>

        </div>
      </div>

    </div>
  </div>
);

}