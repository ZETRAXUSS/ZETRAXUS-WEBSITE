"use client";

import { useEffect, useRef } from "react";

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

/*
 * 140 extra stars spread evenly over the whole frame.
 *
 * The previous formula ((index * 37.173) % 100, (index * 61.937) % 100)
 * is a linear lattice, which is why the stars lined up in diagonal
 * stripes. Here every star gets its own cell in a 14 × 10 grid and a
 * seeded random offset inside that cell: even coverage edge to edge, no
 * visible pattern, and identical on every render (no hydration mismatch).
 */
function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const GRID_COLS = 14;
const GRID_ROWS = 10;

const EXTRA_STARS: [number, number, number][] = (() => {
  const random = seeded(20260926);
  const sizes = [1, 1, 1, 1.5, 1.5, 2];
  const stars: [number, number, number][] = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const cellW = 100 / GRID_COLS;
      const cellH = 100 / GRID_ROWS;
      const x = (col + 0.12 + random() * 0.76) * cellW;
      const y = (row + 0.12 + random() * 0.76) * cellH;
      const size = sizes[Math.floor(random() * sizes.length)];
      stars.push([Number(x.toFixed(2)), Number(y.toFixed(2)), size]);
    }
  }

  return stars;
})();

const ALL_STARS: [number, number, number][] = [
  ...STARS,
  ...EXTRA_STARS,
];

export function StarField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // Pause every star animation while the hero isn't visible.
    const visibility = new IntersectionObserver(
      (entries) => {
        const onScreen = entries.some((entry) => entry.isIntersecting);
        container.classList.toggle("zx-stars-paused", !onScreen);
      },
      { rootMargin: "80px" },
    );
    visibility.observe(container);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      return () => visibility.disconnect();
    }

    const stars = Array.from(
      container.querySelectorAll<HTMLElement>("[data-zx-star]"),
    );

    // Which stars are currently pushed away (so we only reset those).
    const active = new Set<number>();
    let animationFrame = 0;

    const resetStar = (star: HTMLElement) => {
      star.style.setProperty("--escape-x", "0px");
      star.style.setProperty("--escape-y", "0px");
      star.style.setProperty("--star-scale", "1");
      star.style.setProperty("--star-opacity", "0.3");
    };

    const resetStars = () => {
      active.forEach((index) => resetStar(stars[index]));
      active.clear();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const radius = 240;

        for (let index = 0; index < ALL_STARS.length; index++) {
          const [px, py] = ALL_STARS[index];
          const star = stars[index];
          if (!star) continue;

          const dx = (px / 100) * rect.width - mouseX;
          const dy = (py / 100) * rect.height - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < radius && distance > 0) {
            const proximity = 1 - distance / radius;
            const strength = Math.pow(proximity, 1.7) * 48;

            star.style.setProperty("--escape-x", `${(dx / distance) * strength}px`);
            star.style.setProperty("--escape-y", `${(dy / distance) * strength}px`);
            star.style.setProperty("--star-scale", `${1 + proximity * 1.4}`);
            star.style.setProperty("--star-opacity", `${0.3 + proximity * 0.55}`);
            active.add(index);
          } else if (active.has(index)) {
            resetStar(star);
            active.delete(index);
          }
        }
      });
    };

    const handlePointerLeave = () => {
      resetStars();
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      visibility.disconnect();

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {ALL_STARS.map(([x, y, size], index) => (
        <span
          key={index}
          data-zx-star
          className="zx-star absolute rounded-full bg-white"
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,

              "--float-duration": `${
                5.5 + (index % 6) * 0.65
              }s`,

              "--float-delay": `${
                (index % 12) * 0.35
              }s`,

              "--twinkle-duration": `${
                2.2 + (index % 5) * 0.55
              }s`,

              "--twinkle-delay": `${
                (index % 9) * 0.3
              }s`,
            } as React.CSSProperties
          }
        />
      ))}

      <style>{`
        @property --twinkle {
          syntax: '<number>';
          inherits: false;
          initial-value: 1;
        }

        .zx-star {
          --escape-x: 0px;
          --escape-y: 0px;
          --star-scale: 1;
          --star-opacity: 0.3;
          --twinkle: 1;

          opacity:
            calc(
              var(--star-opacity) *
              var(--twinkle)
            );

          transform:
            translate3d(
              var(--escape-x),
              var(--escape-y),
              0
            )
            scale(var(--star-scale));

          filter:
            drop-shadow(
              0 0 2px
              rgba(255, 255, 255, 0.8)
            )
            drop-shadow(
              0 0 5px
              rgba(255, 255, 255, 0.15)
            );

          transition:
            transform
            850ms
            cubic-bezier(0.16, 1, 0.3, 1),
            filter 500ms ease;

          animation:
            zx-star-float
            var(--float-duration, 6s)
            ease-in-out
            infinite,

            zx-star-twinkle
            var(--twinkle-duration, 3s)
            ease-in-out
            infinite;

          animation-delay:
            var(--float-delay, 0s),
            var(--twinkle-delay, 0s);

          will-change:
            transform,
            opacity;
        }

        @keyframes zx-star-float {
          0%, 100% {
            translate: 0 0;
          }

          50% {
            translate: 0 -7px;
          }
        }

        .zx-stars-paused .zx-star {
          animation-play-state: paused;
        }

        @keyframes zx-star-twinkle {
          0%, 100% {
            --twinkle: 1;
          }

          22% {
            --twinkle: 0.35;
          }

          46% {
            --twinkle: 0.95;
          }

          68% {
            --twinkle: 0.45;
          }

          85% {
            --twinkle: 0.85;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .zx-star {
            animation: none;
            opacity: 0.3;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
