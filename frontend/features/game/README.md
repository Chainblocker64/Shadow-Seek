# Movement Directions

frontend/features/game/types/movement.ts

Movement directions define how a player can move on the tile-based game board.

Only four movement directions are allowed:

- `up`
- `down`
- `left`
- `right`

## Type

```
type MovementDirection = "up" | "down" | "left" | "right";
```
## Validation

Incoming movement direction values should be validated before they are used.

Example:
```
{
  playerId: "player-1",
  direction: "up"
}
```

---

## Logik & Denkweise

Ablauf später im Spiel:

```
1. Spieler drückt Taste
2. Frontend erzeugt Richtung, zum Beispiel "up"
3. Richtung wird geprüft
4. Nur gültige Richtung wird weiterverarbeitet
5. Backend kann dieselbe Richtung für Movement benutzen
```