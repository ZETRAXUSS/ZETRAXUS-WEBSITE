"use client";

import { useEffect } from "react";
import { getSoundEngine, playSound, type SoundName } from "@/lib/sound/engine";

/**
 * One set of delegated listeners for the whole site:
 *
 *  - Sound: hover ticks + click sounds on every link/button, without
 *    touching each component. `data-sound="open|close|success|off"` on an
 *    element overrides the click voice; `data-sound-hover="off"` mutes hover.
 *  - Spotlight: elements with `data-spotlight` get --mx/--my CSS vars that
 *    follow the cursor (used by the radial light + border glow in CSS).
 *  - Magnetic: elements with `data-magnetic` lean gently toward the cursor.
 *
 * Everything is rAF-batched and passive; nothing runs on touch devices
 * except click sounds.
 */
export function FxProvider() {
  useEffect(() => {
    const engine = getSoundEngine();
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- audio unlock -----------------------------------------------------
    const unlock = () => engine.unlock();
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    // --- sound delegation -------------------------------------------------
    let lastHover: Element | null = null;

    const interactiveSelector = 'a[href], button:not([disabled]), [role="button"], [data-sound-hover]';

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = (event.target as Element | null)?.closest?.(interactiveSelector);
      if (!target || target === lastHover) return;
      lastHover = target;
      if (target.getAttribute("data-sound-hover") === "off") return;
      playSound("hover");
    };

    const onPointerOut = (event: PointerEvent) => {
      const related = event.relatedTarget as Element | null;
      if (lastHover && (!related || !lastHover.contains(related))) {
        lastHover = null;
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest?.(
        'a[href], button:not([disabled]), [role="button"], [data-sound]',
      );
      if (!target) return;
      const voice = target.getAttribute("data-sound");
      if (voice === "off") return;
      playSound((voice as SoundName | null) ?? "click");
    };

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    document.addEventListener("click", onClick, { capture: true, passive: true });

    // --- spotlight + magnetic ----------------------------------------------
    let frame = 0;
    let pendingEvent: PointerEvent | null = null;
    let activeSpot: HTMLElement | null = null;
    let activeMagnet: HTMLElement | null = null;

    const releaseMagnet = () => {
      if (activeMagnet) {
        activeMagnet.style.translate = "";
        activeMagnet = null;
      }
    };

    const process = () => {
      frame = 0;
      const event = pendingEvent;
      if (!event) return;
      const target = event.target as Element | null;

      const spot = target?.closest?.<HTMLElement>("[data-spotlight]") ?? null;
      if (spot) {
        const rect = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        spot.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }
      activeSpot = spot;

      if (!reducedMotion) {
        const magnet = target?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
        if (magnet !== activeMagnet) releaseMagnet();
        if (magnet) {
          const rect = magnet.getBoundingClientRect();
          const strength = Number(magnet.dataset.magnetic) || 0.25;
          const dx = (event.clientX - (rect.left + rect.width / 2)) * strength;
          const dy = (event.clientY - (rect.top + rect.height / 2)) * strength;
          magnet.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
          activeMagnet = magnet;
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pendingEvent = event;
      if (!frame) frame = requestAnimationFrame(process);
    };

    const onLeaveWindow = () => {
      releaseMagnet();
      activeSpot = null;
    };

    if (finePointer) {
      document.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    }

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      if (frame) cancelAnimationFrame(frame);
      void activeSpot;
    };
  }, []);

  return null;
}
