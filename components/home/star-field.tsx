const STARS = [
  { top: "10%", left: "12%", size: 2, delay: "0s", duration: "6.5s" },
  { top: "18%", left: "78%", size: 1.5, delay: "1.1s", duration: "7.2s" },
  { top: "26%", left: "34%", size: 2.5, delay: "2.3s", duration: "5.8s" },
  { top: "14%", left: "55%", size: 1.5, delay: "0.6s", duration: "6.8s" },
  { top: "32%", left: "8%", size: 2, delay: "1.8s", duration: "7.6s" },
  { top: "22%", left: "92%", size: 1.5, delay: "3s", duration: "6.2s" },
  { top: "40%", left: "22%", size: 1.5, delay: "0.3s", duration: "7s" },
  { top: "38%", left: "68%", size: 2, delay: "2.6s", duration: "6.4s" },
  { top: "48%", left: "88%", size: 1.5, delay: "1.4s", duration: "7.8s" },
  { top: "54%", left: "15%", size: 2.5, delay: "0.9s", duration: "6s" },
  { top: "60%", left: "45%", size: 1.5, delay: "2.1s", duration: "7.4s" },
  { top: "66%", left: "72%", size: 2, delay: "3.4s", duration: "6.6s" },
  { top: "70%", left: "6%", size: 1.5, delay: "0.5s", duration: "7.1s" },
  { top: "76%", left: "58%", size: 2, delay: "1.6s", duration: "6.3s" },
  { top: "82%", left: "30%", size: 1.5, delay: "2.9s", duration: "7.5s" },
  { top: "86%", left: "84%", size: 2.5, delay: "1s", duration: "6.9s" },
  { top: "8%", left: "38%", size: 1.5, delay: "2.5s", duration: "7.3s" },
  { top: "62%", left: "94%", size: 1.5, delay: "0.2s", duration: "6.7s" },
  { top: "90%", left: "48%", size: 2, delay: "1.9s", duration: "7.9s" },
  { top: "46%", left: "3%", size: 1.5, delay: "3.2s", duration: "6.1s" },
  { top: "16%", left: "20%", size: 1.5, delay: "0.8s", duration: "7s" },
  { top: "34%", left: "48%", size: 2, delay: "2.2s", duration: "6.5s" },
];

/**
 * Subtle floating star particles drifting behind the hero content.
 * Positions are fixed (not randomized at runtime) so server and client
 * markup always match.
 */
export function StarField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {STARS.map((star, i) => (
        <span
          key={i}
          className="zx-star absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
      <style>{`
        .zx-star {
          opacity: 0.25;
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
          animation-name: zx-star-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes zx-star-float {
          0%, 100% { transform: translateY(0); opacity: 0.18; }
          50% { transform: translateY(-8px); opacity: 0.6; }
        }
        @media (prefers-reduced-motion: reduce) {
          .zx-star { animation: none; opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
