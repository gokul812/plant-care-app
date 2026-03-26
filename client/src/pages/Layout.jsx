import Notifications from "./Notifications";

export default function Layout({ children }) {
  return (
    <div className="flex">

      {/* Sidebar */}
      <div className="w-64 h-screen bg-white shadow p-4">
        <h2 className="text-green-600 font-bold text-xl mb-6">
          🌿 Plant Care
        </h2>

        <nav className="space-y-3">
          <a href="/" className="block">Dashboard</a>
          <a href="/plants" className="block">Plants</a>
          <a href="/settings" className="block">Settings</a>
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">

        {/* Top bar */}
        <div className="flex justify-end mb-4">
          <Notifications />
        </div>

        {children}
      </div>
    </div>
  );
}