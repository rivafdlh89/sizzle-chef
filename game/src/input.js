// Sizzle Chef — mouse and keyboard. Clicks act at once (pick up, place, serve);
// keys are the fast path for the same moves. The game owns the screen; input
// only asks it which one is showing.
import { BIN_ORDER } from './config.js';
import { INGREDIENTS } from './recipes.js';
import {
  binIndexAt,
  hit,
  muteButtonRect,
  pauseButtonRect,
  serveRect,
  stationSlotRect,
  trashRect,
} from './geometry.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;

export function createInput(canvas, world, audio, hooks) {
  let mouseX = 640;
  let mouseY = 400;
  let queued = 0;

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function clickPlay(x, y) {
    if (hit(pauseButtonRect(), x, y)) {
      queued |= ACTION_PAUSE;
      return;
    }
    if (hit(muteButtonRect(), x, y)) {
      audio.toggleMute();
      return;
    }
    const bin = binIndexAt(x, y);
    if (bin >= 0) {
      const kind = BIN_ORDER[bin];
      if (world.pickBin(kind)) audio.pickup();
      return;
    }
    for (const station of ['grill', 'chop', 'pot']) {
      for (let slot = 0; slot < 2; slot += 1) {
        if (hit(stationSlotRect(station, slot), x, y)) {
          const before = world.state.hand;
          const result = world.useStation(station, slot);
          if (result.ok) {
            if (result.placed) audio.place();
            else if (result.took) audio.pickup();
            else if (result.trashed) audio.fail();
          } else if (before) audio.fail();
          return;
        }
      }
    }
    for (let plate = 0; plate < 2; plate += 1) {
      if (hit(stationSlotRect('plate', plate), x, y)) {
        if (world.state.hand) {
          if (world.addToPlate(plate)) audio.place();
        } else {
          const result = world.servePlate(plate);
          if (result.ok) audio.serve();
        }
        return;
      }
    }
    if (hit(serveRect(), x, y)) {
      const result = world.serveAny();
      if (result.ok) audio.serve();
      return;
    }
    if (hit(trashRect(), x, y)) {
      if (world.state.hand) world.trashHand();
      else {
        const full = world.state.plates.findIndex((p) => p.items.length > 0);
        if (full >= 0) world.clearPlate(full);
      }
    }
  }

  canvas.addEventListener('mousedown', (event) => {
    audio.unlock();
    const point = canvasPoint(event);
    mouseX = point.x;
    mouseY = point.y;
    const screen = hooks.screen();
    if (screen === 'title' || screen === 'over') queued |= ACTION_CONFIRM;
    else if (screen === 'play') clickPlay(point.x, point.y);
    else if (screen === 'paused') queued |= ACTION_PAUSE;
  });

  canvas.addEventListener('mousemove', (event) => {
    const point = canvasPoint(event);
    mouseX = point.x;
    mouseY = point.y;
  });

  window.addEventListener('keydown', (event) => {
    const screen = hooks.screen();
    if (event.repeat) return;
    if (screen === 'title' || screen === 'over') {
      if (event.code === 'Space' || event.code === 'Enter') queued |= ACTION_CONFIRM;
      return;
    }
    if (event.code === 'KeyP' || event.code === 'Escape') {
      queued |= ACTION_PAUSE;
      return;
    }
    if (screen !== 'play') return;
    if (event.code === 'Space') {
      const result = world.serveAny();
      if (result.ok) audio.serve();
      return;
    }
    if (event.code === 'KeyT') {
      world.trashHand();
      return;
    }
    if (event.code === 'KeyM') {
      audio.toggleMute();
      return;
    }
    if (event.code === 'KeyC') {
      const full = world.state.plates.findIndex((p) => p.items.length > 0);
      if (full >= 0) world.clearPlate(full);
      return;
    }
    const digit = Number.parseInt(event.key, 10);
    if (digit >= 1 && digit <= BIN_ORDER.length) {
      const kind = BIN_ORDER[digit - 1];
      if (world.pickBin(kind)) audio.pickup();
    }
  });

  return {
    takeActions() {
      const actions = queued;
      queued = 0;
      return actions;
    },
    mouse() {
      return { x: mouseX, y: mouseY };
    },
  };
}
