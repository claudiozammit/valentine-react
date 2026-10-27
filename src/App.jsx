import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Mascot from './Mascot.jsx';
import NoButton from './NoButton.jsx';
import Win from './Win.jsx';

const YES_LABELS = ['Yes! 💖', 'Yes!! 💖💖', 'YES. 💘', 'Say yes 😭', 'YESSS 🫶', 'PLEASE 🥹'];
const SUBS = [
  '',
  'Hm, the No button is feeling playful today.',
  'It seems to be having some kind of... episode.',
  'Fun fact: the No button has never once been clicked.',
  'You are chasing a very athletic button.',
  'The No button has filed for a restraining order.',
  'Nobody has ever caught it. Nobody.',
  'The Yes button is getting very large and very confident.',
];

const HEARTS = Array.from({ length: 22 }, (_, i) => ({
  g: ['💗', '💖', '💕', '🌸', '💞'][i % 5], left: (i * 47) % 100, size: 16 + (i * 13) % 28,
  dur: 10 + (i * 7) % 11, delay: -((i * 5) % 18), sway: 20 + (i * 11) % 40,
}));

export default function App() {
  const [attempts, setAttempts] = useState(0);
  const [line, setLine] = useState('I made you a very serious website. 👉👈');
  const [yesHover, setYesHover] = useState(false);
  const [won, setWon] = useState(false);
  const cardRef = useRef(null), slotRef = useRef(null);
  const bump = useAnimationControls();

  // 3D tilt that follows the pointer
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-1, 1], [7, -7]), { stiffness: 120, damping: 14 });
  const rotateY = useSpring(useTransform(mx, [-1, 1], [-9, 9]), { stiffness: 120, damping: 14 });
  useEffect(() => {
    const onMove = e => { mx.set((e.clientX / innerWidth) * 2 - 1); my.set((e.clientY / innerHeight) * 2 - 1); };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [mx, my]);

  const onDodge = useCallback(a => {
    setAttempts(n => n + 1);
    setLine(a.say);
  }, []);
  const onHide = useCallback(() => {
    setLine('Where did the No button go...? 👀');
    bump.start({ scale: [1, 1.05, .97, 1.02, 1], rotate: [0, -2, 2, -1, 0], transition: { duration: .6 } });
  }, [bump]);
  const onPeek = useCallback(() => setLine('psst... I\'m hiding behind the card 🤫'), []);

  const mood = yesHover ? 'happy' : attempts === 0 ? 'calm' : attempts < 4 ? 'hopeful' : 'sad';
  const yesScale = Math.min(1.4, 1 + attempts * .05);
  const tier = Math.min(YES_LABELS.length - 1, Math.floor(attempts / 2));

  const replay = () => { setWon(false); setAttempts(0); setLine('Round two! Same buttons. Same chaos. 👉👈'); };

  return (
    <>
      <div className="bg" aria-hidden>
        <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
        {HEARTS.map((h, i) => (
          <span key={i} className="bg-heart" style={{ left: `${h.left}vw`, fontSize: h.size, animationDuration: `${h.dur}s`, animationDelay: `${h.delay}s`, '--sway': `${h.sway}px` }}>
            {h.g}
          </span>
        ))}
      </div>

      <div className="center">
        <div className="float" ref={cardRef}>
          <motion.div animate={bump}>
            <motion.div
              className="card"
              style={{ rotateX, rotateY, transformPerspective: 900 }}
              initial={{ y: 80, opacity: 0, scale: .85 }} animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            >
              <AnimatePresence mode="wait">
                {!won ? (
                  <motion.div key="ask" exit={{ scale: .8, opacity: 0, rotate: -6 }} transition={{ duration: .25 }}>
                    <Mascot mood={won ? 'happy' : mood} />
                    <h1>Will you be my Valentine, Nouri?</h1>
                    <div className="say">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={line} initial={{ y: 12, opacity: 0, scale: .9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -12, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          {line}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    <div className="row">
                      <motion.button
                        className="yes"
                        animate={{ scale: yesScale }}
                        whileHover={{ scale: yesScale * 1.1, rotate: [0, -3, 3, -3, 0], transition: { rotate: { duration: .5 } } }}
                        whileTap={{ scale: yesScale * .92 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                        onHoverStart={() => setYesHover(true)} onHoverEnd={() => setYesHover(false)}
                        onClick={() => { setYesHover(false); setWon(true); }}
                      >
                        {YES_LABELS[tier]}
                      </motion.button>
                      <span ref={slotRef} className="slot" />
                    </div>

                    <div className="sub">
                      <AnimatePresence mode="wait">
                        <motion.span key={Math.min(attempts, SUBS.length - 1)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          {SUBS[Math.min(attempts, SUBS.length - 1)]}
                        </motion.span>
                      </AnimatePresence>
                      {attempts > 0 && <small>times dodged: {attempts}</small>}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="win" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Win onReplay={replay} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <NoButton cardRef={cardRef} slotRef={slotRef} hidden={won} onDodge={onDodge} onHide={onHide} onPeek={onPeek} />
    </>
  );
}
