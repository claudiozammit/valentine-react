// Each animal defines how the "No" button travels.
// step(t, d) -> pose: p = progress along the path (0..1), ox/oy = offset (px), r = rotation (deg),
// sx/sy = squash & stretch, k = segment index (used to detect landings).
// lateral: offsets are sideways wiggles on the ground (so the shadow follows them) instead of height.
// fx: continuous trail; land: effect spawned on every landing.

export const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t, n = 3) => 1 - Math.pow(1 - t, n);
const smooth = x => x * x * (3 - 2 * x);
const dirOf = d => (d.dx >= 0 ? 1 : -1);

// Bouncy hops with anticipation squash, stretch in the air, squash on landing.
// pause: fraction of each cycle spent in the air (the rest is a crouch), omit for continuous bounces.
const hopper = ({ arc, per, pause }) => (t, d) => {
  const n = Math.max(2, Math.round(d.len / per));
  const u = t * n;
  const k = Math.min(n - 1, Math.floor(u));
  const f = Math.min(1, u - k);
  const j = pause ? Math.min(1, f / pause) : f;
  const s = Math.sin(Math.PI * j);
  const q = pause
    ? (f > pause ? Math.sin(Math.PI * (f - pause) / (1 - pause)) : 0)
    : Math.max(0, 1 - f / .16, (f - .84) / .16);
  const air = pause ? f < pause : true;
  return {
    k,
    p: (k + ease(j)) / n,
    oy: -s * arc,
    sx: 1 - .14 * s + .32 * q,
    sy: 1 + .26 * s - .34 * q,
    r: air ? -dirOf(d) * 14 * Math.cos(Math.PI * j) : 0,
  };
};

export const animals = [
  {
    e: '🐰', say: 'hop hop hop!', dur: 1150, dist: [200, 420], windup: 140,
    step: hopper({ arc: 55, per: 80 }), land: 'puff',
  },
  {
    e: '🐸', say: 'ribbit! *BIG jump*', dur: 1500, dist: [260, 480], windup: 200,
    step: hopper({ arc: 150, per: 240, pause: .62 }), land: 'splash',
  },
  {
    e: '🦘', say: 'boing boing boing', dur: 1350, dist: [320, 560], windup: 160,
    step: hopper({ arc: 200, per: 270 }), land: 'puff',
  },
  {
    e: '🐌', say: 'sloooow... but you still can\'t catch me', dur: 3200, dist: [90, 180],
    step: t => ({ p: t, sx: 1 + .09 * Math.sin(t * 22), sy: 1 - .07 * Math.sin(t * 22) }),
    fx: { kind: 'slime', every: 150, at: 'feet' },
  },
  {
    e: '🐍', say: 'sssslithering away', dur: 1900, dist: [280, 480], lateral: true,
    step: (t, d) => {
      const w = Math.sin(t * Math.PI * 6) * 50 * Math.sin(Math.PI * Math.min(1, t * 1.1));
      return { p: ease(t), ox: d.px * w, oy: d.py * w, r: Math.cos(t * Math.PI * 6) * 24 };
    },
    fx: { kind: 'sparkle', every: 160, at: 'feet' },
  },
  {
    e: '🦀', say: 'scuttle scuttle (sideways only)', dur: 1300, dist: [220, 440], horizontal: true,
    step: t => ({
      p: t + Math.sin(t * 48) * .012,
      oy: -Math.abs(Math.sin(t * Math.PI * 12)) * 7,
      r: Math.sin(t * 60) * 7,
      sx: 1 + Math.sin(t * 60) * .06,
    }),
    fx: { kind: 'bubble', every: 130, at: 'center' },
  },
  {
    e: '🐆', say: 'ZOOM', dur: 520, dist: [480, 800], windup: 220,
    step: t => ({ p: easeOut(t, 3.5), sx: 1 + .4 * Math.sin(Math.PI * Math.pow(t, .6)), sy: 1 - .15 * Math.sin(Math.PI * t) }),
    fx: { kind: 'speed', every: 38, at: 'center' }, land: 'puff',
  },
  {
    e: '🦅', say: 'swooooosh', dur: 1900, dist: [320, 600], lateral: false,
    step: t => ({
      p: ease(t),
      oy: -Math.sin(Math.PI * t) * 130 + Math.sin(t * Math.PI * 12) * 9,
      r: Math.sin(t * Math.PI * 12) * 11,
      sy: 1 + Math.sin(t * Math.PI * 12) * .08,
    }),
    fx: { kind: 'feather', every: 170, at: 'center' },
  },
  {
    e: '🐧', say: 'belly slide!', dur: 1000, dist: [320, 540], windup: 120,
    step: (t, d) => ({
      p: easeOut(t, 2.6),
      r: dirOf(d) * 82 * smooth(Math.min(1, t * 8)) * (1 - smooth(Math.max(0, (t - .82) / .18))),
    }),
    fx: { kind: 'snow', every: 50, at: 'feet' },
  },
  {
    e: '🦆', say: 'waddle waddle', dur: 1900, dist: [220, 380],
    step: (t, d) => {
      const a = t * Math.PI * 2 * Math.max(3, d.len / 38);
      return { p: t, r: Math.sin(a) * 20, oy: -Math.abs(Math.sin(a)) * 5, sy: 1 + Math.cos(a * 2) * .04 };
    },
    fx: { kind: 'foot', every: 230, at: 'feet' },
  },
  {
    e: '🐿️', say: 'zig zag, acorn!', dur: 1150, dist: [280, 480], lateral: true,
    step: (t, d) => {
      const w = (Math.abs(((t * 6) % 2) - 1) * 2 - 1) * 46;
      return { p: ease(t), ox: d.px * w, oy: d.py * w, r: w * .4 };
    },
    fx: { kind: 'acorn', every: 120, at: 'center' },
  },
  {
    e: '🦋', say: 'flutter flutter~', dur: 2500, dist: [260, 480], lateral: true,
    step: (t, d) => {
      const a = t * Math.PI * 4;
      const w = Math.sin(a) * 60;
      return { p: ease(t), ox: d.px * w, oy: d.py * w + Math.sin(a * 2) * 28, r: Math.sin(a) * 18, sx: 1 + Math.sin(a * 6) * .18 };
    },
    fx: { kind: 'sparkle', every: 90, at: 'center' },
  },
];
