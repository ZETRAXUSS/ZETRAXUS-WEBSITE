"use client";

import { useEffect, useRef } from "react";

const STARS = [
  [6, 8, 1.5],
  [13, 17, 2],
  [21, 6, 1],
  [28, 15, 1.5],
  [36, 9, 2],
  [43, 20, 1],
  [51, 11, 1.5],
  [58, 5, 2],
  [65, 16, 1],
  [73, 9, 1.5],
  [81, 21, 2],
  [90, 13, 1],

  [5, 32, 2],
  [15, 43, 1],
  [24, 35, 1.5],
  [33, 48, 2],
  [42, 31, 1],
  [50, 42, 1.5],
  [59, 34, 2],
  [68, 47, 1],
  [77, 37, 1.5],
  [87, 45, 2],
  [95, 33, 1],

  [9, 60, 1.5],
  [19, 72, 2],
  [29, 62, 1],
  [38, 78, 1.5],
  [47, 68, 2],
  [56, 58, 1],
  [64, 73, 1.5],
  [74, 63, 2],
  [83, 76, 1],
  [93, 67, 1.5],

  [6, 89, 2],
  [17, 82, 1],
  [27, 94, 1.5],
  [37, 86, 2],
  [46, 96, 1],
  [55, 88, 1.5],
  [66, 94, 2],
  [75, 84, 1],
  [85, 92, 1.5],
  [94, 82, 2],
  [11, 12, 1],
  [18, 24, 1.5],
  [31, 4, 1],
  [40, 14, 1.5],
  [48, 25, 1],
  [57, 19, 1.5],
  [69, 4, 1],
  [79, 27, 1.5],
  [88, 6, 1],
  [97, 19, 1.5],

  [12, 40, 1],
  [20, 54, 1.5],
  [30, 29, 1],
  [45, 55, 1.5],
  [54, 47, 1],
  [63, 29, 1.5],
  [72, 54, 1],
  [82, 31, 1.5],
  [91, 52, 1],

  [14, 67, 1],
  [25, 83, 1.5],
  [34, 70, 1],
  [52, 81, 1.5],
  [61, 66, 1],
  [71, 87, 1.5],
  [80, 72, 1],
  [89, 88, 1.5],
];

export function StarField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const stars = Array.from(
      container.querySelectorAll<HTMLElement>("[data-zx-star]"),
    );

    let animationFrame = 0;

    const resetStars = () => {
      for (const star of stars) {
        star.style.setProperty("--escape-x", "0px");
        star.style.setProperty("--escape-y", "0px");
        star.style.setProperty("--star-scale", "1");
        star.style.setProperty("--star-opacity", "0.3");
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        for (const star of stars) {
          const rect = star.getBoundingClientRect();

          const starX = rect.left + rect.width / 2;
          const starY = rect.top + rect.height / 2;

          const dx = starX - mouseX;
          const dy = starY - mouseY;

          const distance = Math.sqrt(dx * dx + dy * dy);

          /*
           * How far the cursor influences a star.
           * Larger = wider reaction area.
           */
          const radius = 240;

          if (distance < radius && distance > 0) {
            /*
             * Stronger movement when cursor is closer.
             */
            const proximity = 1 - distance / radius;

            /*
             * Non-linear curve makes the reaction
             * subtle from far away and stronger nearby.
             */
            const strength = Math.pow(proximity, 1.7) * 48;

            const moveX = (dx / distance) * strength;
            const moveY = (dy / distance) * strength;

            star.style.setProperty("--escape-x", `${moveX}px`);
            star.style.setProperty("--escape-y", `${moveY}px`);

            star.style.setProperty(
              "--star-scale",
              `${1 + proximity * 1.4}`,
            );

            star.style.setProperty(
              "--star-opacity",
              `${0.3 + proximity * 0.55}`,
            );
          } else {
            star.style.setProperty("--escape-x", "0px");
            star.style.setProperty("--escape-y", "0px");
            star.style.setProperty("--star-scale", "1");
            star.style.setProperty("--star-opacity", "0.3");
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
      {STARS.map(([x, y, size], index) => (
        <span
          key={index}
          data-zx-star
          className="zx-star absolute rounded-full bg-white"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${(index % 12) * 0.35}s`,
            animationDuration: `${5.5 + (index % 6) * 0.65}s`,
          }}
        />
      ))}

      <style>{`
        .zx-star {
          --escape-x: 0px;
          --escape-y: 0px;
          --star-scale: 1;
          --star-opacity: 0.3;

          opacity: var(--star-opacity);

          transform:
            translate3d(
              var(--escape-x),
              var(--escape-y),
              0
            )
            scale(var(--star-scale));

          filter:
            drop-shadow(0 0 2px rgba(255,255,255,0.8))
            drop-shadow(0 0 5px rgba(255,255,255,0.15));

          transition:
            transform 850ms cubic-bezier(0.16, 1, 0.3, 1),
            opacity 500ms ease;

          animation-name: zx-star-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;

          will-change: transform;
        }

        @keyframes zx-star-float {
          0%,
          100% {
            margin-top: 0;
          }

          50% {
            margin-top: -7px;
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
