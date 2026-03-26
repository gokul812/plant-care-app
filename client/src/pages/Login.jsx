const handleLogin = async () => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  localStorage.setItem("token", data.token);

  // 🔥 IMPORTANT
  import("../socket").then(({ socket }) => {
    socket.connect();
  });

  navigate("/");
};