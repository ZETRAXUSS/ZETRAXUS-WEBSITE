"use client";

import { useEffect, useRef } from "react";

const STARS = [
  [7, 8, 1.5],
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
];

export function StarField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) return;

    const stars = Array.from(
      container.querySelectorAll<HTMLElement>("[data-zx-star]"),
    );

    let frame = 0;

    function handlePointerMove(event: PointerEvent) {
      if (frame) {
        cancelAnimationFrame(frame);
      }

      frame = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        for (const star of stars) {
          const starX = parseFloat(star.dataset.x ?? "0") * rect.width;
          const starY = parseFloat(star.dataset.y ?? "0") * rect.height;

          const dx = starX - mouseX;
          const dy = starY - mouseY;

          const distance = Math.sqrt(dx * dx + dy * dy);

          const radius = 170;

          if (distance < radius && distance > 0) {
            const strength = (1 - distance / radius) * 24;

            const moveX = (dx / distance) * strength;
            const moveY = (dy / distance) * strength;

            star.style.setProperty("--mouse-x", `${moveX}px`);
            star.style.setProperty("--mouse-y", `${moveY}px`);
            star.style.setProperty(
              "--mouse-opacity",
              `${0.35 + (1 - distance / radius) * 0.55}`,
            );
          } else {
            star.style.setProperty("--mouse-x", "0px");
            star.style.setProperty("--mouse-y", "0px");
            star.style.setProperty("--mouse-opacity", "0.3");
          }
        }
      });
    }

    function handlePointerLeave() {
      for (const star of stars) {
        star.style.setProperty("--mouse-x", "0px");
        star.style.setProperty("--mouse-y", "0px");
        star.style.setProperty("--mouse-opacity", "0.3");
      }
    }

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
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
          data-x={x / 100}
          data-y={y / 100}
          className="zx-star absolute rounded-full bg-white"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${(index % 9) * 0.45}s`,
            animationDuration: `${5.5 + (index % 5) * 0.7}s`,
          }}
        />
      ))}

      <style>{`
        .zx-star {
          --mouse-x: 0px;
          --mouse-y: 0px;
          --mouse-opacity: 0.3;

          opacity: var(--mouse-opacity);

          filter:
            drop-shadow(0 0 2px rgba(255, 255, 255, 0.7))
            drop-shadow(0 0 5px rgba(255, 255, 255, 0.15));

          transform:
            translate3d(var(--mouse-x), var(--mouse-y), 0);

          transition:
            transform 700ms cubic-bezier(0.16, 1, 0.3, 1),
            opacity 500ms ease;

          animation-name: zx-star-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
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
