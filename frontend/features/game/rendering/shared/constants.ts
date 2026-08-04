export const TILESET_PATH = "/assets/tiles/dungeon-crawl.png";

export const DIRECTION_CIRCLE_SIZE = 12;
export const DIRECTION_CIRCLE_RADIUS = DIRECTION_CIRCLE_SIZE / 2;

export const ATTACK_PREVIEW_FRAME = {
  x: 1696,
  y: 864,
};

export const ATTACK_COOLDOWN_MS = 1_000;

export const COOLDOWN_BAR_WIDTH_RATIO = 0.9;
export const COOLDOWN_BAR_HEIGHT = 4;
export const COOLDOWN_READY_COLOR = 0x3b82f6;
export const COOLDOWN_BACKGROUND_COLOR = 0x18181b;

export const OWN_PLAYER_DIRECTION_COLOR = 0x22c55e;
export const OTHER_PLAYER_DIRECTION_COLOR = 0xef4444;

export const HEALTH_BAR_WIDTH_RATIO = 0.9;
export const HEALTH_BAR_HEIGHT_RATIO = 0.12;
export const HEALTH_BAR_MIN_HEIGHT = 3;
export const HEALTH_FONT_SIZE_RATIO = 0.3;
export const HEALTH_MIN_FONT_SIZE = 9;
export const HEALTH_ELEMENT_GAP = 2;

export const HEALTH_HIGH_COLOR = 0x22c55e;
export const HEALTH_MEDIUM_COLOR = 0xfacc15;
export const HEALTH_LOW_COLOR = 0xef4444;

export const HEALTH_MEDIUM_RATIO = 0.5;
export const HEALTH_LOW_RATIO = 0.25;

// Hiding never removes a player from the board — it only takes away the loud
// parts. The sprite stays, dimmed and drawn behind the cover it stands in, so
// an enemy who looks at the tile still recognises somebody in there.
export const CONCEALED_PLAYER_ALPHA = 0.4;
// Your own hiding spot has to stay readable to you, so you can tell at a
// glance that the cover is working.
export const CONCEALED_OWN_PLAYER_ALPHA = 0.7;
export const CONCEALING_OBJECT_ALPHA = 0.85;
export const CONCEALED_HINT_COLOR = 0xfacc15;
// Cover is a distance effect: whoever stands right next to you sees you
// plainly, which also keeps melee range readable for both sides.
export const CONCEALMENT_REVEAL_DISTANCE = 1;
