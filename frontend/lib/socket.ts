import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const test = 15;
const test = {
  name: "hey",
  email: "@",
  name: "hi",
};

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
});
