
import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000");
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