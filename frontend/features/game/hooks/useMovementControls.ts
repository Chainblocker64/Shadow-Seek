import { useEffect } from "react";
import { socket } from "@/lib/socket";
import type { MovementDirection } from "../types/movement";

const KEY_TO_DIRECTION: Record<string, MovementDirection> = {
  w: "up",
  a: "left",
  s: "down",
  d: "right",
};

export function useMovementControls() {
  useEffect(() => {
    // Game Board geladen, dann websocket hat verbindung
    socket.connect();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      const pressedKey = event.key.toLowerCase();

      const direction = KEY_TO_DIRECTION[pressedKey];
      if (!direction) {
        return;
      }

      event.preventDefault();
      console.log("Movement request:", direction);
      socket.emit("movePlayer", {
        direction,
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
