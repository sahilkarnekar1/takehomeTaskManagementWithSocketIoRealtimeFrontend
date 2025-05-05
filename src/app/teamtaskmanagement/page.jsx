"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Input,
  DatePicker,
  List,
  Avatar,
  Radio,
  Select,
} from "antd";
import axios from "axios";
import TaskList from "../teamtaskmanagement/components/TaskList";
import { clearSocket, getSocket } from "../socketConfig/getSocket";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../api/api";

export default function TeamTaskManagement() {
  const selectedTeamId = localStorage.getItem("selectedTeamId");

  const [modalOpen, setModalOpen] = useState(false);
  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState("");

  useEffect(()=>{
    const tokenFromLocal = localStorage.getItem("token");
    setToken(tokenFromLocal);
  },[])

  useEffect(()=>{
const newSocket = getSocket();
setSocket(newSocket);
return () => {
  clearSocket(); // <-- disconnect and nullify global socket on unmount
};
  },[])

  useEffect(()=>{
    if(socket){
      socket.emit('connectedUserForTeam', token);
    }
  },[socket, token]);

  const handleCreateTask = async () => {
    if (!title || !description || !assignedTo || !dueDate) {
      return toast.error("Please fill all fields.");
    }

    try {
    const res =  await axios.post(
        `${API_BASE_URL}/api/task/createTask`,
        {
          title,
          description,
          assignedTo,
          teamId: selectedTeamId,
          dueDate,
          priority
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );
console.log(res);

      const emitTask = res.data;

      socket.emit('createTask', { assignedTo, task: emitTask });
      toast.success("Task created!");
      setModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data || "Failed to create task");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("");
    setAssignedTo("");
    setAssignedToName("");
    setDueDate(null);
    setSelectedMemberId("");
  };

  const openAssigneeModal = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/team/${selectedTeamId}/getTeamMembers`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      setTeamMembers(res.data);
      setAssigneeModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load team members");
    }
  };

  const confirmAssignee = () => {
    const selected = teamMembers.find((m) => m._id === selectedMemberId);
    if (selected) {
      setAssignedTo(selected._id);
      setAssignedToName(`${selected.name} (${selected.email})`);
      setAssigneeModalOpen(false);
    } else {
      toast.error("Please select a team member.");
    }
  };

  return (
    <div>
      <h1>Team Task Management</h1>
      <p>Selected Team ID: {selectedTeamId}</p>

      <Button type="primary" onClick={() => setModalOpen(true)}>
        Add Task
      </Button>

      {/* Task List Component */}
      <TaskList teamId={selectedTeamId} />

      {/* Create Task Modal */}
      <Modal
        title="Create Task"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleCreateTask}
        okText="Create"
      >
        <Input
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Input.TextArea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginBottom: 10 }}
        />

        <Button
          onClick={openAssigneeModal}
          style={{ width: "100%", marginBottom: 10 }}
        >
          {assignedToName ? `Assigned To: ${assignedToName}` : "Select Assignee"}
        </Button>

        <DatePicker
          style={{ width: "100%" }}
          onChange={(date, dateString) => setDueDate(dateString)}
        />

<Select
      onChange={(value)=> setPriority(value)}
      options={[
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' },
      ]}
    />

      </Modal>

      {/* Assignee Selection Modal */}
      <Modal
        title="Select Team Member"
        open={assigneeModalOpen}
        onCancel={() => setAssigneeModalOpen(false)}
        onOk={confirmAssignee}
        okText="Assign"
      >
        <Radio.Group
          onChange={(e) => setSelectedMemberId(e.target.value)}
          value={selectedMemberId}
          style={{ width: "100%" }}
        >
          <List
            dataSource={teamMembers}
            renderItem={(member, index) => (
              <List.Item key={member._id} style={{ display: "flex", alignItems: "center" }}>
                <Radio value={member._id} style={{ marginRight: 12 }} />
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`}
                    />
                  }
                  title={member.name}
                  description={member.email}
                />
              </List.Item>
            )}
          />
        </Radio.Group>
      </Modal>
    </div>
  );
}
