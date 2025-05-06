// app/signUpLogin/signup/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button, Input, Select, Spin } from "antd";
import { API_BASE_URL } from "@/app/api/api";
import { toast } from "react-toastify";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member"); // default role
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
setLoading(true);
    try {
        const res = await axios.post(`${API_BASE_URL}/api/auth/register`,{
            name,
            email,
            password,
            role,
        });
            if (res.status === 201) {
              toast.success("Signup successful");
              router.push("/signUpLogin/login");
            }
    } catch (error) {
        toast.error(`Signup failed: ${error}`);
    }finally{
        setLoading(false);
    }

  };

  return (
    <>
    <form style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px", margin: "auto" }}>
      <h2>Signup</h2>

      <Input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

<select
  value={role}
  onChange={(e) => setRole(e.target.value)}
  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
>
  <option value="Member">Member</option>
  <option value="TeamLeader">TeamLeader</option>
</select>

      {/* <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Member">Member</option>
        <option value="TeamLeader">TeamLeader</option>
      </select> */}

<Button type="primary" onClick={handleSignup}>Register</Button>

<Button onClick={() => router.push("/signUpLogin/login")}> Already have an account? Login</Button>

    </form>

    {loading && (
          <div className="loaderstylingadjustmentclass">
        <Spin size="large" />
        </div>
        )}
    </>
    
  );
}
