import { useEffect } from "react";
import { socket } from "@/lib/socket";
import type { MovementDirection } from "../types/movement";

const KEY_TO_ACTION_TYPE: Record<string, string> = {
  space: "attack",
  keyw: "movement",
  keya: "movement",
  keys: "movement",
  keyd: "movement",
};

const KEY_TO_DIRECTION: Record<string, MovementDirection> = {
  keyw: "up",
  keya: "left",
  keys: "down",
  keyd: "right",
};

export function useInputControls(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Game Board geladen, dann websocket hat verbindung
    socket.connect();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      const pressedKey = event.code.toLowerCase();

      switch (KEY_TO_ACTION_TYPE[pressedKey]) {
        case "movement":
          handleMovementInput(event, pressedKey);
          break;
        case "attack":
          handleAttackInput(event);
          break;

        default:
          return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
}

function handleMovementInput(event: KeyboardEvent, pressedKey: string) {
  const direction = KEY_TO_DIRECTION[pressedKey];
  if (!direction) {
    return;
  }

  event.preventDefault();

  socket.emit("movePlayer", {
    direction,
  });
}

function handleAttackInput(event: KeyboardEvent) {
  event.preventDefault();
  socket.emit("playerAttack");
}
