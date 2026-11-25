// Sizzle Chef — everything the eye sees, drawn on one canvas with flat vector
// shapes (no image files, no network). The renderer reads the world and paints
// it; it never changes a rule.
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, LAYOUT } from './config.js';
import { BIN_ORDER } from './config.js';
import { INGREDIENTS, RECIPES, itemColors, itemLabel, recipeById } from './recipes.js';
import { binRect, orderTicketRect, pauseButtonRect, muteButtonRect, serveRect, stationSlotRect, trashRect } from './geometry.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function text(ctx, value, x, y, size, color, weight = 'bold', align = 'center') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function sameItems(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const item of a) counts.set(item, (counts.get(item) ?? 0) + 1);
  for (const item of b) {
    const left = counts.get(item) ?? 0;
    if (left === 0) return false;
    counts.set(item, left - 1);
  }
  return true;
}

function plateMatches(state, plate) {
  if (plate.items.length === 0) return false;
  return state.orders.some((o) => sameItems(plate.items, recipeById(o.recipeId).items));
}

/** One drawn food item, centred at (cx, cy) with radius r. */
export function drawIngredient(ctx, item, cx, cy, r) {
  const { color, dark } = itemColors(item);
  ctx.save();
  ctx.translate(cx, cy);
  if (item === 'bun') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.fillRect(-r, r * 0.1, r * 2, r * 0.25);
    ctx.fillStyle = '#fff3c9';
    for (const [dx, dy] of [[-0.45, -0.45], [0, -0.6], [0.45, -0.45], [-0.2, -0.25], [0.25, -0.25]]) {
      circle(ctx, dx * r, dy * r, r * 0.09);
      ctx.fill();
    }
  } else if (item === 'patty' || item === 'grilled-patty') {
    ctx.fillStyle = item === 'grilled-patty' ? '#6b3d1e' : color;
    roundRect(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.5);
    ctx.fill();
    if (item === 'grilled-patty') {
      ctx.strokeStyle = '#3d2210';
      ctx.lineWidth = r * 0.12;
      for (const dx of [-0.5, 0, 0.5]) {
        ctx.beginPath();
        ctx.moveTo(dx * r, -r * 0.5);
        ctx.lineTo(dx * r, r * 0.5);
        ctx.stroke();
      }
    }
  } else if (item === 'lettuce' || item === 'chopped-lettuce') {
    ctx.fillStyle = color;
    if (item === 'lettuce') {
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2;
        circle(ctx, Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.5);
        ctx.fill();
      }
      ctx.fillStyle = '#a8e07e';
      circle(ctx, 0, 0, r * 0.45);
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = r * 0.28;
      ctx.lineCap = 'round';
      for (const [x1, y1, x2, y2] of [[-0.7, -0.3, 0.1, -0.5], [-0.4, 0.4, 0.5, 0.2], [0.2, -0.1, 0.8, -0.4]]) {
        ctx.beginPath();
        ctx.moveTo(x1 * r, y1 * r);
        ctx.lineTo(x2 * r, y2 * r);
        ctx.stroke();
      }
    }
  } else if (item === 'tomato' || item === 'chopped-tomato') {
    ctx.fillStyle = color;
    if (item === 'tomato') {
      circle(ctx, 0, 0, r * 0.9);
      ctx.fill();
      ctx.fillStyle = '#ff8a7a';
      circle(ctx, -r * 0.3, -r * 0.35, r * 0.28);
      ctx.fill();
      ctx.fillStyle = '#4e8a2a';
      circle(ctx, 0, -r * 0.85, r * 0.18);
      ctx.fill();
    } else {
      for (const [dx, dy] of [[-0.45, -0.3], [0.35, -0.4], [0, 0.4]]) {
        ctx.save();
        ctx.translate(dx * r, dy * r);
        ctx.rotate((dx + dy) * 0.8);
        ctx.fillRect(-r * 0.35, -r * 0.3, r * 0.7, r * 0.6);
        ctx.restore();
      }
    }
  } else if (item === 'cheese' || item === 'chopped-cheese') {
    ctx.fillStyle = color;
    if (item === 'cheese') {
      ctx.beginPath();
      ctx.moveTo(-r * 0.9, r * 0.6);
      ctx.lineTo(0, -r * 0.9);
      ctx.lineTo(r * 0.9, r * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = dark;
      for (const [dx, dy] of [[-0.3, 0.1], [0.25, 0.25], [0.05, -0.35]]) {
        circle(ctx, dx * r, dy * r, r * 0.12);
        ctx.fill();
      }
    } else {
      for (const [dx, dy] of [[-0.45, -0.3], [0.4, -0.35], [0, 0.4]]) {
        ctx.fillRect(dx * r - r * 0.28, dy * r - r * 0.24, r * 0.56, r * 0.48);
      }
    }
  } else if (item === 'noodle' || item === 'boiled-noodle') {
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      for (let t = 0; t <= 1.001; t += 0.2) {
        const x = -r * 0.8 + t * r * 1.6;
        const y = i * r * 0.55 + Math.sin(t * Math.PI * 2.5) * r * 0.22;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (item === 'sauce') {
    ctx.fillStyle = color;
    circle(ctx, 0, r * 0.1, r * 0.75);
    ctx.fill();
    ctx.fillStyle = '#ff7a6b';
    ctx.beginPath();
    ctx.arc(0, -r * 0.25, r * 0.4, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = dark;
    circle(ctx, r * 0.35, r * 0.3, r * 0.16);
    ctx.fill();
  }
  ctx.restore();
}

function drawProgressBar(ctx, x, y, w, fraction, done) {
  ctx.fillStyle = '#2b2118';
  roundRect(ctx, x, y, w, 12, 6);
  ctx.fill();
  const color = done ? '#2e9e5b' : fraction > 0.75 ? '#f2b705' : '#ff7a3c';
  ctx.fillStyle = color;
  if (fraction > 0) {
    roundRect(ctx, x + 2, y + 2, Math.max(4, (w - 4) * Math.min(1, fraction)), 8, 4);
    ctx.fill();
  }
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-11, -4, -6, -12, 0, -5);
  ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
  ctx.closePath();
  ctx.fillStyle = filled ? '#e84a5f' : '#5a4a3a';
  ctx.fill();
  ctx.restore();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function drawTopBar(state, best, muted) {
    ctx.fillStyle = '#1f8a70';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 60);
    text(ctx, 'SIZZLE CHEF', 24, 24, 26, '#ffffff', 'bold', 'left');
    text(ctx, 'one shift. no shortcuts.', 24, 46, 12, '#cdeee3', 'normal', 'left');
    const minutes = Math.floor(state.shiftLeft / 60);
    const seconds = Math.floor(state.shiftLeft % 60);
    const urgent = state.shiftLeft <= 20;
    text(ctx, `${minutes}:${String(seconds).padStart(2, '0')}`, 640, 22, 26, urgent ? '#ffd94d' : '#ffffff');
    ctx.fillStyle = '#0f5a46';
    roundRect(ctx, 540, 40, 200, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#ffd94d';
    roundRect(ctx, 542, 42, 196 * (state.shiftLeft / 150), 4, 2);
    ctx.fill();
    text(ctx, `COINS $${state.coins} / $${120}`, 800, 22, 20, '#ffffff');
    text(ctx, `served ${state.served}`, 800, 44, 12, '#cdeee3');
    for (let i = 0; i < 3; i += 1) drawHeart(ctx, 950 + i * 30, 24, 22, i < state.hearts);
    if (state.combo > 1) {
      ctx.fillStyle = '#d63c2f';
      roundRect(ctx, 1010, 8, 96, 30, 15);
      ctx.fill();
      text(ctx, `COMBO x${state.combo}`, 1058, 24, 15, '#ffffff');
    }
    for (const [rect, label] of [[muteButtonRect(), muted ? 'MUTE' : 'SOUND'], [pauseButtonRect(), 'II']]) {
      ctx.fillStyle = '#0f5a46';
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
      ctx.fill();
      text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1, 12, '#ffffff');
    }
  }

  function drawOrderTicket(state, index) {
    const rect = orderTicketRect(index);
    const order = state.orders[index];
    ctx.fillStyle = COLORS.board;
    roundRect(ctx, rect.x - 4, rect.y - 4, rect.w + 8, rect.h + 8, 12);
    ctx.fill();
    if (!order) {
      ctx.fillStyle = '#5a4a3a';
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
      ctx.fill();
      text(ctx, '— next order coming —', rect.x + rect.w / 2, rect.y + rect.h / 2, 15, '#a08a6a', 'normal');
      return;
    }
    const recipe = recipeById(order.recipeId);
    const urgent = order.patience < 15;
    ctx.fillStyle = COLORS.ticket;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
    ctx.fill();
    if (urgent) {
      ctx.strokeStyle = '#d63c2f';
      ctx.lineWidth = 3;
      roundRect(ctx, rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2, 8);
      ctx.stroke();
    }
    text(ctx, `#${order.id}  ${recipe.name}`, rect.x + 16, rect.y + 24, 19, COLORS.text, 'bold', 'left');
    text(ctx, `$${recipe.price}`, rect.x + rect.w - 16, rect.y + 24, 19, '#2e9e5b', 'bold', 'right');
    recipe.items.forEach((item, i) => {
      drawIngredient(ctx, item, rect.x + 34 + i * 56, rect.y + 66, 20);
    });
    text(ctx, recipe.items.map(itemLabel).join(' + '), rect.x + 16, rect.y + 96, 12, COLORS.muted, 'normal', 'left');
    const barW = rect.w - 32;
    ctx.fillStyle = '#e5d9bd';
    roundRect(ctx, rect.x + 16, rect.y + rect.h - 18, barW, 8, 4);
    ctx.fill();
    const frac = Math.max(0, order.patience / order.max);
    ctx.fillStyle = frac > 0.5 ? '#2e9e5b' : frac > 0.25 ? '#f2b705' : '#d63c2f';
    roundRect(ctx, rect.x + 18, rect.y + rect.h - 16, Math.max(4, (barW - 4) * frac), 4, 2);
    ctx.fill();
  }

  function drawStationLabel(x, y, label, hint) {
    text(ctx, label, x, y, 16, COLORS.text);
    text(ctx, hint, x, y + 20, 11, COLORS.muted, 'normal');
  }

  function drawSlot(ctx, rect, slot, station) {
    ctx.fillStyle = station === 'grill' ? COLORS.grill : station === 'pot' ? '#e8eef4' : '#f3e2b8';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fill();
    ctx.strokeStyle = COLORS.counterEdge;
    ctx.lineWidth = 2;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.stroke();
    if (!slot) return;
    if (slot.state === 'burnt') {
      ctx.fillStyle = '#1c1c1c';
      circle(ctx, rect.x + rect.w / 2, rect.y + rect.h / 2, 30);
      ctx.fill();
      text(ctx, 'BURNT', rect.x + rect.w / 2, rect.y + rect.h - 14, 12, '#d63c2f');
      return;
    }
    drawIngredient(ctx, slot.kind, rect.x + rect.w / 2, rect.y + rect.h / 2 - 6, 30);
    const fraction = slot.progress / slot.duration;
    drawProgressBar(ctx, rect.x + 10, rect.y + rect.h - 22, rect.w - 20, fraction, slot.state === 'done');
    if (slot.state === 'done') {
      ctx.fillStyle = '#2e9e5b';
      circle(ctx, rect.x + rect.w - 14, rect.y + 14, 12);
      ctx.fill();
      text(ctx, '✓', rect.x + rect.w - 14, rect.y + 15, 14, '#ffffff');
    }
    if (station === 'grill' && slot.state === 'working') {
      ctx.fillStyle = '#ff7a3c';
      for (const dx of [-14, 0, 14]) {
        ctx.beginPath();
        ctx.moveTo(rect.x + rect.w / 2 + dx, rect.y + rect.h - 4);
        ctx.quadraticCurveTo(rect.x + rect.w / 2 + dx - 6, rect.y + rect.h - 18, rect.x + rect.w / 2 + dx, rect.y + rect.h - 26);
        ctx.quadraticCurveTo(rect.x + rect.w / 2 + dx + 6, rect.y + rect.h - 18, rect.x + rect.w / 2 + dx, rect.y + rect.h - 4);
        ctx.fill();
      }
    }
  }

  function drawStations(state) {
    // Grill
    ctx.fillStyle = COLORS.counter;
    roundRect(ctx, LAYOUT.grill.x, LAYOUT.grill.y, LAYOUT.grill.w, LAYOUT.grill.h, 14);
    ctx.fill();
    drawStationLabel(LAYOUT.grill.x + LAYOUT.grill.w / 2, LAYOUT.grill.y + 24, 'GRILL', 'patty · 4s · burns if left');
    for (let i = 0; i < 2; i += 1) drawSlot(ctx, stationSlotRect('grill', i), state.grill[i], 'grill');
    // Chopping board
    ctx.fillStyle = COLORS.counter;
    roundRect(ctx, LAYOUT.chop.x, LAYOUT.chop.y, LAYOUT.chop.w, LAYOUT.chop.h, 14);
    ctx.fill();
    drawStationLabel(LAYOUT.chop.x + LAYOUT.chop.w / 2, LAYOUT.chop.y + 24, 'CHOP BOARD', 'lettuce · tomato · cheese');
    for (let i = 0; i < 2; i += 1) drawSlot(ctx, stationSlotRect('chop', i), state.chop[i], 'chop');
    // Pot
    ctx.fillStyle = COLORS.counter;
    roundRect(ctx, LAYOUT.pot.x, LAYOUT.pot.y, LAYOUT.pot.w, LAYOUT.pot.h, 14);
    ctx.fill();
    drawStationLabel(LAYOUT.pot.x + LAYOUT.pot.w / 2, LAYOUT.pot.y + 24, 'POT', 'noodle · 3s');
    for (let i = 0; i < 2; i += 1) drawSlot(ctx, stationSlotRect('pot', i), state.pot[i], 'pot');
    // Plates
    ctx.fillStyle = COLORS.counter;
    roundRect(ctx, LAYOUT.plates.x, LAYOUT.plates.y, LAYOUT.plates.w, LAYOUT.plates.h, 14);
    ctx.fill();
    drawStationLabel(LAYOUT.plates.x + LAYOUT.plates.w / 2, LAYOUT.plates.y + 24, 'PLATES', 'assemble · click to serve');
    state.plates.forEach((plate, i) => {
      const rect = stationSlotRect('plate', i);
      const ready = plateMatches(state, plate);
      ctx.fillStyle = COLORS.plate;
      circle(ctx, rect.x + rect.w / 2, rect.y + rect.h / 2, 46);
      ctx.fill();
      ctx.strokeStyle = ready ? '#f2b705' : COLORS.plateEdge;
      ctx.lineWidth = ready ? 4 : 2;
      circle(ctx, rect.x + rect.w / 2, rect.y + rect.h / 2, 46);
      ctx.stroke();
      plate.items.forEach((item, j) => {
        const spread = plate.items.length > 1 ? (j - (plate.items.length - 1) / 2) * 26 : 0;
        drawIngredient(ctx, item, rect.x + rect.w / 2 + spread, rect.y + rect.h / 2, 17);
      });
      if (ready) text(ctx, 'READY!', rect.x + rect.w / 2, rect.y + rect.h - 8, 13, '#b97c00');
    });
    // Serve bell
    ctx.fillStyle = COLORS.counter;
    roundRect(ctx, LAYOUT.serve.x, LAYOUT.serve.y, LAYOUT.serve.w, LAYOUT.serve.h, 14);
    ctx.fill();
    drawStationLabel(LAYOUT.serve.x + LAYOUT.serve.w / 2, LAYOUT.serve.y + 24, 'SERVE', 'ring the bell');
    const bell = serveRect();
    const anyReady = state.plates.some((p) => plateMatches(state, p));
    ctx.fillStyle = anyReady ? '#ffd94d' : '#f2b705';
    ctx.beginPath();
    ctx.arc(bell.x + bell.w / 2, bell.y + bell.h / 2 + 8, 34, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c98f2e';
    ctx.fillRect(bell.x + bell.w / 2 - 40, bell.y + bell.h / 2 + 6, 80, 8);
    ctx.fillStyle = '#8a6a1a';
    circle(ctx, bell.x + bell.w / 2 + 26, bell.y + bell.h / 2 + 18, 5);
    ctx.fill();
    // Trash
    const trash = trashRect();
    ctx.fillStyle = '#8a8f98';
    roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 10);
    ctx.fill();
    ctx.fillStyle = '#6a6f78';
    roundRect(ctx, trash.x + 8, trash.y - 6, trash.w - 16, 14, 6);
    ctx.fill();
    text(ctx, 'TRASH', trash.x + trash.w / 2, trash.y + trash.h / 2 + 8, 13, '#ffffff');
  }

  function drawBins(state) {
    text(ctx, 'INGREDIENT COUNTER — click a bin, then a station (keys 1–7 work too)', 24, LAYOUT.bins.y - 8, 14, COLORS.text, 'bold', 'left');
    BIN_ORDER.forEach((kind, i) => {
      const rect = binRect(i);
      const def = INGREDIENTS[kind];
      ctx.fillStyle = COLORS.counter;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
      ctx.fill();
      ctx.strokeStyle = COLORS.counterEdge;
      ctx.lineWidth = 2;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
      ctx.stroke();
      drawIngredient(ctx, kind, rect.x + rect.w / 2, rect.y + 62, 34);
      text(ctx, def.label, rect.x + rect.w / 2, rect.y + 122, 17, COLORS.text);
      text(ctx, def.ready ? 'ready to plate' : `→ ${def.station}`, rect.x + rect.w / 2, rect.y + 146, 12, COLORS.muted, 'normal');
      ctx.fillStyle = '#1f8a70';
      circle(ctx, rect.x + rect.w - 18, rect.y + 18, 13);
      ctx.fill();
      text(ctx, def.key, rect.x + rect.w - 18, rect.y + 19, 13, '#ffffff');
    });
  }

  function drawHand(state, mouse) {
    if (!state.hand) return;
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = '#ffffff';
    circle(ctx, mouse.x, mouse.y, 30);
    ctx.fill();
    ctx.strokeStyle = '#1f8a70';
    ctx.lineWidth = 3;
    circle(ctx, mouse.x, mouse.y, 30);
    ctx.stroke();
    drawIngredient(ctx, state.hand, mouse.x, mouse.y, 20);
    ctx.restore();
  }

  function drawEffects(state) {
    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.fillStyle = p.color;
      circle(ctx, p.x, p.y, p.size);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const f of state.floats) {
      ctx.globalAlpha = Math.max(0, 1 - f.age / f.life);
      text(ctx, f.text, f.x, f.y, 22, f.color);
    }
    ctx.globalAlpha = 1;
    if (state.message && state.time - state.messageAt < 2.5) {
      const w = ctx.measureText(state.message).width + 36;
      ctx.fillStyle = 'rgba(43,33,24,0.9)';
      roundRect(ctx, CANVAS_WIDTH / 2 - w / 2, 706, w, 34, 17);
      ctx.fill();
      text(ctx, state.message, CANVAS_WIDTH / 2, 724, 15, '#ffffff', 'normal');
    }
  }

  function drawOverlay(title, lines, accent) {
    ctx.fillStyle = 'rgba(31,42,52,0.72)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    text(ctx, title, CANVAS_WIDTH / 2, 250, 64, '#ffffff');
    lines.forEach((line, i) => {
      text(ctx, line, CANVAS_WIDTH / 2, 330 + i * 34, 20, '#f2e8d5', 'normal');
    });
    if (accent) text(ctx, accent, CANVAS_WIDTH / 2, 330 + lines.length * 34 + 18, 22, '#ffd94d');
  }

  function draw(state, screen, best, mouse, muted) {
    // Kitchen backdrop.
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = COLORS.floor;
    ctx.fillRect(0, 430, CANVAS_WIDTH, 342);
    ctx.strokeStyle = COLORS.floorLine;
    ctx.lineWidth = 2;
    for (let x = 0; x < CANVAS_WIDTH; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 430);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 430; y < CANVAS_HEIGHT; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    drawTopBar(state, best, muted);
    for (let i = 0; i < 3; i += 1) drawOrderTicket(state, i);
    drawStations(state);
    drawBins(state);
    drawEffects(state);
    if (screen === SCREEN_PLAY) drawHand(state, mouse);
    text(ctx, '1–7 pick ingredient · click stations to cook · click a finished plate to serve · Space serve · P pause · T trash · M mute', CANVAS_WIDTH / 2, 786, 13, COLORS.muted, 'normal');

    if (screen === SCREEN_TITLE) {
      drawOverlay('SIZZLE CHEF', [
        'Run the kitchen. Take orders, chop, grill, boil, plate and serve',
        'before the ticket runs out — and before the patty burns.',
        `Reach $${120} before the shift ends. Best shift: $${best}.`,
      ], 'Click or press Space to start');
    } else if (screen === SCREEN_PAUSED) {
      drawOverlay('PAUSED', ['The stove is off. Take a breath.'], 'Press P or click to keep cooking');
    } else if (screen === SCREEN_OVER) {
      if (state.won) {
        drawOverlay('DAY COMPLETE!', [
          `You banked $${state.coins} and served ${state.served} dishes.`,
          `${state.failed} order${state.failed === 1 ? '' : 's'} walked out. Best shift: $${Math.max(best, state.coins)}.`,
        ], 'Click or press Space to cook another day');
      } else {
        drawOverlay('SHIFT OVER', [
          state.hearts <= 0 ? 'Too many customers walked out.' : `Only $${state.coins} of the $${120} target.`,
          `You served ${state.served} dishes. Best shift: $${best}.`,
        ], 'Click or press Space to try again');
      }
    }
  }

  return { draw, drawIngredient };
}
