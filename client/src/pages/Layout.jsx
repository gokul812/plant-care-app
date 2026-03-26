import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Leaf, Bell } from "lucide-react";
import { useEffect } from "react";

export default function Layout() {
  const navigate = useNavigate();

  // 🔐 Protect routes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-xl font-bold text-green-600 flex items-center gap-2 mb-8">
          <Leaf size={20}/> Plant SaaS
        </h2>

        <nav className="flex flex-col gap-4">

  <NavLink
    to="/"
    className={({ isActive }) =>
      isActive
        ? "text-green-600 font-semibold"
        : "text-gray-500 hover:text-green-600"
    }
  >
    Dashboard
  </NavLink>

  <NavLink
    to="/plants"
    className={({ isActive }) =>
      isActive
        ? "text-green-600 font-semibold"
        : "text-gray-500 hover:text-green-600"
    }
  >
    Plants
  </NavLink>

  <NavLink
    to="/settings"
    className={({ isActive }) =>
      isActive
        ? "text-green-600 font-semibold"
        : "text-gray-500 hover:text-green-600"
    }
  >
    Settings
  </NavLink>

</nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">

        {/* Topbar */}
        <div className="flex justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <div className="flex gap-4 items-center">
            <Bell />
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Dynamic Pages */}
        <Outlet />

      </main>
    </div>
  );
}