"use client";

import { useEffect, useState } from "react";
import {
  List,
  Card,
  Tag,
  message,
  Button,
  Modal,
  Input,
  DatePicker,
  Radio,
  Avatar,
  Select,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isBetween from "dayjs/plugin/isBetween";
import { getSocket } from "@/app/socketConfig/getSocket";
import { toast } from "react-toastify";
import { API_BASE_URL } from "@/app/api/api";

dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

export default function TaskList({ teamId }) {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
const [priorityFilter, setPriorityFilter] = useState(null);
const [dueTillDate, setDueTillDate] = useState(null);
const [overdueSinceDate, setOverdueSinceDate] = useState(null);
const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);



  const token = JSON.parse(window.name)?.token;
console.log(token);


  useEffect(()=>{
const newSocket = getSocket();
setSocket(newSocket);
  },[])

  useEffect(()=>{
    if(socket){
      socket.on('taskAssigned', (task) => {
        toast.info(`${task.createdBy.name} Assigned New task  To You !`);
        setTasks((prev) => [...prev, task]);
      });

      socket.on('taskDeleted', ({task, message}) => {
        toast.info(message);
      });

      return () => {
        socket.off('taskAssigned');
      };
    }

  },[socket]);

  const getUserProfile = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/team/getUserFromToken`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setCurrentUserId(res.data._id);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch user profile");
    }
  };
useEffect(()=>{
  getUserProfile();
},[])


console.log(tasks);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/task/getMyTasksInTeam/${teamId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setTasks(res.data);
      setAllTasks(res.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch tasks");
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setStatus(task.status);
    setAssignedTo(task.assignedTo._id);
    setAssignedToName(`${task.assignedTo.name} (${task.assignedTo.email})`);
    setDueDate(task.dueDate);
  };

  const handleUpdateTask = async () => {
    if (!title || !description || !assignedTo || !dueDate) {
      return message.warning("Please fill all fields.");
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/task/updateTask/${editingTask._id}`,
        {
          title,
          description,
          assignedTo,
          teamId,
          status,
          dueDate,
          priority
        },
        {
          headers: { "x-auth-token": token },
        }
      );
      alert("Task updated!");
      setEditingTask(null);
      resetForm();
      fetchTasks();
    } catch (err) {
      console.error(err);
      message.error("Failed to update task");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("");
    setStatus("");
    setAssignedTo("");
    setAssignedToName("");
    setDueDate(null);
    setSelectedMemberId("");
  };

  const openAssigneeModal = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/team/${teamId}/getTeamMembers`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setTeamMembers(res.data);
      setAssigneeModalOpen(true);
    } catch (err) {
      console.error(err);
      message.error("Failed to load team members");
    }
  };

  const confirmAssignee = () => {
    const selected = teamMembers.find((m) => m._id === selectedMemberId);
    if (selected) {
      setAssignedTo(selected._id);
      setAssignedToName(`${selected.name} (${selected.email})`);
      setAssigneeModalOpen(false);
    } else {
      message.warning("Please select a team member.");
    }
  };

  const handleDeleteTask = async (task) => {
    const taskId = task._id;
    try {
      await axios.delete(`${API_BASE_URL}/api/task/deleteTask/${taskId}`, {
        headers: { "x-auth-token": token },
      });
      message.success("Task deleted");
      socket.emit('deleteTask',{token: token, task: task });
      fetchTasks();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete task");
    }
  };

  useEffect(() => {
    if (teamId) fetchTasks();
  }, [teamId]);
  const handleFilterTasksByCreator = () => {
    const filtered = allTasks.filter(task => task.createdBy?._id === currentUserId);
    setTasks(filtered);
  };
  
  const handleFilterTasksByAssignedToMe = () => {
    const filtered = allTasks.filter(task => task.assignedTo?._id === currentUserId);
    setTasks(filtered);
  };
  
  const handleFilterOverdueTasks = () => {
    const now = dayjs(); // current date and time
    const filtered = allTasks.filter(task => dayjs(task.dueDate).isBefore(now) && task.status !== "Completed");
    setTasks(filtered);
  };
  
  const handleSearch = () => {
    const filtered = allTasks.filter(task => {
      const title = task.title.toLowerCase();
      const desc = task.description.toLowerCase();
      const query = searchQuery.toLowerCase();
  
      return title.includes(query) || desc.includes(query);
    });
  
    setTasks(filtered);
  };
  useEffect(()=>{
    if (searchQuery) {
      handleSearch();
    }else{
      fetchTasks();
    }
    
  },[searchQuery])
  
  const applyFilters = () => {
    let filtered = [...allTasks]; // Copy the original tasks list
  
    if (statusFilter) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
  
    if (priorityFilter) {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
  
    if (dueTillDate) {
      filtered = filtered.filter(task => dayjs(task.dueDate).isSameOrBefore(dueTillDate, 'day'));
    }
  
    if (overdueSinceDate) {
      filtered = filtered.filter(task => dayjs(task.dueDate).isBefore(overdueSinceDate, 'day') && task.status !== "Completed");
    }
  
    if (startDate && endDate) {
      filtered = filtered.filter(task => dayjs(task.dueDate).isBetween(startDate, endDate, 'day', '[]'));
    }
  
    setTasks(filtered);
  };
  

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Team Tasks</h2>

      <Input.Search
  placeholder="Search tasks by title or description"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onSearch={handleSearch}
  enterButton
  style={{ marginBottom: 20, width: "25%" }}
/>



      <Button type="primary" onClick={() => handleFilterTasksByCreator()} style={{ marginLeft: 20}}>
        My Created Tasks
      </Button>

      <Button type="primary" onClick={() => handleFilterTasksByAssignedToMe()} style={{ marginLeft: 20}}>
       Assigned To Me By Others
      </Button>

      <Button type="primary" onClick={() => handleFilterOverdueTasks()} style={{ marginLeft: 20}}>
       OverDue Tasks
      </Button>


      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
  {/* Status Filter */}
  <Select
    placeholder="Filter by Status"
    allowClear
    onChange={(value) => setStatusFilter(value)}
    options={[
      { value: 'Pending', label: 'Pending' },
      { value: 'In Progress', label: 'In Progress' },
      { value: 'Completed', label: 'Completed' },
    ]}
    style={{ width: 180 }}
  />

  {/* Priority Filter */}
  <Select
    placeholder="Filter by Priority"
    allowClear
    onChange={(value) => setPriorityFilter(value)}
    options={[
      { value: 'High', label: 'High' },
      { value: 'Medium', label: 'Medium' },
      { value: 'Low', label: 'Low' },
    ]}
    style={{ width: 180 }}
  />

  {/* Due Till Date */}
  <DatePicker
    placeholder="Due till date"
    onChange={(date) => setDueTillDate(date)}
  />

  {/* Overdue Since Date */}
  <DatePicker
    placeholder="Overdue since"
    onChange={(date) => setOverdueSinceDate(date)}
  />

  {/* Date Range Filter */}
  <DatePicker.RangePicker
    placeholder={["Start due date", "End due date"]}
    onChange={(dates) => {
      setStartDate(dates?.[0] || null);
      setEndDate(dates?.[1] || null);
    }}
  />

  <Button type="primary" onClick={applyFilters}>Apply Filters</Button>
</div>


      <Button onClick={() => {
  setStatusFilter(null);
  setPriorityFilter(null);
  setDueTillDate(null);
  setOverdueSinceDate(null);
  setStartDate(null);
  setEndDate(null);
  setSearchQuery(""); // Reset search
  setTasks(allTasks); // Reset tasks to the original list
fetchTasks();
      }}>Clear Filters</Button>


      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={tasks}
        renderItem={(task) => (
          <List.Item key={task._id}>
            <Card
              title={task.title}
              actions={[
                <Button type="link" onClick={() => openEditModal(task)}>
                  Update
                </Button>,
                <Button danger type="link" onClick={() => handleDeleteTask(task)}>
                  Delete
                </Button>,
              ]}
            >
              <p>{task.description}</p>
              <p>
                <strong>Assigned To:</strong>{" "}
                {task.assignedTo?.name || "N/A"}
              </p>
              <p>
                <strong>Due:</strong> {task.dueDate}
              </p>
              <Tag color={task.status === "Completed" ? "green" : "orange"}>
                {task.status}
              </Tag>
              <Tag color={task.priority === "High" ? "red" : "green"}>
                {task.priority}
              </Tag>
            </Card>
          </List.Item>
        )}
      />

      {/* Edit Task Modal */}
      <Modal
        title="Update Task"
        open={!!editingTask}
        onCancel={() => setEditingTask(null)}
        onOk={handleUpdateTask}
        okText="Update"
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
          value={dueDate ? dayjs(dueDate) : null}
          onChange={(date, dateString) => setDueDate(dateString)}
        />

<Select
      defaultValue={status}
      onChange={(value)=> setStatus(value)}
      options={[
        { value: 'Pending', label: 'Pending' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' },
      ]}
    />

<Select
      defaultValue={priority}
      onChange={(value)=> setPriority(value)}
      options={[
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' },
      ]}
    />

      </Modal>

      {/* Assignee Modal */}
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
              <List.Item key={index} style={{ display: "flex", alignItems: "center" }}>
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
