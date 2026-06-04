import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Using 3000 as it's the backend port

export default socket;
