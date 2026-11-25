// Sizzle Chef — the screenshot scenes behind ?shot=cover|cook|serve|rush.
// Each one builds a real game state through the world's own functions and
// fields, then the real renderer paints it, so a frame is what a short game
// really looks like — and the same seed always gives the same frame.
import { SCREEN_PLAY } from './render.js';

function stationSlot(kind, progress, duration, state) {
  return { kind, progress, duration, state, overcook: 0 };
}

/**
 * Set `world` to the named scene and return the screen to draw over it and the
 * best score to show.
 */
export function stageShot(name, world) {
  const state = world.state;
  world.reset();
  if (name === 'cook') {
    world.spawnOrder('salad');
    world.spawnOrder('burger');
    state.grill[0] = stationSlot('patty', 2, 4, 'working');
    state.grill[1] = stationSlot('patty', 4, 4, 'done');
    state.pot[0] = stationSlot('noodle', 1.5, 3, 'working');
    state.chop[0] = stationSlot('tomato', 2, 2, 'done');
    state.hand = 'patty';
    state.coins = 34;
    state.served = 2;
    state.shiftLeft = 110;
    return { screen: SCREEN_PLAY, best: 96 };
  }
  if (name === 'serve') {
    world.spawnOrder('pasta');
    state.plates[0].items = ['boiled-noodle', 'sauce', 'chopped-cheese'];
    state.grill[0] = stationSlot('patty', 4, 4, 'done');
    state.coins = 128;
    state.served = 7;
    state.combo = 3;
    state.comboLeft = 6;
    state.shiftLeft = 40;
    state.floats.push({ x: 965, y: 420, text: '+$24', color: '#2e9e5b', age: 0.2, life: 1.2 });
    state.floats.push({ x: 965, y: 394, text: 'COMBO x3', color: '#d63c2f', age: 0.2, life: 1.2 });
    for (let i = 0; i < 14; i += 1) {
      state.particles.push({
        x: 965, y: 268, vx: (i - 7) * 22, vy: -40 - i * 6,
        life: 1, age: 0.2, color: '#f2b705', size: 4,
      });
    }
    return { screen: SCREEN_PLAY, best: 128 };
  }
  if (name === 'rush') {
    world.spawnOrder('burger');
    world.spawnOrder('pasta');
    world.spawnOrder('salad');
    state.orders[0].patience = 8;
    state.orders[1].patience = 14;
    state.orders[2].patience = 20;
    state.grill[0] = stationSlot('patty', 4, 4, 'burnt');
    state.pot[0] = stationSlot('noodle', 3, 3, 'done');
    state.chop[0] = stationSlot('lettuce', 1.4, 2, 'working');
    state.plates[0].items = ['bun', 'grilled-patty'];
    state.hand = 'chopped-lettuce';
    state.coins = 96;
    state.served = 6;
    state.failed = 2;
    state.hearts = 1;
    state.shiftLeft = 55;
    return { screen: SCREEN_PLAY, best: 128 };
  }
  // cover (default): the whole game in one frame — order board, ingredients,
  // a dish mid-assembly, a plate ready to serve, the timer and the coins.
  world.spawnOrder('burger');
  world.spawnOrder('pasta');
  world.spawnOrder('melt');
  state.orders[2].patience = 12;
  state.grill[0] = stationSlot('patty', 3.2, 4, 'working');
  state.pot[0] = stationSlot('noodle', 3, 3, 'done');
  state.chop[0] = stationSlot('lettuce', 1.2, 2, 'working');
  state.plates[0].items = ['bun', 'grilled-patty'];
  state.plates[1].items = ['bun', 'grilled-patty', 'chopped-lettuce'];
  state.hand = 'chopped-lettuce';
  state.coins = 86;
  state.served = 5;
  state.combo = 2;
  state.comboLeft = 5;
  state.shiftLeft = 72;
  return { screen: SCREEN_PLAY, best: 128 };
}
