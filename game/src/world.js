// Sizzle Chef — the game rules, with no DOM in them: orders arrive, ingredients
// are chopped, grilled and boiled, plates are assembled and served before the
// ticket's patience runs out. main.js drives it; render.js only paints it.
import {
  CHEESE_CHOP_SECONDS,
  CHOP_SECONDS,
  BOIL_SECONDS,
  COMBO_MAX,
  COMBO_WINDOW,
  COIN_TARGET,
  FIRST_ORDER_DELAY,
  GRILL_BURN_AFTER,
  GRILL_SECONDS,
  MAX_ORDERS,
  ORDER_INTERVAL_END,
  ORDER_INTERVAL_START,
  ORDER_PATIENCE,
  PLATE_CAPACITY,
  PLATE_SLOTS,
  SHIFT_SECONDS,
  START_HEARTS,
  STATION_SLOTS,
} from './config.js';
import { COOKED, INGREDIENTS, RECIPES, recipeById } from './recipes.js';

export const EVENT_NONE = 0;
export const EVENT_SERVED = 1;
export const EVENT_EXPIRED = 2;
export const EVENT_READY = 4;
export const EVENT_BURNT = 8;
export const EVENT_OVER = 16;

function emptySlot() {
  return null;
}

function sameMultiset(a, b) {
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

function weightedRecipe(random) {
  const total = RECIPES.reduce((sum, recipe) => sum + recipe.weight, 0);
  let roll = random.next() * total;
  for (const recipe of RECIPES) {
    roll -= recipe.weight;
    if (roll <= 0) return recipe;
  }
  return RECIPES[0];
}

export function createWorld(random) {
  const state = {
    time: 0,
    shiftLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    failed: 0,
    hearts: START_HEARTS,
    combo: 0,
    comboLeft: 0,
    lastServeAt: -100,
    hand: null,
    orders: [],
    grill: [emptySlot(), emptySlot()],
    chop: [emptySlot(), emptySlot()],
    pot: [emptySlot(), emptySlot()],
    plates: [{ items: [] }, { items: [] }],
    particles: [],
    floats: [],
    message: '',
    messageAt: -100,
    over: false,
    won: false,
    nextOrderIn: FIRST_ORDER_DELAY,
    nextOrderId: 1,
    readyFlash: 0,
  };

  function say(text) {
    state.message = text;
    state.messageAt = state.time;
  }

  function burst(x, y, color, count = 14) {
    for (let i = 0; i < count; i += 1) {
      const angle = random.next() * Math.PI * 2;
      const speed = 60 + random.next() * 140;
      state.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        life: 0.7 + random.next() * 0.4,
        age: 0,
        color,
        size: 3 + random.next() * 4,
      });
    }
  }

  function floatText(x, y, text, color) {
    state.floats.push({ x, y, text, color, age: 0, life: 1.2 });
  }

  function spawnOrder(recipeId) {
    if (state.orders.length >= MAX_ORDERS) return null;
    const recipe = recipeId ? recipeById(recipeId) : weightedRecipe(random);
    const order = {
      id: state.nextOrderId,
      recipeId: recipe.id,
      patience: ORDER_PATIENCE,
      max: ORDER_PATIENCE,
    };
    state.nextOrderId += 1;
    state.orders.push(order);
    return order;
  }

  function orderInterval() {
    const done = 1 - state.shiftLeft / SHIFT_SECONDS;
    return ORDER_INTERVAL_START + (ORDER_INTERVAL_END - ORDER_INTERVAL_START) * done;
  }

  function processingSeconds(kind, station) {
    if (station === 'grill') return GRILL_SECONDS;
    if (station === 'pot') return BOIL_SECONDS;
    return kind === 'cheese' ? CHEESE_CHOP_SECONDS : CHOP_SECONDS;
  }

  function stationAccepts(station, kind) {
    const def = INGREDIENTS[kind];
    return !!def && def.station === station;
  }

  function serveOrder(order, plateIndex) {
    const recipe = recipeById(order.recipeId);
    const tip = Math.round((8 * order.patience) / order.max);
    const comboBonus = state.combo > 1 ? (state.combo - 1) * 4 : 0;
    const earned = recipe.price + tip + comboBonus;
    state.coins += earned;
    state.served += 1;
    state.orders = state.orders.filter((o) => o.id !== order.id);
    state.plates[plateIndex].items = [];
    state.lastServeAt = state.time;
    state.comboLeft = COMBO_WINDOW;
    const rect = { x: 965, y: 268 };
    burst(rect.x, rect.y, '#f2b705', 18);
    floatText(rect.x, rect.y - 20, `+$${earned}`, '#2e9e5b');
    if (state.combo > 1) floatText(rect.x, rect.y - 44, `COMBO x${state.combo}`, '#d63c2f');
    return { earned, tip, comboBonus };
  }

  const world = {
    state,
    random,

    reset() {
      state.time = 0;
      state.shiftLeft = SHIFT_SECONDS;
      state.coins = 0;
      state.served = 0;
      state.failed = 0;
      state.hearts = START_HEARTS;
      state.combo = 0;
      state.comboLeft = 0;
      state.lastServeAt = -100;
      state.hand = null;
      state.orders = [];
      state.grill = [emptySlot(), emptySlot()];
      state.chop = [emptySlot(), emptySlot()];
      state.pot = [emptySlot(), emptySlot()];
      state.plates = [{ items: [] }, { items: [] }];
      state.particles = [];
      state.floats = [];
      state.message = '';
      state.messageAt = -100;
      state.over = false;
      state.won = false;
      state.nextOrderIn = FIRST_ORDER_DELAY;
      state.nextOrderId = 1;
      state.readyFlash = 0;
    },

    spawnOrder,

    /** Take a raw ingredient from its bin into the hand. */
    pickBin(kind) {
      if (state.hand) {
        say('Hands full — serve or trash it first');
        return false;
      }
      if (!INGREDIENTS[kind]) return false;
      state.hand = kind;
      return true;
    },

    /** Place the held item on a station slot, or take a finished one back. */
    useStation(station, slot) {
      const slots = state[station];
      if (!slots || slot < 0 || slot >= slots.length) return { ok: false };
      const current = slots[slot];
      if (state.hand) {
        if (current) {
          say('That spot is busy');
          return { ok: false };
        }
        if (!stationAccepts(station, state.hand)) {
          say(`${INGREDIENTS[state.hand].label} does not go there`);
          return { ok: false };
        }
        const kind = state.hand;
        slots[slot] = {
          kind,
          progress: 0,
          duration: processingSeconds(kind, station),
          state: 'working',
          overcook: 0,
        };
        state.hand = null;
        return { ok: true, placed: true };
      }
      if (!current) return { ok: false };
      if (current.state === 'working') {
        say('Still cooking — wait for the ding');
        return { ok: false };
      }
      if (current.state === 'burnt') {
        slots[slot] = null;
        say('Burnt! Tossed in the trash');
        return { ok: true, trashed: true };
      }
      const cooked = COOKED[current.kind]?.cooked ?? INGREDIENTS[current.kind].cooked;
      slots[slot] = null;
      state.hand = cooked;
      return { ok: true, took: cooked };
    },

    /** Add the held item to a plate. */
    addToPlate(plateIndex) {
      const plate = state.plates[plateIndex];
      if (!plate) return { ok: false };
      if (!state.hand) {
        say('Pick up an ingredient first');
        return { ok: false };
      }
      if (plate.items.length >= PLATE_CAPACITY) {
        say('That plate is full');
        return { ok: false };
      }
      plate.items.push(state.hand);
      state.hand = null;
      return { ok: true };
    },

    /** Serve a plate whose contents exactly match a waiting order. */
    servePlate(plateIndex) {
      const plate = state.plates[plateIndex];
      if (!plate || plate.items.length === 0) return { ok: false };
      const order = state.orders.find((o) => sameMultiset(plate.items, recipeById(o.recipeId).items));
      if (!order) {
        say('No order matches this plate yet');
        return { ok: false };
      }
      if (state.time - state.lastServeAt <= COMBO_WINDOW) state.combo = Math.min(state.combo + 1, COMBO_MAX);
      else state.combo = 1;
      const result = serveOrder(order, plateIndex);
      return { ok: true, ...result, order: recipeById(order.recipeId).name };
    },

    /** Serve the first plate that matches any order. */
    serveAny() {
      for (let i = 0; i < state.plates.length; i += 1) {
        const result = world.servePlate(i);
        if (result.ok) return result;
      }
      say('No finished plate matches an order');
      return { ok: false };
    },

    trashHand() {
      if (!state.hand) return false;
      state.hand = null;
      say('Tossed it');
      return true;
    },

    clearPlate(plateIndex) {
      const plate = state.plates[plateIndex];
      if (!plate || plate.items.length === 0) return false;
      plate.items = [];
      say('Plate cleared');
      return true;
    },

    step(dt) {
      if (state.over) return EVENT_NONE;
      let events = EVENT_NONE;
      state.time += dt;
      state.shiftLeft = Math.max(0, state.shiftLeft - dt);
      state.readyFlash = Math.max(0, state.readyFlash - dt);
      if (state.comboLeft > 0) {
        state.comboLeft -= dt;
        if (state.comboLeft <= 0) state.combo = 0;
      }

      state.nextOrderIn -= dt;
      if (state.nextOrderIn <= 0) {
        if (spawnOrder()) events |= EVENT_NONE;
        state.nextOrderIn = orderInterval();
      }

      for (let i = state.orders.length - 1; i >= 0; i -= 1) {
        const order = state.orders[i];
        order.patience -= dt;
        if (order.patience <= 0) {
          state.orders.splice(i, 1);
          state.hearts -= 1;
          state.failed += 1;
          state.combo = 0;
          events |= EVENT_EXPIRED;
          say('Order expired — a customer walked out');
          if (state.hearts <= 0) {
            state.over = true;
            state.won = false;
            events |= EVENT_OVER;
          }
        }
      }

      for (const station of ['grill', 'chop', 'pot']) {
        for (const slot of state[station]) {
          if (!slot) continue;
          if (slot.state === 'working') {
            slot.progress += dt;
            if (slot.progress >= slot.duration) {
              slot.state = 'done';
              slot.overcook = 0;
              state.readyFlash = 0.6;
              events |= EVENT_READY;
            }
          } else if (slot.state === 'done' && station === 'grill') {
            slot.overcook += dt;
            if (slot.overcook >= GRILL_BURN_AFTER) {
              slot.state = 'burnt';
              events |= EVENT_BURNT;
              say('The patty burnt!');
            }
          }
        }
      }

      for (const particle of state.particles) {
        particle.age += dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 260 * dt;
      }
      state.particles = state.particles.filter((p) => p.age < p.life);
      for (const float of state.floats) {
        float.age += dt;
        float.y -= 34 * dt;
      }
      state.floats = state.floats.filter((f) => f.age < f.life);

      if (!state.over && state.shiftLeft <= 0) {
        state.over = true;
        state.won = state.coins >= COIN_TARGET;
        events |= EVENT_OVER;
      }
      return events;
    },
  };

  return world;
}
