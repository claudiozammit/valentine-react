import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const TITLE = 'Great, now marry me 💍';
const ORBIT = ['💖', '✨', '💘', '🌸', '💕', '✨'];

function fireConfetti() {
  const hearts = ['💖', '💘', '💕'].map(text => confetti.shapeFromText({ text, scalar: 3 }));
  const base = { shapes: hearts, scalar: 3, ticks: 260, gravity: .8, colors: ['#ff4d8d', '#ff9ec4', '#ffd93b'] };
  confetti({ ...base, particleCount: 60, spread: 110, startVelocity: 48, origin: { x: .5, y: .6 } });
  const end = Date.now() + 2800;
  (function frame() {
    confetti({ ...base, particleCount: 3, angle: 60, spread: 60, origin: { x: 0, y: .75 }, startVelocity: 55 });
    confetti({ ...base, particleCount: 3, angle: 120, spread: 60, origin: { x: 1, y: .75 }, startVelocity: 55 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function Win({ onReplay }) {
  useEffect(() => { fireConfetti(); }, []);

  return (
    <motion.div className="win" initial="hide" animate="show">
      <div className="stage">
        <div className="rays" />
        {ORBIT.map((g, i) => (
          <motion.span
            key={i} className="orbit"
            animate={{ rotate: [i * 60, i * 60 + 360] }} transition={{ duration: 7 + i, repeat: Infinity, ease: 'linear' }}
            style={{ '--r': `${88 + (i % 2) * 22}px` }}
          >
            <span style={{ transform: `translateX(var(--r))` }}>{g}</span>
          </motion.span>
        ))}

        <motion.div
          variants={{ hide: { scale: 0, rotate: -200 }, show: { scale: 1, rotate: 0 } }}
          transition={{ type: 'spring', stiffness: 160, damping: 11, delay: .1 }}
        >
          <motion.svg
            className="smiley" viewBox="0 0 200 200" aria-label="Happy smiley"
            animate={{ y: [0, -18, 0], rotate: [0, 4, -4, 0], scaleY: [1, 1.04, .96, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="100" cy="100" r="90" fill="#ffd93b" stroke="#f2b705" strokeWidth="6" />
            <ellipse cx="52" cy="128" rx="17" ry="10" fill="#ff8fab" opacity=".8" />
            <ellipse cx="148" cy="128" rx="17" ry="10" fill="#ff8fab" opacity=".8" />
            <g className="blink"><ellipse cx="70" cy="84" rx="11" ry="16" fill="#4a2a1a" /><circle cx="74" cy="77" r="4.5" fill="#fff" /></g>
            {/* winking eye */}
            <motion.g
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              animate={{ scaleY: [1, 1, .08, 1, 1] }} transition={{ duration: 2.4, repeat: Infinity, times: [0, .5, .55, .65, 1] }}
            >
              <ellipse cx="130" cy="84" rx="11" ry="16" fill="#4a2a1a" /><circle cx="134" cy="77" r="4.5" fill="#fff" />
            </motion.g>
            <motion.path
              fill="#7a1f1f" stroke="#4a2a1a" strokeWidth="5" strokeLinejoin="round"
              animate={{ d: ['M56 116 Q100 178 144 116 Z', 'M56 116 Q100 160 144 116 Z', 'M56 116 Q100 178 144 116 Z'] }}
              transition={{ duration: .55, repeat: Infinity, ease: 'easeInOut' }}
            />
            <path d="M78 146 Q100 133 122 146 Q100 166 78 146Z" fill="#ff6b8b" />
          </motion.svg>
        </motion.div>
      </div>

      <h2 aria-label={TITLE}>
        {TITLE.split(' ').map((ch, i) => (
          <motion.span
            key={i} style={{ display: 'inline-block', margin: '0 .15em' }}
            variants={{ hide: { y: 40, opacity: 0 }, show: { y: 0, opacity: 1 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 9, delay: .5 + i * .07 }}
          >
            {ch}
          </motion.span>
        ))}
      </h2>
      <motion.p variants={{ hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} transition={{ delay: 1.1 }}>
        She said yes!! 🎉💖
      </motion.p>
      <motion.button
        className="replay" variants={{ hide: { opacity: 0 }, show: { opacity: .6 } }} transition={{ delay: 2 }}
        whileHover={{ opacity: 1 }} onClick={onReplay}
      >
        ↺ play again
      </motion.button>
    </motion.div>
  );
}
