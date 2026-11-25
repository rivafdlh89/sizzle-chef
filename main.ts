// Sizzle Chef — the hand-in program (Node 22, standard library only). The game
// is this directory's game/ folder, plain static files a desktop browser loads
// offline (game/index.html and its ES modules, no library and no network
// request), and the program hands it in: it copies game/ and screenshots/
// from beside this file to /output and writes /output/dossier.json, the summary
// the judge reads, with the vendored make.fun library.
//
// Build record (25 Nov 2026, builder session):
// - v1: Sizzle Chef, a complete cooking game — orders with patience timers,
//   7 ingredients, chop/grill/boil stations, 2 assembly plates, serve bell,
//   coins, tips, combos, 3 hearts, a 150-second shift with a $120 target.
// - 4 screenshots, real renders of the game's own code in headless Chromium
//   (?shot=cover|cook|serve|rush&seed=7), 1280x800 JPEG, each under 256 KiB.
// - The game was play-tested headlessly in Node: a burger served for $25,
//   a pasta for $31 with a combo, a patty burnt on the grill, orders expiring
//   when ignored, the shift ending at $0 hearts or at 0:00.
// - Verification run (25 Nov 2026, builder): main.ts run twice with
//   MAKEFUN_OUTPUT_DIR, both outputs byte-identical (diff -r clean);
//   dossier.json 759,716 bytes, 4 screenshots + 11 game files copied.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
