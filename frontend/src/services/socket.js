import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("⚠️ Socket not initialized: token missing");
    return null;
  }

  socket = io("http://localhost:3000", {
    auth: { token },
    transports: ["websocket"],
  });

  console.log("🟢 Socket initialized with token");

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔴 Socket disconnected");
  }
};
