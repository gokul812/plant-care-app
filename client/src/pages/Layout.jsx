import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Leaf, Settings } from "lucide-react";
import Notifications from "./Notifications";
import { useState, useEffect } from "react";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-5">

        <h1 className="text-xl font-bold mb-6 text-green-600">
          🌿 Plant Care
        </h1>

        <div className="flex justify-end gap-4 mb-4">
  <Notifications />

  <button className="bg-red-500 text-white px-3 py-1 rounded">
    Logout
  </button>
</div>

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

      {/* Content */}
      <div className="flex-1 p-6">
    <Outlet />
    </div>
</div>
  );
}