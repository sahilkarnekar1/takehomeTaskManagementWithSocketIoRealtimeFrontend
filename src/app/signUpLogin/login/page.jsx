// app/login/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/api/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    if (res.status === 200) {
      alert("Login successful");
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    }
} catch (error) {
    alert(error)
}
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Login</button>

      {/* Route to login page on button click */}
      <button type="button" onClick={() => router.push("/signUpLogin/signup")}>
        Don't have an account? Register
      </button>
    </form>
  );
}
