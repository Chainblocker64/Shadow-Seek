import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: falsse,
});
