// libretro's databases and thumbnails, both from raw.githubusercontent.com, which answers
// cross-origin requests. thumbnails.libretro.com serves the same images and sends no
// access-control-allow-origin header at all, so a page can fetch it and still not read a byte.

const DAT = 'https://raw.githubusercontent.com/libretro/libretro-database/master/metadat/no-intro/';
const THUMBS = 'https://raw.githubusercontent.com/libretro-thumbnails/';

// One database and one thumbnail repository per system, under libretro's own name for it:
// spaces in the database file, underscores in the repository. The card folder a rom sits in picks
// the system, so a .gbc filed under GB is looked up in the Game Boy database — slot decides a
// platform by where a file is, and the studio does not second-guess it by extension. slotPlus's
// WonderSwan and NeoGeo Pocket folders each hold two systems, and there the extension says which.
const NAMES = {
  GBA: 'Nintendo - Game Boy Advance',
  GB: 'Nintendo - Game Boy',
  GBC: 'Nintendo - Game Boy Color',
  WS: 'Bandai - WonderSwan',
  Lynx: 'Atari - Lynx',
  GG: 'Sega - Game Gear',
  NGP: 'SNK - Neo Geo Pocket',
  TG16: 'NEC - PC Engine - TurboGrafx 16',
  NDS: 'Nintendo - Nintendo DS',
};
const BY_EXTENSION = {
  WS: { wsc: 'Bandai - WonderSwan Color' },
  NGP: { ngc: 'SNK - Neo Geo Pocket Color', ngpc: 'SNK - Neo Geo Pocket Color' },
};

// The database a cart is looked up in, from its card folder and its file's extension.
export function dbFor(platform, ext) {
  return BY_EXTENSION[platform]?.[ext] ?? NAMES[platform];
}

// Each game's 4-letter game code, as a DS rom's header carries it at 0x0C, to the checksum of the
// game's first dump. The DS database lists the code as the game's serial; a code several releases
// share (a revision, a re-release) keeps the first one listed, and a Virtual Console or demo
// release only stands in when nothing else carries the code.
export function serialIndex(text) {
  const out = new Map();
  const spare = new Map();
  for (const [, body] of text.matchAll(/game \(\n([\s\S]*?)\n\)/g)) {
    const name = body.match(/^\s*name "([^"]*)"/m)?.[1] ?? '';
    const serial = body.match(/^\s*serial "([A-Z0-9]{4})"/m)?.[1];
    const crc = body.match(/\bcrc ([0-9A-Fa-f]{8})\b/)?.[1];
    if (!serial || !crc) continue;
    const into = /\((Virtual Console|Demo|Kiosk|Wii U Virtual Console)\)/.test(name) ? spare : out;
    if (!into.has(serial)) into.set(serial, parseInt(crc, 16));
  }
  for (const [serial, crc] of spare) if (!out.has(serial)) out.set(serial, crc);
  return out;
}

export async function fetchDat(db) {
  const r = await fetch(`${DAT}${encodeURIComponent(db)}.dat`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

// A card can hold hundreds of carts, each wanting two images, and GitHub is not a CDN.
export function limiter(slots) {
  let running = 0;
  const waiting = [];
  const pump = () => {
    while (running < slots && waiting.length) {
      const { job, resolve, reject } = waiting.shift();
      running++;
      job()
        .then(resolve, reject)
        .finally(() => {
          running--;
          pump();
        });
    }
  };
  return (job) =>
    new Promise((resolve, reject) => {
      waiting.push({ job, resolve, reject });
      pump();
    });
}

// A set of our own, hosted as static files: <platform>/<media>/<CRC32>.png, with an index.json
// mapping a rom's checksum to what it holds. Looked up by checksum rather than by name, so it
// needs no agreement about spelling and reaches roms No-Intro has never heard of. It is a
// separate origin from the page, so whatever serves it has to allow the read.
export async function fetchIndex(base) {
  const r = await fetch(new URL('index.json', base));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function fetchArt(base, path) {
  const r = await fetch(new URL(path, base));
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}

// A thumbnail's bytes, or null when libretro has none. A git symlink comes back as a one-line
// body naming its target in the same folder; `stubTarget`, from the Rust side, tells the two apart.
export async function fetchThumb(db, folder, name, stubTarget) {
  const repo = db.replaceAll(' ', '_');
  const get = async (file) => {
    const r = await fetch(`${THUMBS}${repo}/master/${folder}/${encodeURIComponent(file)}`);
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return new Uint8Array(await r.arrayBuffer());
  };
  const body = await get(`${name}.png`);
  if (!body) return null;
  const target = stubTarget(body);
  return target === undefined ? body : get(target);
}
