"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button, Input, Spin } from "antd";
import { API_BASE_URL } from "@/app/api/api";
import { toast } from "react-toastify";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member");
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (role === "Member") {
      fetchTeamLeaders();
    }
  }, [role]);

  const fetchTeamLeaders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/getAllTeamLeadersForRegistrationMember`);
      setTeamLeaders(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load team leaders");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (role === "Member" && !selectedLeader) {
      return toast.error("Please select a Team Leader");
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
        role,
        teamLeader: role === "Member" ? selectedLeader : null,
      });

      if (res.status === 201) {
        toast.success("Signup successful");
        router.push("/signUpLogin/login");
      }
    } catch (error) {
      console.error(error);
      toast.error(`Signup failed: ${error.response?.data || error.message}`);
    } finally {
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

        {role === "Member" && (
          <select
            value={selectedLeader}
            onChange={(e) => setSelectedLeader(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          >
            <option value="">Select Team Leader</option>
            {teamLeaders.map((leader) => (
              <option key={leader._id} value={leader._id}>
                {leader.name} ({leader.email})
              </option>
            ))}
          </select>
        )}

        <Button type="primary" onClick={handleSignup}>Register</Button>

        <Button onClick={() => router.push("/signUpLogin/login")}>
          Already have an account? Login
        </Button>
      </form>

      {loading && (
        <div className="loaderstylingadjustmentclass">
          <Spin size="large" />
        </div>
      )}
    </>
  );
}
