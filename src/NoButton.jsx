import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import { animals } from './animals.js';
import Fx from './Fx.jsx';

const rand = (a, b) => a + Math.random() * (b - a);
const W = 124, H = 56;          // fixed button size so layout never jumps when the animal changes
let fxId = 0;

export default function NoButton({ cardRef, slotRef, onDodge, onHide, onPeek, hidden }) {
  const x = useMotionValue(0), y = useMotionValue(0), rotate = useMotionValue(0);
  const scaleX = useMotionValue(1), scaleY = useMotionValue(1);
  const shx = useMotionValue(0), shy = useMotionValue(0), shScale = useMotionValue(1), shOp = useMotionValue(.25);

  const [animal, setAnimal] = useState(null);
  const [fx, setFx] = useState([]);
  const [z, setZ] = useState(10);
  const s = useRef({ pos: { x: 0, y: 0 }, moved: false, busy: false, hiding: false, last: -1, order: [] });

  const spawn = useCallback((kind, px, py, extra = {}) => {
    setFx(list => [...list.slice(-40), { id: ++fxId, kind, x: px, y: py, dx: rand(-14, 14), ...extra }]);
  }, []);

  const setPose = (px, py, r = 0, sx = 1, sy = 1) => {
    x.set(px); y.set(py); rotate.set(r); scaleX.set(sx); scaleY.set(sy);
    shx.set(px + W / 2 - 34); shy.set(py + H - 6);
  };

  const placeAtSlot = useCallback(() => {
    const slot = slotRef.current;
    if (!slot) return;
    slot.style.width = W + 'px'; slot.style.height = H + 'px';
    const r = slot.getBoundingClientRect();
    s.current.pos = { x: r.left, y: r.top };
    setPose(r.left, r.top);
  }, [slotRef]); // eslint-disable-line react-hooks/exhaustive-deps

  // (re)start at the slot next to the Yes button; the slot may not be mounted yet after a replay
  useLayoutEffect(() => {
    if (hidden) return;
    const st = s.current;
    Object.assign(st, { moved: false, busy: false, hiding: false });
    setZ(10); setAnimal(null);
    let tries = 0, timer, raf;
    // the card floats, tilts and springs in, so stay glued to the slot until the first dodge
    const glue = () => {
      if (s.current.moved) return;
      const r = slotRef.current?.getBoundingClientRect();
      if (r) { s.current.pos = { x: r.left, y: r.top }; setPose(r.left, r.top); }
      raf = requestAnimationFrame(glue);
    };
    const init = () => {
      if (!slotRef.current && tries++ < 40) { timer = setTimeout(init, 50); return; }
      placeAtSlot();
      animate(scaleX, [0, 1], { type: 'spring', stiffness: 300, damping: 12 });   // pop in
      animate(scaleY, [0, 1], { type: 'spring', stiffness: 300, damping: 12 });
      glue();
    };
    init();
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [hidden, placeAtSlot]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextAnimal = () => {
    const st = s.current;
    if (!st.order.length) {
      st.order = animals.map((_, i) => i).sort(() => Math.random() - .5);
      if (st.order[st.order.length - 1] === st.last) st.order.reverse();
    }
    return animals[(st.last = st.order.pop())];
  };

  const pickTarget = (a) => {
    const vw = innerWidth, vh = innerHeight, m = 14, st = s.current;
    const cx = v => Math.max(m, Math.min(vw - W - m, v));
    const cy = v => Math.max(m, Math.min(vh - H - m, v));
    const scale = Math.min(1, Math.max(.45, vw / 900));          // shorter hops on phones
    const lo = a.dist[0] * scale, hi = a.dist[1] * scale;
    if (a.horizontal) {
      const dist = rand(lo, hi), dir = st.pos.x > vw / 2 ? -1 : 1;
      let tx = cx(st.pos.x + dir * dist);
      if (Math.abs(tx - st.pos.x) < 80) tx = cx(st.pos.x - dir * dist);
      return { x: tx, y: st.pos.y };
    }
    const c = cardRef.current.getBoundingClientRect();
    if (Math.random() < .32 && a.dist[0] > 150) {                // hide behind the card
      return { x: c.left + c.width / 2 - W / 2 + rand(-50, 50), y: c.top + c.height / 2 - H / 2 + rand(-50, 50), hide: true };
    }
    for (let i = 0; i < 50; i++) {
      const tx = rand(m, vw - W - m), ty = rand(m, vh - H - m);
      const d = Math.hypot(tx - st.pos.x, ty - st.pos.y);
      if (d >= lo && d <= hi) return { x: tx, y: ty };
    }
    const ang = rand(0, Math.PI * 2), dist = rand(lo, hi);
    return { x: cx(st.pos.x + Math.cos(ang) * dist), y: cy(st.pos.y + Math.sin(ang) * dist) };
  };

  const peek = useCallback(() => {
    const st = s.current;
    if (!st.hiding || st.busy) return;
    st.hiding = false;
    const c = cardRef.current.getBoundingClientRect();
    const below = c.bottom + H * .6 < innerHeight;
    const tx = c.left + c.width / 2 - W / 2 + rand(-70, 70);
    const ty = below ? c.bottom - H * .42 : c.top - H * .58;
    st.pos = { x: tx, y: ty };
    animate(x, tx, { type: 'spring', stiffness: 160, damping: 11, velocity: 0 });
    animate(y, ty, { type: 'spring', stiffness: 160, damping: 9, velocity: 0 });
    animate(rotate, [0, -10, 8, 0], { duration: .6 });
    shx.set(tx + W / 2 - 34); shy.set(ty + H - 6);
    onPeek();
  }, [cardRef, onPeek]); // eslint-disable-line react-hooks/exhaustive-deps

  const dodge = useCallback(async () => {
    const st = s.current;
    if (st.busy || hidden) return;
    st.busy = true; st.hiding = false;
    st.moved = true;

    const a = nextAnimal();
    setAnimal(a);
    onDodge(a);

    const start = { ...st.pos };
    spawn('poof', start.x + W / 2, start.y + H / 2);
    for (let i = 0; i < 3; i++) spawn('sparkle', start.x + W / 2 + rand(-40, 40), start.y + H / 2 + rand(-30, 30));

    const tgt = pickTarget(a);
    setZ(tgt.hide ? 1 : 10);                                   // only slips behind the card when it means to hide
    const dx = tgt.x - start.x, dy = tgt.y - start.y, len = Math.hypot(dx, dy) || 1;
    const d = { dx, dy, len, px: -dy / len, py: dx / len };
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    if (a.windup) {                                            // anticipation: crouch before launch
      await Promise.all([
        animate(scaleY, .68, { duration: a.windup / 1000, ease: 'easeOut' }),
        animate(scaleX, 1.22, { duration: a.windup / 1000, ease: 'easeOut' }),
      ]);
    }

    let lastK = null, lastFx = 0;
    await new Promise(resolve => {
      animate(0, 1, {
        duration: a.dur / 1000, ease: 'linear', onComplete: resolve,
        onUpdate: t => {
          const p = a.step(t, d);
          const bx = start.x + dx * p.p, by = start.y + dy * p.p;
          const ox = p.ox || 0, oy = p.oy || 0;
          setPose(bx + ox, by + oy, p.r || 0, p.sx || 1, p.sy || 1);

          // shadow stays on the ground; shrinks and fades as the animal leaves it
          const lift = a.lateral ? 0 : Math.max(0, -oy);
          shx.set(bx + ox + W / 2 - 34); shy.set(by + (a.lateral ? oy : 0) + H - 6);
          shScale.set(1 / (1 + lift / 140)); shOp.set(.25 / (1 + lift / 90));

          const feetY = by + (a.lateral ? oy : 0) + H - 4, midY = by + oy + H / 2, midX = bx + ox + W / 2;
          if (a.land && p.k !== undefined && lastK !== null && p.k !== lastK) spawn(a.land, midX, feetY);
          lastK = p.k ?? lastK;
          if (a.fx) {
            const now = performance.now();
            if (now - lastFx > a.fx.every) {
              lastFx = now;
              const feet = a.fx.at === 'feet';
              spawn(a.fx.kind, feet ? midX : midX - Math.cos(angle * Math.PI / 180) * 40, feet ? feetY : midY, { angle: a.fx.kind === 'speed' ? angle : (a.fx.kind === 'foot' ? angle + 90 : 0) });
            }
          }
        },
      });
    });

    st.pos = { x: tgt.x, y: tgt.y };
    setPose(tgt.x, tgt.y, 0, 1.28, .72);                       // landing squash, then spring back
    shScale.set(1); shOp.set(.25);
    if (a.land) spawn(a.land, tgt.x + W / 2, tgt.y + H - 4);
    animate(scaleX, 1, { type: 'spring', stiffness: 420, damping: 11, velocity: 0 });
    animate(scaleY, 1, { type: 'spring', stiffness: 420, damping: 11, velocity: 0 });
    setTimeout(() => { st.busy = false; }, 120);

    if (tgt.hide) {
      st.hiding = true;
      onHide();
      setTimeout(peek, 1700);
    }
  }, [hidden, onDodge, onHide, peek, spawn]); // eslint-disable-line react-hooks/exhaustive-deps

  // the button also bolts when the mouse gets close, not just when it touches it
  const dodgeRef = useRef(dodge);
  dodgeRef.current = dodge;
  useEffect(() => {
    const onMove = e => {
      const st = s.current;
      if (e.pointerType !== 'mouse' || st.busy || st.hiding || !st.moved) return;
      const d = Math.hypot(e.clientX - (st.pos.x + W / 2), e.clientY - (st.pos.y + H / 2));
      if (d < 78) dodgeRef.current();
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const st = s.current;
      if (!st.moved) return placeAtSlot();
      const px = Math.max(8, Math.min(innerWidth - W - 8, st.pos.x)), py = Math.max(8, Math.min(innerHeight - H - 8, st.pos.y));
      st.pos = { x: px, y: py }; setPose(px, py);
    };
    addEventListener('resize', onResize);
    document.fonts?.ready.then(() => { if (!s.current.moved) placeAtSlot(); });
    return () => removeEventListener('resize', onResize);
  }, [placeAtSlot]); // eslint-disable-line react-hooks/exhaustive-deps

  if (hidden) return null;
  return (
    <>
      <motion.div className="shadow" style={{ x: shx, y: shy, scale: shScale, opacity: shOp, zIndex: z === 10 ? 9 : 1 }} />
      <motion.button
        className="no" style={{ x, y, rotate, scaleX, scaleY, zIndex: z, width: W, height: H }}
        onPointerEnter={dodge}
        onPointerDown={e => { e.preventDefault(); dodge(); }}
        onClick={e => e.preventDefault()}
      >
        <span className="emo">
          <AnimatePresence>
            {animal && (
              <motion.span
                key={animal.e}
                initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 120 }}
                transition={{ type: 'spring', stiffness: 500, damping: 12 }}
              >
                {animal.e}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        No
      </motion.button>
      {fx.map(item => <Fx key={item.id} item={item} onDone={() => setFx(l => l.filter(i => i.id !== item.id))} />)}
    </>
  );
}
