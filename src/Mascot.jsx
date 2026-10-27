import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// A little bear whose eyes follow the cursor and whose mood tracks how rejected it feels.
const MOUTH = { happy: 82, calm: 75, hopeful: 68, sad: 58 };

export default function Mascot({ mood }) {
  const ref = useRef(null);
  const lx = useMotionValue(0), ly = useMotionValue(0);
  const px = useSpring(lx, { stiffness: 200, damping: 18 });
  const py = useSpring(ly, { stiffness: 200, damping: 18 });

  useEffect(() => {
    const onMove = e => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, m = Math.min(3.4, d / 40);
      lx.set((dx / d) * m); ly.set((dy / d) * m);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [lx, ly]);

  const happy = mood === 'happy', sad = mood === 'sad';
  const q = MOUTH[mood] ?? MOUTH.calm;

  return (
    <motion.svg
      ref={ref} className="mascot" viewBox="0 0 100 100" aria-hidden
      animate={happy ? { y: [0, -10, 0], rotate: [0, -4, 4, 0] } : { y: 0, rotate: 0 }}
      transition={happy ? { duration: .6, repeat: Infinity } : { type: 'spring', stiffness: 200, damping: 12 }}
    >
      {/* ears */}
      <motion.g animate={{ rotate: sad ? 14 : 0 }} style={{ originX: '24px', originY: '30px' }}>
        <circle cx="24" cy="26" r="13" fill="#e8a27c" /><circle cx="24" cy="26" r="7" fill="#ffc9b0" />
      </motion.g>
      <motion.g animate={{ rotate: sad ? -14 : 0 }} style={{ originX: '76px', originY: '30px' }}>
        <circle cx="76" cy="26" r="13" fill="#e8a27c" /><circle cx="76" cy="26" r="7" fill="#ffc9b0" />
      </motion.g>
      {/* head */}
      <circle cx="50" cy="55" r="38" fill="#f4b896" />
      <ellipse cx="50" cy="66" rx="17" ry="13" fill="#ffe3d0" />
      {/* blush */}
      <motion.ellipse cx="25" cy="64" rx="7" ry="4.5" fill="#ff7aa5" animate={{ opacity: happy ? .9 : .5 }} />
      <motion.ellipse cx="75" cy="64" rx="7" ry="4.5" fill="#ff7aa5" animate={{ opacity: happy ? .9 : .5 }} />
      {/* eyes */}
      {[36, 64].map(cx => (
        <g key={cx}>
          <g className="blink">
            <circle cx={cx} cy="50" r="9" fill="#fff" />
            <motion.circle cx={cx} cy="50" r="5" fill="#3b2230" style={{ x: px, y: py }} animate={{ opacity: happy ? 0 : 1 }} />
            <motion.circle cx={cx + 1.8} cy="48.2" r="1.8" fill="#fff" style={{ x: px, y: py }} animate={{ opacity: happy ? 0 : 1 }} />
            <motion.text x={cx} y="55" textAnchor="middle" fontSize="14" animate={{ opacity: happy ? 1 : 0, scale: happy ? [0, 1.3, 1] : 0 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
              💖
            </motion.text>
          </g>
          {/* worried brows */}
          <motion.path
            d={`M${cx - 8} 38 L${cx + 8} 38`} stroke="#8a4f3a" strokeWidth="2.4" strokeLinecap="round"
            style={{ transformOrigin: `${cx}px 38px` }}
            animate={{ rotate: (mood === 'hopeful' || sad) ? (cx < 50 ? -16 : 16) : 0, opacity: (mood === 'hopeful' || sad) ? 1 : 0 }}
          />
        </g>
      ))}
      {/* nose + mouth */}
      <ellipse cx="50" cy="62" rx="4.5" ry="3.2" fill="#3b2230" />
      <motion.path
        initial={false} fill="none" stroke="#3b2230" strokeWidth="2.6" strokeLinecap="round"
        animate={{ d: `M40 69 Q50 ${q} 60 69` }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}
      />
      {/* tears */}
      {sad && [30, 70].map((cx, i) => (
        <motion.ellipse
          key={cx} cx={cx} cy="56" rx="2.4" ry="3.4" fill="#7cc8ff"
          animate={{ y: [0, 22], opacity: [1, 0], scale: [1, .7] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * .5, ease: 'easeIn' }}
        />
      ))}
    </motion.svg>
  );
}
