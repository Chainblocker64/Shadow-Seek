"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Room } from "./types";
import { socket } from "@/lib/socket";
import { usePathname, useRouter } from "next/navigation";

const RoomsContext = createContext<Room[] | undefined>(undefined);
const JoinedRoomContext = createContext<Room | undefined>(undefined);
const LeaveRoomContext = createContext<() => void>(() => {});
const LeaveRoomForNavigationContext = createContext<() => void>(() => {});

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [joinedRoom, setJoinedRoom] = useState<Room | undefined>(undefined);
  const [isInGame, setIsInGame] = useState(false);
  const roomId = joinedRoom?.id;

  // Set right before a header nav link leaves the room as a side effect of
  // navigating elsewhere, so the room:left confirmation below doesn't bounce
  // that navigation back to /lobby.
  const skipNextLeaveRedirect = useRef(false);

  useEffect(() => {
    socket.connect();

    const onRoomSync = (rooms: Room[]) => setRooms(rooms);
    const onRoomUpdated = (room: Room) => setJoinedRoom(room);
    const onRoomJoinFailed = () => setJoinedRoom(undefined);
    const onRoomLeft = () => {
      if (skipNextLeaveRedirect.current) {
        skipNextLeaveRedirect.current = false;
      } else {
        router.push("/lobby");
      }
      setJoinedRoom(undefined);
    };
    const requestRooms = () => socket.emit("requestRooms");
    const onGameOpened = () => setIsInGame(true);
    const onGameLeft = () => setIsInGame(false);

    socket.on("room:sync", onRoomSync);
    socket.on("room:updated", onRoomUpdated);
    socket.on("room:join:failed", onRoomJoinFailed);
    socket.on("room:left", onRoomLeft);
    socket.on("connect", requestRooms);
    socket.on("game:opened", onGameOpened);
    socket.on("game:left", onGameLeft);

    // fragt nach den aktuellen Räumen, sobald die Komponente geladen wird und der Socket verbunden ist
    requestRooms();

    return () => {
      socket.off("connect", requestRooms);
      socket.off("room:sync", onRoomSync);
      socket.off("room:updated", onRoomUpdated);
      socket.off("room:join:failed", onRoomJoinFailed);
      socket.off("room:left", onRoomLeft);
      socket.off("game:opened", onGameOpened);
      socket.off("game:left", onGameLeft);
    };
  }, [router]);

  useEffect(() => {
    /* Redirect to room page when the id of joinedRoom changes (e.g. by having successfully created a room).
       Joining a room with a running game also updates the room, but there the game board wins. */
    if (roomId && !isInGame && pathname === "/lobby") {
      router.push(`/lobby/${roomId}`);
    }
  }, [roomId, isInGame, pathname, router]);

  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoinedRoom(undefined);
    router.push("/lobby");
  };

  // Leaves the room without redirecting to /lobby, for use when leaving is a
  // side effect of navigating elsewhere (e.g. a header nav link) rather than
  // the destination itself.
  const leaveRoomForNavigation = () => {
    skipNextLeaveRedirect.current = true;
    socket.emit("leaveRoom");
    setJoinedRoom(undefined);
  };

  return (
    <RoomsContext.Provider value={rooms}>
      <JoinedRoomContext.Provider value={joinedRoom}>
        <LeaveRoomContext.Provider value={leaveRoom}>
          <LeaveRoomForNavigationContext.Provider
            value={leaveRoomForNavigation}
          >
            {children}
          </LeaveRoomForNavigationContext.Provider>
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

export function useLeaveRoomForNavigation() {
  const context = useContext(LeaveRoomForNavigationContext);
  return context;
}
