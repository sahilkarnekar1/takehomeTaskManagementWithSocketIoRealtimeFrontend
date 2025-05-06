// app/dashboard/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Input, Button, message, Spin } from "antd";
import axios from "axios";
import JoinedTeams from "./components/JoinedTeams";
import { API_BASE_URL } from "../api/api";
import { toast } from "react-toastify";

export default function Dashboard() {
  const router = useRouter();
  const [openCreateTeamModal, setOpenCreateTeamModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [trigger, setTrigger] = useState(false);
   const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
 let tokenLocal = "";
  useEffect(()=>{
    tokenLocal = JSON.parse(window.name)?.token;
    setToken(tokenLocal ?? "");
  },[])

  const handleCreateTeam = async () => {
    if (!token) {
      toast.error("You must be logged in");
      return;
    }
    setLoading(true);
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
        toast.success(`Team "${res.data.name}" created successfully`);
        setOpenCreateTeamModal(false);
        setTeamName("");
        setTrigger((prev) => !prev); // Trigger re-fetch of teams
      } else {
        message.error(`Error: ${res.statusText}`);
      }
    } catch (err) {
      alert("Something went wrong");
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  return (
    <>
    
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


      <JoinedTeams triggerForFetchTeams = {trigger}/>
    </div>

    {loading && (
             <div className="loaderstylingadjustmentclass">
           <Spin size="large" />
           </div>
           )}
    </>
   
  );
}
