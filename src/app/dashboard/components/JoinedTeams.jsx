"use client";
import { useEffect, useState } from "react";
import { Card, List, message, Button, Modal, Input, Avatar, Checkbox, Spin } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/api/api";
import { toast } from "react-toastify";
import { getUserProfileData } from "@/app/UserData/getUserProfileData";

export default function JoinedTeams({triggerForFetchTeams}) {
  const [teams, setTeams] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [nonTeamMembersList, setNonTeamMembersList] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [loading, setLoading] = useState(false);
   const [userProfile, setUserProfile] = useState(null);
  const router = useRouter();

  const [token, setToken] = useState("");
 let tokenLocal = "";
  useEffect(()=>{
    tokenLocal = JSON.parse(window.name)?.token;
    setToken(tokenLocal ?? "");
  },[])

  useEffect(() => {
    fetchTeams();
  }, [token,triggerForFetchTeams]);

  const fetchTeams = async () => {
    if (!token) {
      return;
    }
setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/team/my-teams`, {
        headers: { "x-auth-token": token },
      });
      setTeams(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teams");
    }finally{
      setLoading(false);
    }
  };

  const openAddMemberModal = async (teamId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/team/${teamId}/non-members`, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      setNonTeamMembersList(res.data);
      setSelectedMemberIds([]);
      setSelectedTeamId(teamId);
      setModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load available members");
    }finally{
      setLoading(false);
    }
  };

  const handleMemberCheckbox = (userId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMember = async () => {
    if (!token) return toast.error("Not authenticated");

    if (selectedMemberIds.length === 0) return toast.warning("Select at least one user");
setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/team/${selectedTeamId}/add-members`,
        { memberIds: selectedMemberIds }, // Array of IDs
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );

      toast.success("Members added to team");
      setModalOpen(false);
      setSelectedMemberIds([]);
      fetchTeams();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || "Failed to add members");
    }finally{
      setLoading(false);
    }
  };

    useEffect(()=>{
      if(token){
       getUserProfileData(token).then((userInfo) => {
        if (userInfo) {
          setUserProfile(userInfo);
        } else {
          toast.error("Failed to fetch user profile");
        }
      }
      );
      }
    },[token]);
  console.log(teams);
  

  return (
    <>
    
    <div style={{ marginTop: "2rem" }}>
      <h3>Your Teams</h3>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={teams}
        renderItem={(team) => (
          <List.Item key={team._id}>
            <Card
            onClick={()=> {
                localStorage.setItem("selectedTeamId", team._id);
                router.push("/teamtaskmanagement");
            }}
              title={team.name}
              extra={
                <>
                 {
                  userProfile?.role === "TeamLeader" && (
                    <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering card click
                      openAddMemberModal(team._id);
                    }}
                  >
                  Add Team Member
                </Button>
                  )
                }
                </>
               
                
              }
            >
              <p>
                <strong>Leader:</strong> {team.teamLeader?.name}
              </p>
              <p>
                <strong>Members:</strong>
              </p>
              <ul>
                {team.members.map((member) => (
                  <li key={member._id}>
                    {member.name} ({member.role})
                  </li>
                ))}
              </ul>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="Add Team Members"
        open={modalOpen}
        onOk={handleAddMember}
        onCancel={() => setModalOpen(false)}
        okText="Add Selected"
      >
        <List
          itemLayout="horizontal"
          dataSource={nonTeamMembersList}
          renderItem={(item, index) => (
            <List.Item key={index}>
              <Checkbox
                onChange={() => handleMemberCheckbox(item._id)}
                checked={selectedMemberIds.includes(item._id)}
              />
              <List.Item.Meta
                avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                title={item.name}
                description={item.email}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>

    {loading && (
          <div className="loaderstylingadjustmentclass">
        <Spin size="large" />
        </div>
        )}
    </>
 
  );
}
