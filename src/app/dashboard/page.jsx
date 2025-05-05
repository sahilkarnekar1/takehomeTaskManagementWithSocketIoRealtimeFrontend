// app/dashboard/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Input, Button, message } from "antd";
import axios from "axios";
import JoinedTeams from "./components/JoinedTeams";
import { API_BASE_URL } from "../api/api";

export default function Dashboard() {
  const router = useRouter();
  const [openCreateTeamModal, setOpenCreateTeamModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const token = JSON.parse(window.name)?.token;

  const handleCreateTeam = async () => {
    if (!token) {
      message.error("You must be logged in");
      return;
    }
  
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/team`,
        { name: teamName }, // this is the body
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token, // remove "Bearer" if your backend expects just the token
          },
        }
      );
  
      if (res.status === 201) {
        alert(`Team "${res.data.name}" created successfully`);
        setOpenCreateTeamModal(false);
        setTeamName("");
      } else {
        message.error(`Error: ${res.statusText}`);
      }
    } catch (err) {
      alert("Something went wrong");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome to Dashboard</h2>
      <Button type="primary" onClick={() => setOpenCreateTeamModal(true)}>
        Create Team
      </Button>

      <Modal
        title="Create New Team"
        open={openCreateTeamModal}
        onCancel={() => setOpenCreateTeamModal(false)}
        onOk={handleCreateTeam}
        okText="Create"
      >
        <Input
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
      </Modal>


      <JoinedTeams/>
    </div>
  );
}
