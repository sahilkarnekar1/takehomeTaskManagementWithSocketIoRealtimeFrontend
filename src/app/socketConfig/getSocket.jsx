
import { io } from "socket.io-client";
import { API_BASE_URL } from "../api/api";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(`${API_BASE_URL}`);
  }
  return socket;
};

export const clearSocket = () => {
  if (socket) {
    socket.disconnect();
    socket.emit('menualDisconnect');
    socket = null;
    console.log("🔌 Socket disconnected and cleared.");
  }
};