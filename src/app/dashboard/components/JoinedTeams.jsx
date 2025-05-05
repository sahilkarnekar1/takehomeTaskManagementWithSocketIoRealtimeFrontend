"use client";
import { useEffect, useState } from "react";
import { Card, List, message, Button, Modal, Input, Avatar, Checkbox } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/api/api";

export default function JoinedTeams() {
  const [teams, setTeams] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [nonTeamMembersList, setNonTeamMembersList] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const router = useRouter();

  const token = JSON.parse(window.name)?.token;

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    if (!token) {
      message.error("You must be logged in to view your teams");
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/team/my-teams`, {
        headers: { "x-auth-token": token },
      });
      setTeams(res.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch teams");
    }
  };

  const openAddMemberModal = async (teamId) => {
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
      message.error("Failed to load available members");
    }
  };

  const handleMemberCheckbox = (userId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMember = async () => {
    if (!token) return message.error("Not authenticated");

    if (selectedMemberIds.length === 0) return message.warning("Select at least one user");

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

      alert("Members added to team");
      setModalOpen(false);
      setSelectedMemberIds([]);
      fetchTeams();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data || "Failed to add members");
    }
  };

  console.log(teams);
  

  return (
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
                <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering card click
                      openAddMemberModal(team._id);
                    }}
                  >
                  Add Team Member
                </Button>
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
  );
}
