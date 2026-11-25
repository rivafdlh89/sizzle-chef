// Sizzle Chef — the kitchen's geometry. Input and the renderer both ask here,
// so a click and a drawing can never disagree about where a station is.
import { BIN_ORDER, LAYOUT } from './config.js';

function slotPair(area, slotWidth, slotHeight, top) {
  const gap = (area.w - slotWidth * 2) / 3;
  return (index) => ({
    x: area.x + gap + index * (slotWidth + gap),
    y: area.y + top,
    w: slotWidth,
    h: slotHeight,
  });
}

const grillSlot = slotPair(LAYOUT.grill, 110, 110, 52);
const chopSlot = slotPair(LAYOUT.chop, 92, 92, 52);
const potSlot = slotPair(LAYOUT.pot, 92, 92, 52);
const plateSlot = slotPair(LAYOUT.plates, 96, 96, 52);

export function stationSlotRect(station, index) {
  if (station === 'grill') return grillSlot(index);
  if (station === 'chop') return chopSlot(index);
  if (station === 'pot') return potSlot(index);
  if (station === 'plate') return plateSlot(index);
  return { x: 0, y: 0, w: 0, h: 0 };
}

export function binRect(index) {
  return { x: 30 + index * 176, y: 466, w: 164, h: 190 };
}

export function binIndexAt(x, y) {
  for (let i = 0; i < BIN_ORDER.length; i += 1) {
    const r = binRect(i);
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

export function orderTicketRect(index) {
  return { x: 24 + index * 416, y: 72, w: 400, h: 116 };
}

export function serveRect() {
  return { x: LAYOUT.serve.x + 15, y: LAYOUT.serve.y + 52, w: 100, h: 100 };
}

export function trashRect() {
  return { x: LAYOUT.trash.x, y: LAYOUT.trash.y, w: LAYOUT.trash.w, h: LAYOUT.trash.h };
}

export function pauseButtonRect() {
  return { x: 1180, y: 10, w: 44, h: 40 };
}

export function muteButtonRect() {
  return { x: 1128, y: 10, w: 44, h: 40 };
}

export function hit(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}
