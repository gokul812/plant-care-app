import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;



  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (data.token) {
  localStorage.setItem("token", data.token);

  // ✅ Force reload to ensure token is ready everywhere
  window.location.href = "/";
}
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-80">
        <h2 className="text-xl font-bold mb-6 text-center">Login</h2>

        <input
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600"
        >
          Login
        </button>

        <p className="text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-green-600 font-medium">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}