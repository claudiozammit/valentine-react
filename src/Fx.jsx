import { motion } from 'framer-motion';

// Little particles the No button leaves behind. Each kind: how it looks and how it fades away.
const KINDS = {
  puff:    { circle: 'puff', size: 30, a: { scale: [.3, 1.9], opacity: [.85, 0], y: -14 }, dur: .6 },
  poof:    { glyph: '💨', size: 44, a: { scale: [.3, 1.7], opacity: [1, 0], rotate: 25 }, dur: .6 },
  splash:  { glyph: '💦', size: 26, a: { scale: [.3, 1.4], opacity: [1, 0], y: -26 }, dur: .65 },
  slime:   { circle: 'slime', size: 14, a: { scale: [1, .5], opacity: [.7, 0] }, dur: 1.8 },
  bubble:  { glyph: '🫧', size: 18, a: { scale: [.4, 1.1], opacity: [1, 0], y: -44 }, dur: 1 },
  feather: { glyph: '🪶', size: 18, a: { scale: [.6, 1], opacity: [1, 0], y: 60, rotate: 160 }, dur: 1.3 },
  snow:    { glyph: '❄️', size: 15, a: { scale: [.5, 1.1], opacity: [1, 0], y: 26 }, dur: .85 },
  foot:    { glyph: '🐾', size: 16, a: { scale: [.8, 1], opacity: [.8, 0] }, dur: 1.5 },
  acorn:   { glyph: '🌰', size: 16, a: { y: [0, -34, 18], opacity: [1, 1, 0], rotate: 220 }, dur: 1 },
  sparkle: { glyph: '✨', size: 18, a: { scale: [0, 1.25, 0], rotate: 120, opacity: [1, 1, 0] }, dur: .85 },
  speed:   { line: true, size: 46, a: { scaleX: [1, .1], opacity: [.9, 0] }, dur: .38 },
};

// first keyframe of every animated property, so the particle never flashes at full size
const startOf = a => Object.fromEntries(Object.entries(a).map(([key, v]) => [key, Array.isArray(v) ? v[0] : (key === 'scale' ? 1 : 0)]));

export default function Fx({ item, onDone }) {
  const k = KINDS[item.kind];
  const props = {
    initial: startOf(k.a),
    animate: { ...k.a, x: item.dx || 0 },
    transition: { duration: k.dur, ease: 'easeOut' },
    onAnimationComplete: onDone,
  };
  let node;
  if (k.line) {
    node = <motion.div {...props} style={{ width: k.size, height: 5, borderRadius: 3, background: '#fff', rotate: item.angle, transformOrigin: 'right center' }} />;
  } else if (k.circle) {
    node = <motion.div {...props} className={k.circle} style={{ width: k.size, height: k.size }} />;
  } else {
    node = <motion.span {...props} style={{ display: 'block', fontSize: k.size, lineHeight: 1, rotate: item.angle || 0 }}>{k.glyph}</motion.span>;
  }
  return <div className="fx" style={{ left: item.x, top: item.y }}>{node}</div>;
}
