/**
 * ZETRAXUS sound engine.
 *
 * All sounds are synthesised with the Web Audio API — no audio files to
 * download, nothing to decode, ~0 bytes of network. Every voice is a few
 * milliseconds long and routed through one master gain + a gentle
 * low-pass so the palette stays soft, glassy and consistent.
 *
 * Browsers only allow audio after a user gesture, so the context is
 * created lazily on the first pointer/key interaction.
 */

export type SoundName =
  | "hover"
  | "click"
  | "open"
  | "close"
  | "toggle"
  | "success"
  | "error"
  | "notify"
  | "type"
  | "whoosh";

const STORAGE_KEY = "zx-sound";

type Listener = (enabled: boolean) => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private enabled = true;
  private unlocked = false;
  private lastPlayed = new Map<SoundName, number>();
  private listeners = new Set<Listener>();

  constructor() {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "off") this.enabled = false;
    } catch {
      /* storage unavailable (private mode) — default on */
    }
  }

  isEnabled() {
    return this.enabled;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    } catch {
      /* ignore */
    }
    this.listeners.forEach((listener) => listener(enabled));
    if (enabled) {
      this.unlock();
      this.play("toggle");
    }
  }

  /** Must be called from inside a user gesture. */
  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor({ latencyHint: "interactive" });

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 7200;
      filter.Q.value = 0.4;

      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(filter);
      filter.connect(this.ctx.destination);

      // One second of white noise, reused by every noisy voice.
      const length = this.ctx.sampleRate;
      this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    this.unlocked = true;
  }

  play(name: SoundName) {
    if (!this.enabled || !this.unlocked || !this.ctx || !this.master) return;
    if (this.ctx.state !== "running") return;

    // Per-voice throttle so sweeping the mouse over a grid stays musical.
    const now = performance.now();
    const minGap = name === "hover" ? 55 : name === "type" ? 35 : 25;
    const last = this.lastPlayed.get(name) ?? 0;
    if (now - last < minGap) return;
    this.lastPlayed.set(name, now);

    const t = this.ctx.currentTime + 0.002;

    switch (name) {
      case "hover":
        this.tone({ t, freq: 2350, to: 2600, dur: 0.045, gain: 0.018, type: "sine" });
        break;
      case "click":
        this.tone({ t, freq: 820, to: 420, dur: 0.07, gain: 0.07, type: "triangle" });
        this.noise({ t, dur: 0.025, gain: 0.03, freq: 5200, q: 0.9 });
        break;
      case "open":
        this.noise({ t, dur: 0.28, gain: 0.05, freq: 900, to: 4200, q: 1.4 });
        this.tone({ t: t + 0.03, freq: 520, to: 880, dur: 0.22, gain: 0.035, type: "sine" });
        break;
      case "close":
        this.noise({ t, dur: 0.22, gain: 0.04, freq: 3800, to: 700, q: 1.4 });
        this.tone({ t, freq: 760, to: 430, dur: 0.18, gain: 0.03, type: "sine" });
        break;
      case "toggle":
        this.tone({ t, freq: 660, dur: 0.06, gain: 0.05, type: "sine" });
        this.tone({ t: t + 0.06, freq: 990, dur: 0.09, gain: 0.045, type: "sine" });
        break;
      case "success":
        this.tone({ t, freq: 523.25, dur: 0.16, gain: 0.05, type: "sine" });
        this.tone({ t: t + 0.08, freq: 783.99, dur: 0.2, gain: 0.05, type: "sine" });
        this.tone({ t: t + 0.16, freq: 1046.5, dur: 0.32, gain: 0.045, type: "sine" });
        break;
      case "error":
        this.tone({ t, freq: 220, to: 160, dur: 0.18, gain: 0.07, type: "triangle" });
        this.tone({ t: t + 0.09, freq: 196, to: 140, dur: 0.2, gain: 0.05, type: "triangle" });
        break;
      case "notify":
        this.tone({ t, freq: 1318.5, dur: 0.22, gain: 0.045, type: "sine" });
        this.tone({ t: t + 0.11, freq: 1760, dur: 0.35, gain: 0.04, type: "sine" });
        break;
      case "type":
        this.noise({ t, dur: 0.018, gain: 0.012, freq: 3400, q: 2 });
        break;
      case "whoosh":
        this.noise({ t, dur: 0.55, gain: 0.05, freq: 300, to: 2600, q: 0.8 });
        this.tone({ t: t + 0.05, freq: 110, to: 220, dur: 0.5, gain: 0.04, type: "sine" });
        break;
    }
  }

  private tone(opts: {
    t: number;
    freq: number;
    to?: number;
    dur: number;
    gain: number;
    type: OscillatorType;
  }) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = opts.type;
    osc.frequency.setValueAtTime(opts.freq, opts.t);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, opts.t + opts.dur);
    env.gain.setValueAtTime(0.0001, opts.t);
    env.gain.exponentialRampToValueAtTime(opts.gain, opts.t + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, opts.t + opts.dur);
    osc.connect(env).connect(this.master!);
    osc.start(opts.t);
    osc.stop(opts.t + opts.dur + 0.02);
  }

  private noise(opts: { t: number; dur: number; gain: number; freq: number; to?: number; q: number }) {
    const ctx = this.ctx!;
    if (!this.noiseBuffer) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = opts.q;
    filter.frequency.setValueAtTime(opts.freq, opts.t);
    if (opts.to) filter.frequency.exponentialRampToValueAtTime(opts.to, opts.t + opts.dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, opts.t);
    env.gain.exponentialRampToValueAtTime(opts.gain, opts.t + Math.min(0.04, opts.dur / 3));
    env.gain.exponentialRampToValueAtTime(0.0001, opts.t + opts.dur);
    src.connect(filter).connect(env).connect(this.master!);
    src.start(opts.t, Math.random() * 0.5);
    src.stop(opts.t + opts.dur + 0.02);
  }
}

let engine: SoundEngine | null = null;

export function getSoundEngine(): SoundEngine {
  if (!engine) engine = new SoundEngine();
  return engine;
}

export function playSound(name: SoundName) {
  if (typeof window === "undefined") return;
  getSoundEngine().play(name);
}
