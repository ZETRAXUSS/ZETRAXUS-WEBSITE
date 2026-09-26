"use client";

import { useEffect, useState } from "react";
import { playSound } from "@/lib/sound/engine";

const SEEN_KEY = "zx-intro-seen";

/**
 * Cinematic first-visit intro: the mark ignites, ZETRAXUS resolves letter by
 * letter, a light line sweeps across, then the curtain lifts. Plays once per
 * browser session. An inline script in the layout hides it before first
 * paint for returning visitors, so there is never a flash.
 */
export function Intro() {
  const [phase, setPhase] = useState<"playing" | "leaving" | "done">("playing");

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* ignore */
    }

    if (seen || document.documentElement.classList.contains("zx-intro-skip")) {
      setPhase("done");
      return;
    }

    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }

    document.documentElement.classList.add("zx-intro-lock");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leaveAt = reduced ? 300 : 2350;
    const doneAt = reduced ? 700 : 3250;

    const leaveTimer = window.setTimeout(() => {
      setPhase("leaving");
      playSound("whoosh");
      document.documentElement.classList.remove("zx-intro-lock");
    }, leaveAt);
    const doneTimer = window.setTimeout(() => setPhase("done"), doneAt);

    const skip = () => {
      window.clearTimeout(leaveTimer);
      setPhase("leaving");
      document.documentElement.classList.remove("zx-intro-lock");
      window.setTimeout(() => setPhase("done"), 900);
    };
    window.addEventListener("keydown", skip, { once: true });

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
      window.removeEventListener("keydown", skip);
      document.documentElement.classList.remove("zx-intro-lock");
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      id="zx-intro"
      aria-hidden="true"
      className={`zx-intro ${phase === "leaving" ? "zx-intro--leaving" : ""}`}
      onClick={() => {
        if (phase === "playing") {
          setPhase("leaving");
          document.documentElement.classList.remove("zx-intro-lock");
          window.setTimeout(() => setPhase("done"), 900);
        }
      }}
    >
      <div className="zx-intro__grain" />
      <div className="zx-intro__halo" />

      <div className="zx-intro__stage">
        <div className="zx-intro__mark-wrap">
          <span className="zx-intro__ring" />
          <span className="zx-intro__ring zx-intro__ring--late" />
          <img src="/zetraxus-mark.png" alt="" className="zx-intro__mark" />
        </div>

        <p className="zx-intro__word">
          {"ZETRAXUS".split("").map((char, index) => (
            <span key={index} style={{ animationDelay: `${650 + index * 70}ms` }}>
              {char}
            </span>
          ))}
        </p>

        <span className="zx-intro__line" />
        <p className="zx-intro__tag">ENTER THE NETWORK</p>
      </div>

      <div className="zx-intro__curtain zx-intro__curtain--top" />
      <div className="zx-intro__curtain zx-intro__curtain--bottom" />
    </div>
  );
}
