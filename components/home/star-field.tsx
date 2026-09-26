"use client";

import { useEffect, useRef } from "react";

/*
 * ZETRAXUS star field — canvas edition.
 *
 * Same 210 stars, same positions, same float / twinkle / cursor-repel
 * behaviour as the original DOM version, but drawn on ONE canvas:
 *
 *  - before: 210 <span>s, each with two infinite CSS animations (one of
 *    them animating `margin-top`, which forces layout every frame), two
 *    stacked drop-shadow filters, and a getBoundingClientRect() per star on
 *    every mouse move → constant layout + paint work on the main thread.
 *  - now: one rAF loop, ~210 drawImage calls of a pre-rendered glow sprite,
 *    star positions computed from their percentages (no DOM reads), and the
 *    loop fully stops when the hero is off-screen or the tab is hidden.
 */

const STARS: [number, number, number][] = [
  [6, 8, 1.5], [13, 17, 2], [21, 6, 1], [28, 15, 1.5], [36, 9, 2],
  [43, 20, 1], [51, 11, 1.5], [58, 5, 2], [65, 16, 1], [73, 9, 1.5],
  [81, 21, 2], [90, 13, 1],

  [5, 32, 2], [15, 43, 1], [24, 35, 1.5], [33, 48, 2], [42, 31, 1],
  [50, 42, 1.5], [59, 34, 2], [68, 47, 1], [77, 37, 1.5], [87, 45, 2],
  [95, 33, 1],

  [9, 60, 1.5], [19, 72, 2], [29, 62, 1], [38, 78, 1.5], [47, 68, 2],
  [56, 58, 1], [64, 73, 1.5], [74, 63, 2], [83, 76, 1], [93, 67, 1.5],

  [6, 89, 2], [17, 82, 1], [27, 94, 1.5], [37, 86, 2], [46, 96, 1],
  [55, 88, 1.5], [66, 94, 2], [75, 84, 1], [85, 92, 2], [94, 82, 2],

  [11, 12, 1], [18, 24, 1.5], [31, 4, 1], [40, 14, 1.5], [48, 25, 1],
  [57, 19, 1.5], [69, 4, 1], [79, 27, 1.5], [88, 6, 1], [97, 19, 1.5],

  [12, 40, 1], [20, 54, 1.5], [30, 29, 1], [45, 55, 1.5], [54, 47, 1],
  [63, 29, 1.5], [72, 54, 1], [82, 31, 1.5], [91, 52, 1],

  [14, 67, 1], [25, 83, 1.5], [34, 70, 1], [52, 81, 1.5], [61, 66, 1],
  [71, 87, 1.5], [80, 72, 1], [89, 88, 1.5],
];

// 140 extra deterministic stars (identical formula to the previous version).
const EXTRA_STARS: [number, number, number][] = Array.from(
  { length: STARS.length * 2 },
  (_, index) => {
    const x = (index * 37.173 + 2.7) % 100;
    const y = (index * 61.937 + 11.4) % 100;
    const sizes = [1, 1, 1, 1.5, 1.5, 2];
    return [x, y, sizes[index % sizes.length]];
  },
);

const ALL_STARS: [number, number, number][] = [...STARS, ...EXTRA_STARS];

const RADIUS = 240;
const PUSH = 48;
const BASE_OPACITY = 0.3;
// Time constant for easing toward cursor-driven targets (≈ the old 850ms
// cubic-bezier(0.16, 1, 0.3, 1) transition, which is very front-loaded).
const EASE_TAU = 0.16;

interface Star {
  px: number;
  py: number;
  size: number;
  floatDur: number;
  floatDelay: number;
  twinkleDur: number;
  twinkleDelay: number;
  ex: number;
  ey: number;
  scale: number;
  op: number;
}

// Twinkle keyframes from the original CSS: 0 → 1, 22% → .35, 46% → .95,
// 68% → .45, 85% → .85, 100% → 1 (ease-in-out between stops).
const TWINKLE: [number, number][] = [
  [0, 1], [0.22, 0.35], [0.46, 0.95], [0.68, 0.45], [0.85, 0.85], [1, 1],
];

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function twinkleAt(phase: number) {
  for (let i = 1; i < TWINKLE.length; i++) {
    const [p1, v1] = TWINKLE[i];
    if (phase <= p1) {
      const [p0, v0] = TWINKLE[i - 1];
      return v0 + (v1 - v0) * smooth((phase - p0) / (p1 - p0));
    }
  }
  return 1;
}

function positiveMod(value: number, mod: number) {
  return ((value % mod) + mod) % mod;
}

/** Pre-render a glowing dot: solid core + the two soft drop-shadows. */
function makeSprite(size: number, dpr: number) {
  const glow = 6;
  const px = Math.ceil((size + glow * 2) * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext("2d")!;
  const c = px / 2;
  const core = (size / 2) * dpr;

  const halo = ctx.createRadialGradient(c, c, 0, c, c, c);
  halo.addColorStop(0, "rgba(255,255,255,0.55)");
  halo.addColorStop(Math.min(0.99, (core + 2 * dpr) / c), "rgba(255,255,255,0.18)");
  halo.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, px, px);

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(c, c, Math.max(core, 0.5 * dpr), 0, Math.PI * 2);
  ctx.fill();

  return { canvas, cssSize: size + glow * 2 };
}

export function StarField() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let sprites = new Map<number, { canvas: HTMLCanvasElement; cssSize: number }>();

    const stars: Star[] = ALL_STARS.map(([x, y, size], index) => ({
      px: x / 100,
      py: y / 100,
      size,
      floatDur: 5.5 + (index % 6) * 0.65,
      floatDelay: (index % 12) * 0.35,
      twinkleDur: 2.2 + (index % 5) * 0.55,
      twinkleDelay: (index % 9) * 0.3,
      ex: 0,
      ey: 0,
      scale: 1,
      op: BASE_OPACITY,
    }));

    let pointer: { x: number; y: number } | null = null;
    let running = false;
    let visible = true;
    let frame = 0;
    let last = performance.now();
    const start = last;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      sprites = new Map([1, 1.5, 2].map((s) => [s, makeSprite(s, dpr)]));
      if (!running) draw(performance.now(), 0);
    };

    const draw = (now: number, dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const t = (now - start) / 1000;
      const k = dt > 0 ? 1 - Math.exp(-dt / EASE_TAU) : 1;

      for (const star of stars) {
        const x = star.px * width;
        const y = star.py * height;

        // Cursor repel targets
        let tx = 0;
        let ty = 0;
        let ts = 1;
        let to = BASE_OPACITY;

        if (pointer) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < RADIUS && distance > 0) {
            const proximity = 1 - distance / RADIUS;
            const strength = Math.pow(proximity, 1.7) * PUSH;
            tx = (dx / distance) * strength;
            ty = (dy / distance) * strength;
            ts = 1 + proximity * 1.4;
            to = BASE_OPACITY + proximity * 0.55;
          }
        }

        star.ex += (tx - star.ex) * k;
        star.ey += (ty - star.ey) * k;
        star.scale += (ts - star.scale) * k;
        star.op += (to - star.op) * k;

        let floatY = 0;
        let twinkle = 1;
        if (!reducedMotion) {
          const fp = positiveMod(t - star.floatDelay, star.floatDur) / star.floatDur;
          floatY = -7 * (0.5 - 0.5 * Math.cos(fp * Math.PI * 2));
          const tp = positiveMod(t - star.twinkleDelay, star.twinkleDur) / star.twinkleDur;
          twinkle = twinkleAt(tp);
        }

        const sprite = sprites.get(star.size) ?? sprites.get(1)!;
        const drawSize = sprite.cssSize * star.scale;
        const cx = x + star.ex;
        const cy = y + star.ey + floatY;

        ctx.globalAlpha = Math.min(1, star.op * twinkle);
        ctx.drawImage(sprite.canvas, cx - drawSize / 2, cy - drawSize / 2, drawSize, drawSize);
      }

      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(now, dt);
      frame = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (running || reducedMotion) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const sync = () => {
      if (visible && !document.hidden) startLoop();
      else stopLoop();
    };

    // Listen on the window so stars react even while the cursor is over
    // the hero's text/buttons (which sit above the canvas).
    const onPointerMove = (event: PointerEvent) => {
      if (!visible || event.pointerType === "touch") return;
      const rect = wrap.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= -RADIUS / 2 && y >= -RADIUS / 2 && x <= rect.width + RADIUS / 2 && y <= rect.height + RADIUS / 2;
      pointer = inside ? { x, y } : null;
    };

    const onPointerLeave = () => {
      pointer = null;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: "100px" },
    );
    intersectionObserver.observe(wrap);

    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    resize();
    sync();

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
}
