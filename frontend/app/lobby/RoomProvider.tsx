"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Room } from "./types";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";

const RoomsContext = createContext<Room[] | undefined>(undefined);
const JoinedRoomContext = createContext<Room | undefined>(undefined);
const LeaveRoomContext = createContext<() => void>(() => {});

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [joinedRoom, setJoinedRoom] = useState<Room | undefined>(undefined);
  const roomId = joinedRoom?.id;

  useEffect(() => {
    socket.connect();

    const onRoomSync = (rooms: Room[]) => setRooms(rooms);
    const onRoomUpdated = (room: Room) => setJoinedRoom(room);
    const onRoomJoinFailed = () => setJoinedRoom(undefined);
    const onRoomLeft = () => {
      router.push("/lobby");
      setJoinedRoom(undefined);
    };

    socket.on("room:sync", onRoomSync);
    socket.on("room:updated", onRoomUpdated);
    socket.on("room:join:failed", onRoomJoinFailed);
    socket.on("room:left", onRoomLeft);

    return () => {
      socket.off("room:sync", onRoomSync);
      socket.off("room:updated", onRoomUpdated);
      socket.off("room:join:failed", onRoomJoinFailed);
      socket.off("room:left", onRoomLeft);
      socket.disconnect();
    };
  }, [router]);

  useEffect(() => {
    //Redirect to room page when the id of joinedRoom changes (e.g. by having successfully created a room)
    if (roomId) {
      router.push(`/lobby/${roomId}`);
    }
  }, [roomId, router]);

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoinedRoom(undefined);
    router.push("/lobby");
  };

  return (
    <RoomsContext.Provider value={rooms}>
      <JoinedRoomContext.Provider value={joinedRoom}>
        <LeaveRoomContext.Provider value={leaveRoom}>
          {children}
        </LeaveRoomContext.Provider>
      </JoinedRoomContext.Provider>
    </RoomsContext.Provider>
  );
}

export function useRooms() {
  const context = useContext(RoomsContext);
  return context;
}

export function useJoinedRoom() {
  const context = useContext(JoinedRoomContext);
  return context;
}

export function useLeaveRoom() {
  const context = useContext(LeaveRoomContext);
  return context;
}
