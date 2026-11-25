// Sizzle Chef — layout, timing and tuning. One clear job: every number the game
// uses lives here, so the world, input and renderer all agree on the same kitchen.
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;

// Shift: one working day. Reach the coin target before the clock runs out.
export const SHIFT_SECONDS = 150;
export const COIN_TARGET = 120;
export const START_HEARTS = 3;

// Orders.
export const MAX_ORDERS = 3;
export const ORDER_PATIENCE = 50;
export const FIRST_ORDER_DELAY = 5;
export const ORDER_INTERVAL_START = 14;
export const ORDER_INTERVAL_END = 9;

// Processing times (seconds) and the grill's burn window.
export const CHOP_SECONDS = 2;
export const CHEESE_CHOP_SECONDS = 1.5;
export const GRILL_SECONDS = 4;
export const GRILL_BURN_AFTER = 5;
export const BOIL_SECONDS = 3;

// Combo: serving again within this many seconds raises the multiplier.
export const COMBO_WINDOW = 8;
export const COMBO_MAX = 4;

// Stations: two slots each so a second item can wait its turn.
export const STATION_SLOTS = 2;
export const PLATE_SLOTS = 2;
export const PLATE_CAPACITY = 4;

// Layout rectangles. The order board is up top, the working stations in the
// middle, the ingredient counter along the bottom.
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 60 },
  orderBoard: { x: 24, y: 72, w: 1232, h: 116 },
  grill: { x: 40, y: 216, w: 260, h: 200 },
  chop: { x: 330, y: 216, w: 230, h: 200 },
  pot: { x: 590, y: 216, w: 230, h: 200 },
  plates: { x: 850, y: 216, w: 230, h: 200 },
  serve: { x: 1110, y: 216, w: 130, h: 200 },
  bins: { x: 24, y: 452, w: 1232, h: 240 },
  trash: { x: 1110, y: 440, w: 130, h: 96 },
  hintBar: { x: 0, y: 772, w: 1280, h: 28 },
};

// Ingredient bins along the counter, left to right (keys 1-7).
export const BIN_ORDER = ['bun', 'patty', 'lettuce', 'tomato', 'cheese', 'noodle', 'sauce'];

// Colours for the kitchen's look: warm tile, cream counters, teal accents.
export const COLORS = {
  wall: '#f7e8c9',
  floor: '#e8b04b',
  floorLine: '#d99a2b',
  counter: '#fff6e0',
  counterEdge: '#c98f2e',
  board: '#3b2f2f',
  boardEdge: '#241c1c',
  ticket: '#fffdf5',
  ticketEdge: '#d8c9a3',
  grill: '#4a4a52',
  grillHot: '#ff7a3c',
  pot: '#7a8ba0',
  plate: '#ffffff',
  plateEdge: '#c9c2b4',
  text: '#2b2118',
  muted: '#8a7a63',
  good: '#2e9e5b',
  bad: '#d63c2f',
  gold: '#f2b705',
  teal: '#1f8a70',
};
