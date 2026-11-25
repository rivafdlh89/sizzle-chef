[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/rivafdlh89/sizzle-chef/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/rivafdlh89/sizzle-chef/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Bounty: [best-cooking-game-20261125-0137 on make.fun](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Sizzle Chef — one shift, no shortcuts

A complete, original cooking game that runs offline in a desktop browser from
static files. You run the kitchen for one 150-second shift: take orders, chop,
grill and boil, assemble plates, and serve before the ticket runs out — and
before the patty burns. Reach **$120** before the clock hits 0:00.

## How to play

- **Orders** arrive on the board up top, each with a recipe and a patience bar.
  Serve it in time for the full price plus a tip; let it expire and a customer
  walks out (lose a heart — three strikes ends the shift).
- **Ingredients** sit on the counter along the bottom (keys **1–7** or click):
  Bun, Patty, Lettuce, Tomato, Cheese, Noodle, Sauce.
- **Cook them**: Patty goes on the **Grill** (4s — leave it and it burns),
  Lettuce / Tomato / Cheese on the **Chop Board**, Noodle in the **Pot** (3s).
  Bun and Sauce are ready to plate as they are.
- **Assemble** on one of the two **Plates**. A plate whose contents exactly
  match a waiting order glows **READY!** — click it (or press **Space**, or ring
  the **Serve** bell) to serve it.
- **Score**: dish price + a tip for fast service, and a combo bonus for serving
  again within 8 seconds (up to x4).

Controls: mouse to click everything; **1–7** pick ingredients, **Space** serve,
**P** pause, **T** trash what you are holding, **C** clear a plate, **M** mute,
**R** restart after the shift ends. Sound is tiny WebAudio bleeps made in code.

## Recipes

| Dish | Needs | Price |
| --- | --- | --- |
| Classic Burger | Bun + Grilled patty + Chopped lettuce | $18 |
| Tomato Pasta | Boiled noodle + Sauce + Chopped cheese | $20 |
| Garden Salad | Chopped lettuce + Chopped tomato + Chopped cheese | $14 |
| Cheesy Melt | Bun + Grilled patty + Chopped cheese | $22 |

## Files

- `game/index.html` — the page; `game/src/` — one clear job per file:
  `config.js` (layout and tuning), `recipes.js` (ingredients and dishes),
  `random.js` (seeded RNG), `world.js` (rules, no DOM), `input.js` (mouse and
  keyboard), `render.js` (all the art, drawn in code), `audio.js` (WebAudio
  bleeps), `shots.js` (screenshot scenes), `main.js` (boot and the loop).
- `screenshots/` — 4 real renders of the game's own code in headless Chromium
  (`?shot=cover|cook|serve|rush&seed=7`), 1280×800 JPEG. The first by name is
  the cover.
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with the vendored
  `vendor/makefun-game.ts` (unchanged from the kit).
- `LICENSE` — MIT.

## Play it

```sh
node serve.ts   # serves game/ on http://localhost:8080
```

Or open `game/index.html` from any static server. No network, no build step.

## Build notes

- Built 25 Nov 2026 for make.fun's `best-cooking-game-20261125-0137` bounty.
- Play-tested headlessly in Node against the real rules: a burger served for
  $25, a pasta for $31 with a combo, a patty burnt after 10s on the grill,
  orders expiring when ignored, the shift ending on 0 hearts or at 0:00.
- `?seed=N` fixes the order pattern; `?shot=cover|cook|serve|rush` stages a
  scene from the real game state for a screenshot.
