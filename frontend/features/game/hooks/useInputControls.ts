import { useEffect } from "react";
import { socket } from "@/lib/socket";
import type { MovementDirection } from "../types/movement";

const KEY_TO_ACTION_TYPE: Record<string, string> = {
  space: "attack",
  keyw: "movement",
  arrowup: "movement",
  keya: "movement",
  arrowleft: "movement",
  keys: "movement",
  arrowdown: "movement",
  keyd: "movement",
  arrowright: "movement",
};

const KEY_TO_DIRECTION: Record<string, MovementDirection> = {
  keyw: "up",
  arrowup: "up",
  keya: "left",
  arrowleft: "left",
  keys: "down",
  arrowdown: "down",
  keyd: "right",
  arrowright: "right",
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
