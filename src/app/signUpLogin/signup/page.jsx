// app/signUpLogin/signup/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button, Input, Select } from "antd";
import { API_BASE_URL } from "@/app/api/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member"); // default role
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
        const res = await axios.post(`${API_BASE_URL}/api/auth/register`,{
            name,
            email,
            password,
            role,
        });
            if (res.status === 201) {
              alert("Signup successful");
              router.push("/signUpLogin/login");
            }
    } catch (error) {
        alert(`Signup failed: ${error}`);
    }

  };

  return (
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

<Select
      defaultValue="Member"
      // style={{ width: 120 }}
      onChange={(e) => setRole(e)}
      options={[
        { value: 'Member', label: 'Member' },
        { value: 'TeamLeader', label: 'TeamLeader' }
      ]}
    />

      {/* <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Member">Member</option>
        <option value="TeamLeader">TeamLeader</option>
      </select> */}

<Button type="primary" onClick={handleSignup}>Register</Button>


<Button onClick={() => router.push("/signUpLogin/login")}> Already have an account? Login</Button>

    </form>
  );
}
