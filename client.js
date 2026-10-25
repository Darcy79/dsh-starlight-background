window.__ModuleLoader__.load({
  id: 'dsh-harmony-light',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'dsh.harmony.light'
    const STYLE_ID = 'dsh-harmony-light/styles'
    const STORAGE_KEY = 'dsh.harmony-light.mode'
    const DEFAULT_ON = true

    /*
     * HarmonyOS 7 treats material thickness as hierarchy, not as a theme mode:
     * light and dark keep the same layers, and only the ink, edge and fallback
     * colours change. Dark leans on a 1px edge highlight and restrained glow;
     * light leans on soft shadow and a cool white tint. The only moving light
     * tied to the pointer is a short press bloom, the web echo of `lightEffect`.
     */
    const CSS = String.raw`
/* dsh-harmony-light — HarmonyOS 7 light field for the whole Harness frame.
   The ambient layers stay under .dhl-; the glass system intentionally tints
   the host chrome, dialogs and menus so the field behind them is visible. */

.dhl-root {
  --dhl-blue: #6f97ff;
  --dhl-violet: #a98bff;
  --dhl-pink: #ff93c4;
  --dhl-cyan: #7fe4ff;
  --dhl-accent: #b6c8ff;
  --dhl-gain: 0.7;
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  font-family: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif);
  -webkit-user-select: none;
  user-select: none;
}

/* The switch and press ripples sit in their own root above the light field. */
.dhl-root.dhl-overlay { z-index: 1; }

/* Same layer weight in both themes. Light raises the colour density of the
   ink instead of the opacity of the layer. */
.dhl-root[data-scheme="light"] {
  --dhl-blue: #6f98ff;
  --dhl-violet: #a982ff;
  --dhl-pink: #ff8fc0;
  --dhl-cyan: #66d6ff;
  --dhl-accent: #5f7fe8;
}

/* ── ambient field ──────────────────────────────────────────── */

.dhl-effect {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: var(--dhl-gain);
  visibility: visible;
  transition:
    opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s;
  pointer-events: none;
}

.dhl-root[data-on="false"] .dhl-effect {
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 1000ms ease,
    visibility 0s linear 1000ms;
}

.dhl-field {
  position: absolute;
  inset: -10vmax;
  transform-origin: 50% 50%;
  animation: dhl-breathe 22s ease-in-out infinite;
  will-change: transform;
  pointer-events: none;
}

.dhl-blob {
  position: absolute;
  display: block;
  border-radius: 50%;
  opacity: 0.5;
  animation-name: dhl-float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  will-change: transform;
  pointer-events: none;
}

.dhl-root[data-scheme="dark"] .dhl-blob { mix-blend-mode: screen; }
.dhl-root[data-scheme="light"] .dhl-blob {
  opacity: 0.55;
  mix-blend-mode: multiply;
}

.dhl-blob-a {
  left: -32vmax;
  top: -36vmax;
  width: 90vmax;
  height: 90vmax;
  --dhl-fx: 7vmax;
  --dhl-fy: 5vmax;
  --dhl-fx2: -3vmax;
  --dhl-fy2: 9vmax;
  animation-duration: 51s;
  animation-delay: -6s;
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in srgb, var(--dhl-blue) 20%, transparent) 0%,
    color-mix(in srgb, var(--dhl-blue) 7%, transparent) 40%,
    transparent 70%
  );
}

.dhl-blob-b {
  right: -28vmax;
  top: -6vmax;
  width: 78vmax;
  height: 78vmax;
  --dhl-fx: -6vmax;
  --dhl-fy: 8vmax;
  --dhl-fx2: 4vmax;
  --dhl-fy2: -3vmax;
  animation-duration: 62s;
  animation-delay: -19s;
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in srgb, var(--dhl-violet) 18%, transparent) 0%,
    color-mix(in srgb, var(--dhl-violet) 6%, transparent) 42%,
    transparent 72%
  );
}

.dhl-blob-c {
  left: 8vmax;
  bottom: -50vmax;
  width: 96vmax;
  height: 96vmax;
  --dhl-fx: 9vmax;
  --dhl-fy: -7vmax;
  --dhl-fx2: -5vmax;
  --dhl-fy2: -2vmax;
  animation-duration: 68s;
  animation-delay: -31s;
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in srgb, var(--dhl-pink) 14%, transparent) 0%,
    color-mix(in srgb, var(--dhl-pink) 5%, transparent) 44%,
    transparent 72%
  );
}

.dhl-blob-d {
  right: 4vmax;
  bottom: -30vmax;
  width: 64vmax;
  height: 64vmax;
  --dhl-fx: -5vmax;
  --dhl-fy: -6vmax;
  --dhl-fx2: 3vmax;
  --dhl-fy2: 4vmax;
  animation-duration: 56s;
  animation-delay: -12s;
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in srgb, var(--dhl-cyan) 12%, transparent) 0%,
    color-mix(in srgb, var(--dhl-cyan) 4%, transparent) 46%,
    transparent 74%
  );
}

.dhl-blob-e {
  left: 30vmax;
  top: 12vmax;
  width: 54vmax;
  height: 54vmax;
  --dhl-fx: 4vmax;
  --dhl-fy: 6vmax;
  --dhl-fx2: -6vmax;
  --dhl-fy2: 2vmax;
  animation-duration: 76s;
  animation-delay: -44s;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 244, 234, 0.07) 0%,
    rgba(255, 244, 234, 0.025) 44%,
    transparent 72%
  );
}

/* Light mode carries a little more dye in the same gradient stops, so the
   layer stays the same weight while still reading on white. */
.dhl-root[data-scheme="light"] .dhl-blob-a {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(111, 152, 255, 0.34) 0%,
    rgba(111, 152, 255, 0.12) 40%,
    transparent 70%
  );
}

.dhl-root[data-scheme="light"] .dhl-blob-b {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(169, 130, 255, 0.3) 0%,
    rgba(169, 130, 255, 0.1) 42%,
    transparent 72%
  );
}

.dhl-root[data-scheme="light"] .dhl-blob-c {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 143, 192, 0.26) 0%,
    rgba(255, 143, 192, 0.09) 44%,
    transparent 72%
  );
}

.dhl-root[data-scheme="light"] .dhl-blob-d {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(102, 214, 255, 0.22) 0%,
    rgba(102, 214, 255, 0.07) 46%,
    transparent 74%
  );
}

.dhl-root[data-scheme="light"] .dhl-blob-e {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 226, 214, 0.22) 0%,
    rgba(255, 226, 214, 0.07) 44%,
    transparent 72%
  );
}

.dhl-wash {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      58% 44% at 50% -6%,
      color-mix(in srgb, var(--dhl-blue) 9%, transparent),
      transparent 72%
    ),
    radial-gradient(
      38% 34% at 96% 104%,
      color-mix(in srgb, var(--dhl-pink) 7%, transparent),
      transparent 70%
    );
  mix-blend-mode: screen;
  opacity: 0.7;
  pointer-events: none;
}

.dhl-root[data-scheme="light"] .dhl-wash {
  opacity: 0.75;
  mix-blend-mode: multiply;
  background:
    radial-gradient(58% 44% at 50% -6%, rgba(205, 222, 255, 0.9), transparent 72%),
    radial-gradient(38% 34% at 96% 104%, rgba(255, 218, 235, 0.78), transparent 70%);
}

/* ── meteors ────────────────────────────────────────────────── */

.dhl-meteors {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.dhl-meteor {
  position: absolute;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--dhl-meteor-tail) 58%,
    var(--dhl-meteor-head) 100%
  );
  opacity: 0;
  transform-origin: 0 50%;
  animation: dhl-meteor var(--dhl-meteor-duration) linear forwards;
  will-change: transform, opacity;
  pointer-events: none;
}

.dhl-meteor::after {
  content: "";
  position: absolute;
  right: -1.75px;
  top: 50%;
  width: 3.5px;
  height: 3.5px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 50%,
    #ffffff 0 22%,
    var(--dhl-meteor-head) 55%,
    var(--dhl-meteor-glow) 82%,
    transparent 100%
  );
  box-shadow: 0 0 3px var(--dhl-meteor-glow);
  transform: translateY(-50%);
  pointer-events: none;
}

.dhl-root[data-scheme="dark"] .dhl-meteor {
  mix-blend-mode: screen;
}

.dhl-root[data-scheme="light"] .dhl-meteor {
  mix-blend-mode: multiply;
  box-shadow: none;
}

.dhl-root[data-scheme="light"] .dhl-meteor::after {
  box-shadow: 0 0 5px rgba(86, 118, 210, 0.3);
}

/* ── fixed meteors: one lane per reasoning level ────────────── */

.dhl-fixed-meteors {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.dhl-fixed-meteor {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  transition: opacity 700ms ease;
  pointer-events: none;
}

.dhl-fixed-meteor[data-active="true"] {
  opacity: 1;
}

.dhl-fixed-streak,
.dhl-fixed-particle {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  animation-name: dhl-fixed-flight;
  animation-duration: var(--dhl-fixed-duration);
  animation-delay: var(--dhl-fixed-delay);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-play-state: running;
  pointer-events: none;
}

.dhl-fixed-streak {
  width: var(--dhl-fixed-length);
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--dhl-fixed-tail) 58%,
    var(--dhl-fixed-head) 100%
  );
  transform-origin: 0 50%;
}

/* A real round head: the tail ends under this soft radial coma, so there is
   no square bar cap and no rectangular shadow at the leading edge. */
.dhl-fixed-head {
  position: absolute;
  right: -2px;
  top: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 50%,
    #ffffff 0 22%,
    var(--dhl-fixed-head) 55%,
    var(--dhl-fixed-glow) 82%,
    transparent 100%
  );
  box-shadow: 0 0 3px var(--dhl-fixed-glow);
  transform: translateY(-50%);
  pointer-events: none;
}

.dhl-fixed-meteor[data-idea="true"] .dhl-fixed-streak {
  filter: brightness(1.35) saturate(1.05);
}

.dhl-fixed-meteor[data-idea="true"] .dhl-fixed-head {
  right: -2.5px;
  width: 5px;
  height: 5px;
  box-shadow: 0 0 6px #ffffff, 0 0 14px var(--dhl-fixed-glow);
}

.dhl-fixed-particle {
  width: var(--dhl-fixed-particle-size, 3px);
  height: var(--dhl-fixed-particle-size, 3px);
  border-radius: 50%;
  background: var(--dhl-fixed-head);
  box-shadow: 0 0 5px var(--dhl-fixed-glow);
  opacity: 0;
}

.dhl-root[data-on="false"] .dhl-fixed-streak,
.dhl-root[data-on="false"] .dhl-fixed-particle {
  animation-play-state: paused;
}

.dhl-root[data-scheme="dark"] .dhl-fixed-streak,
.dhl-root[data-scheme="dark"] .dhl-fixed-particle {
  mix-blend-mode: screen;
}

.dhl-root[data-scheme="light"] .dhl-fixed-streak {
  mix-blend-mode: multiply;
}

.dhl-root[data-scheme="light"] .dhl-fixed-particle {
  mix-blend-mode: multiply;
  box-shadow: 0 0 4px rgba(70, 105, 200, 0.3);
}

@keyframes dhl-fixed-flight {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(var(--dhl-fixed-angle));
  }
  8% { opacity: var(--dhl-fixed-opacity); }
  50% {
    transform: translate3d(var(--dhl-fixed-mx), var(--dhl-fixed-my), 0)
      rotate(var(--dhl-fixed-angle));
  }
  70% { opacity: var(--dhl-fixed-opacity); }
  100% {
    opacity: 0;
    transform: translate3d(var(--dhl-fixed-dx), var(--dhl-fixed-dy), 0)
      rotate(var(--dhl-fixed-angle));
  }
}

/* ── motes and bokeh ────────────────────────────────────────── */

.dhl-motes,
.dhl-bokeh {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.dhl-mote {
  position: absolute;
  display: block;
  border-radius: 50%;
  background: var(--dhl-mote-color);
  box-shadow:
    0 0 var(--dhl-mote-glow) var(--dhl-mote-color),
    0 0 var(--dhl-mote-glow2) color-mix(in srgb, var(--dhl-mote-color) 40%, transparent);
  opacity: 0;
  animation: dhl-mote var(--dhl-dur) ease-in-out var(--dhl-delay) infinite;
  will-change: transform, opacity;
  pointer-events: none;
}

.dhl-bokeh-orb {
  position: absolute;
  display: block;
  border-radius: 50%;
  background: radial-gradient(circle, var(--dhl-bokeh-color) 0%, transparent 70%);
  filter: blur(6px);
  opacity: 0;
  animation: dhl-bokeh var(--dhl-bok-dur) ease-in-out var(--dhl-bok-delay) infinite;
  will-change: transform, opacity;
  pointer-events: none;
}

.dhl-root[data-scheme="light"] .dhl-mote {
  mix-blend-mode: multiply;
  box-shadow: 0 0 4px color-mix(in srgb, var(--dhl-mote-color) 55%, transparent);
}

.dhl-root[data-scheme="light"] .dhl-bokeh-orb { mix-blend-mode: multiply; }

/* ── bottom-left light pool and rising dust ────────────────── */

.dhl-pool {
  position: absolute;
  left: -18vmax;
  bottom: -26vmax;
  width: 76vmax;
  height: 76vmax;
  border-radius: 50%;
  background:
    radial-gradient(
      circle at 38% 62%,
      rgba(150, 220, 255, 0.12) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle,
      rgba(120, 180, 255, 0.17) 0%,
      rgba(110, 205, 235, 0.09) 42%,
      transparent 70%
    );
  mix-blend-mode: screen;
  opacity: 0.95;
  animation: dhl-pool-breathe 18s ease-in-out infinite;
  pointer-events: none;
}

.dhl-root[data-scheme="light"] .dhl-pool {
  mix-blend-mode: multiply;
  background:
    radial-gradient(circle at 38% 62%, rgba(120, 175, 240, 0.1) 0%, transparent 40%),
    radial-gradient(
      circle,
      rgba(120, 175, 240, 0.12) 0%,
      rgba(140, 210, 240, 0.06) 42%,
      transparent 70%
    );
}

@keyframes dhl-pool-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

.dhl-dust {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.dhl-dust-mote {
  position: absolute;
  display: block;
  border-radius: 50%;
  background: var(--dhl-dust-color);
  box-shadow: 0 0 9px var(--dhl-dust-color);
  opacity: 0;
  animation: dhl-dust var(--dhl-dust-duration) ease-in-out var(--dhl-dust-delay) infinite;
  will-change: transform, opacity;
  pointer-events: none;
}

.dhl-root[data-scheme="light"] .dhl-dust-mote {
  mix-blend-mode: multiply;
  box-shadow: none;
}

@keyframes dhl-dust {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(0.6);
  }
  20% { opacity: var(--dhl-dust-opacity); }
  80% { opacity: 0.25; }
  100% {
    opacity: 0;
    transform: translate3d(var(--dhl-dust-dx), var(--dhl-dust-dy), 0) scale(1);
  }
}

/* ── frame edge and film grain ──────────────────────────────── */

.dhl-edge {
  position: absolute;
  inset: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(255, 255, 255, 0.025),
    inset 0 0 96px -28px color-mix(in srgb, var(--dhl-blue) 18%, transparent);
  opacity: 0.55;
  animation: dhl-edge-pulse 13s ease-in-out infinite;
  pointer-events: none;
}

.dhl-root[data-scheme="light"] .dhl-edge {
  opacity: 0.7;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(110, 130, 180, 0.05),
    inset 0 0 0 1px rgba(90, 110, 170, 0.035),
    inset 0 0 90px -24px rgba(110, 140, 220, 0.18);
}

.dhl-grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
  opacity: 0.026;
  pointer-events: none;
}

.dhl-root[data-scheme="light"] .dhl-grain { opacity: 0.015; }

/* ── entrance bloom ─────────────────────────────────────────── */

.dhl-enter {
  position: absolute;
  inset: -20%;
  background: radial-gradient(
    42% 42% at 50% 42%,
    rgba(190, 215, 255, 0.12),
    rgba(150, 170, 255, 0.06) 42%,
    transparent 70%
  );
  mix-blend-mode: screen;
  opacity: 0;
  animation: dhl-enter 2.8s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
  pointer-events: none;
}

.dhl-root[data-scheme="light"] .dhl-enter {
  mix-blend-mode: multiply;
  background: radial-gradient(
    42% 42% at 50% 42%,
    rgba(140, 168, 240, 0.14),
    rgba(205, 160, 230, 0.07) 42%,
    transparent 70%
  );
}

/* ── press light (the web echo of lightEffect) ──────────────── */

.dhl-ripples {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.dhl-ripple {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
}

.dhl-ripple-core {
  position: absolute;
  left: -64px;
  top: -64px;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(214, 230, 255, 0.2) 0%,
    rgba(170, 195, 255, 0.1) 42%,
    transparent 70%
  );
  mix-blend-mode: screen;
  animation: dhl-ripple-core 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  pointer-events: none;
}

.dhl-ripple-ring {
  position: absolute;
  left: -15px;
  top: -15px;
  width: 30px;
  height: 30px;
  border: 1px solid rgba(200, 220, 255, 0.32);
  border-radius: 50%;
  animation: dhl-ripple-ring 580ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  pointer-events: none;
}

.dhl-root[data-scheme="light"] .dhl-ripple-core {
  mix-blend-mode: multiply;
  background: radial-gradient(
    circle,
    rgba(96, 132, 226, 0.15) 0%,
    rgba(150, 120, 225, 0.09) 42%,
    transparent 70%
  );
}

.dhl-root[data-scheme="light"] .dhl-ripple-ring {
  border-color: rgba(80, 112, 210, 0.24);
}

/* ── iOS switch ─────────────────────────────────────────────── */

.dhl-root .dhl-ios-switch {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 3;
  box-sizing: border-box;
  width: 34px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  box-shadow: none;
  outline: none;
  cursor: pointer;
  pointer-events: auto;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* Hover only grows the switch. */
.dhl-root .dhl-ios-switch:hover { transform: scale(1.06); }
.dhl-root .dhl-ios-switch:active { transform: scale(0.95); }

.dhl-ios-track {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: 999px;
  background: #e9e9ea;
  box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.04);
  transition: background 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* The send-button periwinkle, not the loud iOS green. */
.dhl-ios-switch[data-on="true"] .dhl-ios-track {
  background: #7fa6f5;
}

.dhl-root[data-scheme="dark"] .dhl-ios-track {
  background: #39393d;
  box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.07);
}

.dhl-root[data-scheme="dark"] .dhl-ios-switch[data-on="true"] .dhl-ios-track {
  background: #7fa6f5;
}

.dhl-root[data-scheme="light"] .dhl-ios-switch[data-on="true"] .dhl-ios-track {
  background: #9bbdff;
}

.dhl-ios-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.2),
    0 1px 1px rgba(0, 0, 0, 0.08);
  transition: transform 320ms cubic-bezier(0.34, 1.28, 0.64, 1);
  pointer-events: none;
}

.dhl-root[data-scheme="dark"] .dhl-ios-knob {
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.42),
    0 1px 1px rgba(0, 0, 0, 0.2);
}

.dhl-ios-switch[data-on="true"] .dhl-ios-knob {
  transform: translateX(14px);
}

.dhl-ios-switch:active .dhl-ios-knob { transform: scale(0.94); }
.dhl-ios-switch[data-on="true"]:active .dhl-ios-knob {
  transform: translateX(14px) scale(0.94);
}

.dhl-ios-switch:focus-visible .dhl-ios-track {
  box-shadow:
    0 0 0 2px rgba(8, 12, 22, 0.65),
    0 0 0 4px rgba(127, 166, 245, 0.45),
    inset 0 0 0 0.5px rgba(0, 0, 0, 0.04);
}

.dhl-root[data-scheme="light"] .dhl-ios-switch:focus-visible .dhl-ios-track {
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.92),
    0 0 0 4px rgba(127, 166, 245, 0.35),
    inset 0 0 0 0.5px rgba(0, 0, 0, 0.04);
}

/* ── unified chrome + glass composer ───────────────────────── */

/* The token override handles the normal case; these generated roots cover
   the sidebar and the Windows titlebar frame so the chrome is one black. */
.wtg9ga_root,
[data-windows-titlebar] .mP3x-q_frame,
[data-windows-titlebar] .mP3x-q_sidebarCol {
  background: var(--dsw-alias-bg-base) !important;
}

[data-windows-titlebar] .mP3x-q_frame:before {
  background: var(--dsw-alias-bg-base) !important;
}

/* The composer seat normally paints an opaque fade over the chat. Remove it
   so the card's translucent fill can reveal the blurred conversation. */
[data-composer-seat] {
  background: transparent !important;
}

/* HarmonyOS 7 immersive material: the blur stays on the card so the composer
   keeps its real transparency. The sheen is static; the only hover-stability
   changes are outside the blur layer. */
[data-composer-card] {
  position: relative;
  -webkit-backdrop-filter: blur(22px) saturate(1.2);
  backdrop-filter: blur(22px) saturate(1.2);
  background-image: linear-gradient(
    115deg,
    transparent 30%,
    rgba(255, 255, 255, 0.04) 48%,
    transparent 66%
  );
  background-size: 240% 100%;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 0 24px -16px rgba(130, 165, 255, 0.45),
    var(--dsw-elevation-soft);
}

body:not([data-ds-dark-theme]) [data-composer-card] {
  background-image: linear-gradient(
    115deg,
    transparent 30%,
    rgba(110, 140, 220, 0.05) 48%,
    transparent 66%
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 0 24px -16px rgba(120, 150, 230, 0.3),
    var(--dsw-elevation-soft);
}

/* A tooltip can be composited above the composer at exactly the moment the
   send button changes its hover colour. Keep its own blur/animations out of
   that stack; do not hide/show it on hover, because that toggle is itself a
   one-frame flash when the pointer leaves the composer. */
[role="tooltip"] {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
  animation: none !important;
  transition: none !important;
  filter: none !important;
  mix-blend-mode: normal !important;
  pointer-events: none !important;
}

/* The send/pause tooltip is rendered inline inside the composer card. Near
   the bottom-right corner it extends the scrollable area and produces the
   right/bottom scrollbar. Hide composer tooltips only; tooltips elsewhere
   keep working. */
[data-composer-card] [role="tooltip"] {
  display: none !important;
}

@keyframes dhl-composer-sheen {
  0%,
  100% { background-position: 180% 0; }
  50% { background-position: -80% 0; }
}

/* The light sweep that leads the meteors on every toggle. */
.dhl-toggle-sweep {
  position: absolute;
  inset: -15%;
  z-index: 2;
  background: linear-gradient(
    115deg,
    transparent 0%,
    rgba(170, 200, 255, 0.05) 26%,
    rgba(255, 255, 255, 0.16) 48%,
    rgba(170, 200, 255, 0.05) 70%,
    transparent 100%
  );
  background-size: 260% 260%;
  background-position: 0% 0%;
  mix-blend-mode: screen;
  pointer-events: none;
  animation: dhl-toggle-sweep 1.15s cubic-bezier(0.3, 0.05, 0.2, 1) both;
  will-change: background-position, opacity;
}

body:not([data-ds-dark-theme]) .dhl-toggle-sweep {
  mix-blend-mode: multiply;
  background: linear-gradient(
    115deg,
    transparent 0%,
    rgba(120, 155, 235, 0.08) 26%,
    rgba(150, 185, 250, 0.12) 48%,
    rgba(120, 155, 235, 0.08) 70%,
    transparent 100%
  );
  background-size: 260% 260%;
}

@keyframes dhl-toggle-sweep {
  0% {
    background-position: 100% 100%;
    opacity: 0;
  }
  14% { opacity: 1; }
  82% { opacity: 0.8; }
  100% {
    background-position: 0% 0%;
    opacity: 0;
  }
}

/* ── motion ─────────────────────────────────────────────────── */

@keyframes dhl-breathe {
  0%,
  100% { transform: scale(1); }
  50% { transform: scale(1.018); }
}

@keyframes dhl-float {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(var(--dhl-fx), var(--dhl-fy), 0) scale(1.05); }
  100% { transform: translate3d(var(--dhl-fx2), var(--dhl-fy2), 0) scale(0.98); }
}

@keyframes dhl-meteor {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(var(--dhl-meteor-angle));
  }
  12% { opacity: var(--dhl-meteor-opacity); }
  50% {
    transform: translate3d(var(--dhl-meteor-mx), var(--dhl-meteor-my), 0)
      rotate(var(--dhl-meteor-angle));
  }
  72% { opacity: var(--dhl-meteor-opacity); }
  100% {
    opacity: 0;
    transform: translate3d(var(--dhl-meteor-dx), var(--dhl-meteor-dy), 0)
      rotate(var(--dhl-meteor-angle));
  }
}

@keyframes dhl-mote {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(0.7);
  }
  16% { opacity: var(--dhl-mote-opacity); }
  52% {
    opacity: var(--dhl-mote-opacity);
    transform: translate3d(var(--dhl-dx), var(--dhl-dy), 0) scale(1.08);
  }
  84% {
    opacity: 0;
    transform: translate3d(var(--dhl-dx2), var(--dhl-dy2), 0) scale(0.82);
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--dhl-dx2), var(--dhl-dy2), 0) scale(0.82);
  }
}

@keyframes dhl-bokeh {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(0.9);
  }
  30%,
  70% { opacity: var(--dhl-bokeh-opacity, 0.7); }
  100% {
    opacity: 0;
    transform: translate3d(var(--dhl-dx), var(--dhl-dy), 0) scale(1.12);
  }
}

@keyframes dhl-edge-pulse {
  0%,
  100% { opacity: 0.42; }
  50% { opacity: 0.7; }
}

@keyframes dhl-enter {
  0% {
    opacity: 0;
    transform: scale(0.86);
  }
  16% { opacity: 0.68; }
  100% {
    opacity: 0;
    transform: scale(1.16);
  }
}

@keyframes dhl-ripple-core {
  0% {
    opacity: 0.85;
    transform: scale(0.4);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}

@keyframes dhl-ripple-ring {
  0% {
    opacity: 0.55;
    transform: scale(0.5);
  }
  100% {
    opacity: 0;
    transform: scale(2.2);
  }
}

/* ── reduced motion ─────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .dhl-field,
  .dhl-blob,
  .dhl-mote,
  .dhl-bokeh-orb,
  .dhl-meteor,
  .dhl-fixed-streak,
  .dhl-fixed-particle,
  .dhl-edge,
  .dhl-enter,
  .dhl-ripple-core,
  .dhl-ripple-ring {
    animation: none !important;
  }

  .dhl-mote { opacity: var(--dhl-mote-opacity); }
  .dhl-bokeh-orb { opacity: 0.26; }
  .dhl-meteor,
  .dhl-fixed-meteor,
  .dhl-enter {
    display: none;
  }

  .dhl-effect,
  .dhl-ios-switch,
  .dhl-ios-track,
  .dhl-ios-knob,
  .dhl-fixed-meteor {
    transition: none !important;
  }
}

/* Pause every full-frame animation while the window is hidden. */
.dhl-root[data-visible="false"] .dhl-effect * {
  animation-play-state: paused !important;
}

@media (prefers-contrast: more) {
  .dhl-root { --dhl-gain: 0.45; }
  .dhl-ios-track { box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5); }
}

@media (max-width: 720px) {
  .dhl-root .dhl-ios-switch {
    right: 12px;
    bottom: 92px;
  }
}
`

    const zh = {
      name: '全局光感',
      hint: '点击或按 Alt+L 开关',
      onState: '已开启',
      offState: '已关闭',
    }

    const en = {
      name: 'Global light',
      hint: 'Click or press Alt+L to toggle',
      onState: 'On',
      offState: 'Off',
    }

    const FALLBACK_COPY = zh

    function fallbackTranslate(key) {
      return Object.prototype.hasOwnProperty.call(FALLBACK_COPY, key) ? FALLBACK_COPY[key] : key
    }

    function installStyles() {
      if (typeof document === 'undefined') return () => {}
      if (document.getElementById(STYLE_ID) !== null) return () => {}
      const style = document.createElement('style')
      style.id = STYLE_ID
      style.dataset.plugin = 'dsh-harmony-light'
      style.textContent = CSS
      document.head.appendChild(style)
      return () => { style.remove() }
    }

    /* Deterministic so the field never reshuffles between renders. */
    function seededRandom(seed) {
      let state = seed >>> 0
      return () => {
        state = (state * 1664525 + 1013904223) >>> 0
        return state / 4294967296
      }
    }

    const random = seededRandom(0x1f3a5c7d)

    const DARK_MOTE_COLORS = {
      white: 'rgba(255, 255, 255, 0.88)',
      blue: 'rgba(168, 198, 255, 0.88)',
      violet: 'rgba(196, 170, 255, 0.86)',
      pink: 'rgba(255, 186, 214, 0.82)',
    }

    /* On white, white motes vanish; use fine coloured specks instead. */
    const LIGHT_MOTE_COLORS = {
      white: 'rgba(78, 104, 168, 0.36)',
      blue: 'rgba(70, 108, 200, 0.4)',
      violet: 'rgba(128, 88, 214, 0.36)',
      pink: 'rgba(204, 82, 146, 0.34)',
    }

    const DARK_BOKEH_COLORS = [
      'rgba(180, 205, 255, 0.46)',
      'rgba(200, 175, 255, 0.4)',
      'rgba(255, 190, 215, 0.36)',
    ]

    const LIGHT_BOKEH_COLORS = [
      'rgba(100, 138, 225, 0.24)',
      'rgba(150, 112, 225, 0.22)',
      'rgba(225, 110, 165, 0.2)',
    ]

    const DARK_DUST_COLORS = [
      'rgba(155, 225, 255, 0.82)', // lake blue
      'rgba(178, 240, 205, 0.78)', // pale green
      'rgba(255, 214, 168, 0.76)', // pale orange
      'rgba(255, 178, 210, 0.8)', // rose
      'rgba(205, 185, 255, 0.8)', // light purple
    ]

    const LIGHT_DUST_COLORS = [
      'rgba(70, 150, 205, 0.4)',
      'rgba(75, 145, 105, 0.38)',
      'rgba(190, 135, 75, 0.36)',
      'rgba(190, 95, 135, 0.38)',
      'rgba(120, 95, 190, 0.36)',
    ]

    const MOTES = Array.from({ length: 24 }, () => {
      const roll = random()
      const tone = roll < 0.42 ? 'white' : roll < 0.68 ? 'blue' : roll < 0.87 ? 'violet' : 'pink'
      const size = 1.1 + random() * 2
      return {
        x: 2 + random() * 96,
        y: 4 + random() * 92,
        size,
        duration: 12 + random() * 16,
        delay: -random() * 28,
        opacity: 0.16 + random() * 0.4,
        dx: -14 + random() * 28,
        dy: -26 - random() * 30,
        tone,
      }
    })

    const BOKEH = Array.from({ length: 5 }, (_, index) => ({
      x: 5 + random() * 90,
      y: 3 + random() * 92,
      size: 10 + random() * 32,
      duration: 20 + random() * 22,
      delay: -random() * 32,
      dx: -20 + random() * 40,
      dy: -18 - random() * 26,
      tone: index % 3,
    }))

    /* Sparse rising dust concentrated in the bottom-left corner. */
    const DUST = Array.from({ length: 18 }, (_, index) => ({
      x: 2 + random() * 22,
      y: 55 + random() * 38,
      size: 1.6 + random() * 2.4,
      duration: 8 + random() * 6,
      delay: -random() * 14,
      opacity: 0.32 + random() * 0.33,
      dx: -10 + random() * 20,
      dy: -36 - random() * 36,
      tone: index % 5,
    }))

    const BLOBS = ['a', 'b', 'c', 'd', 'e']

    /* ── fixed meteors: one lane per reasoning level ──────────── */

    const FIXED_COUNTS = {
      off: 2,
      low: 4,
      high: 7,
      max: 10,
      other: 5,
    }

    const FIXED_METEORS = Array.from({ length: 10 }, (_, index) => {
      /* The first two are low-altitude lanes so the bottom-left corner is not
         empty; the rest keep the upper-left field. */
      const low = index < 2
      const angle = low ? 24 + random() * 8 : 16 + random() * 18
      const duration = 10 + random() * 6
      return {
        id: index,
        x: low ? -20 + random() * 12 : -12 + random() * 76,
        y: low ? 38 + random() * 30 : -16 + random() * 36,
        angle,
        length: 100 + random() * 130,
        duration,
        delay: -random() * duration,
        opacity: 0.28 + random() * 0.34,
      }
    })

    /* ── meteors, reasoning effort, and model styles ──────────── */

    const EFFORT_WEIGHTS = {
      off: 0.1,
      low: 0.36,
      high: 0.66,
      max: 1,
      other: 0.5,
    }

    /* Four model-flavoured meteor palettes. Each one carries a dark and a
       light set, because a white streak disappears on a white page. */
    const METEOR_STYLES = {
      flash: {
        dark: { tail: 'rgba(120, 210, 255, 0.5)', head: '#f4fbff', glow: 'rgba(110, 205, 255, 0.8)' },
        light: { tail: 'rgba(70, 140, 215, 0.24)', head: 'rgba(36, 88, 176, 0.58)', glow: 'rgba(80, 140, 220, 0.28)' },
        angle: [16, 24],
        length: [100, 190],
        speed: [0.8, 1.2],
      },
      flow: {
        dark: { tail: 'rgba(140, 190, 255, 0.45)', head: '#eef7ff', glow: 'rgba(130, 180, 255, 0.7)' },
        light: { tail: 'rgba(82, 128, 205, 0.24)', head: 'rgba(42, 82, 168, 0.56)', glow: 'rgba(90, 135, 210, 0.26)' },
        angle: [20, 30],
        length: [120, 220],
        speed: [0.95, 1.45],
      },
      reason: {
        dark: { tail: 'rgba(170, 150, 255, 0.48)', head: '#f6f0ff', glow: 'rgba(160, 130, 255, 0.75)' },
        light: { tail: 'rgba(112, 96, 200, 0.24)', head: 'rgba(68, 52, 158, 0.56)', glow: 'rgba(116, 96, 205, 0.26)' },
        angle: [24, 34],
        length: [150, 280],
        speed: [1.1, 1.7],
      },
      aurora: {
        dark: { tail: 'rgba(255, 160, 205, 0.4)', head: '#fff2f8', glow: 'rgba(255, 150, 200, 0.65)' },
        light: { tail: 'rgba(196, 96, 148, 0.2)', head: 'rgba(156, 50, 106, 0.5)', glow: 'rgba(196, 100, 150, 0.24)' },
        angle: [18, 28],
        length: [120, 230],
        speed: [1.0, 1.55],
      },
    }

    const IDEA_COLORS = {
      dark: {
        tail: 'rgba(235, 248, 255, 0.82)',
        head: '#ffffff',
        glow: 'rgba(225, 245, 255, 1)',
      },
      light: {
        tail: 'rgba(70, 110, 200, 0.3)',
        head: 'rgba(24, 60, 140, 0.72)',
        glow: 'rgba(80, 120, 220, 0.4)',
      },
    }

    function effortTierOf(level, index, count) {
      const raw = `${level?.id ?? ''} ${level?.name ?? ''}`.toLowerCase()
      if (raw.includes('off') || raw.includes('none') || raw.includes('disabled')) return 'off'
      if (raw.includes('max') || raw.includes('ultra')) return 'max'
      if (raw.includes('high')) return 'high'
      if (raw.includes('low') || raw.includes('min')) return 'low'
      if (count === 4) return ['off', 'low', 'high', 'max'][index] ?? 'other'
      return 'other'
    }

    function modelStyleKey(provider, modelId) {
      const raw = `${provider ?? ''} ${modelId ?? ''}`.toLowerCase()
      if (raw.trim() === '') return 'flow'
      if (/flash|fast|lite|mini/.test(raw)) return 'flash'
      if (/pro|reason|think|r1/.test(raw)) return 'reason'
      if (/vision|image|multimodal/.test(raw)) return 'aurora'
      if (/coder|code/.test(raw)) return 'flow'
      let hash = 2166136261
      for (let index = 0; index < raw.length; index += 1) {
        hash ^= raw.charCodeAt(index)
        hash = Math.imul(hash, 16777619)
      }
      return ['flash', 'flow', 'reason', 'aurora'][(hash >>> 0) % 4]
    }

    function selectActiveSessionId(state) {
      const byId = state?.byId
      if (byId === undefined || byId === null) return undefined
      for (const id of Object.keys(byId)) {
        const session = byId[id]
        if ((session?.retainedBy?.mainView ?? 0) > 0) return session.id ?? id
      }
      return undefined
    }

    const EMPTY_MODEL = Object.freeze({ current: null, groups: [] })

    /* ── on/off store (persisted, shared by the switch and Alt+L) ── */

    let currentOn = readStoredOn()
    const onListeners = new Set()

    function readStoredOn() {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (stored === 'off' || stored === '0') return false
        if (stored !== null) return true
      } catch {
        // Storage can be blocked; the default still applies.
      }
      return DEFAULT_ON
    }

    function persistOn(next) {
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
      } catch {
        // Non-fatal: the state still applies for this run.
      }
    }

    function notifyOn() {
      for (const listener of onListeners) {
        try {
          listener()
        } catch {
          // One broken subscriber must not stop the rest.
        }
      }
    }

    function setOn(next) {
      if (next === currentOn) return
      currentOn = next
      persistOn(next)
      notifyOn()
    }

    function toggleOn() {
      setOn(!currentOn)
    }

    function getOn() {
      return currentOn
    }

    function subscribeOn(listener) {
      onListeners.add(listener)
      return () => { onListeners.delete(listener) }
    }

    function useOn() {
      return React.useSyncExternalStore(subscribeOn, getOn, getOn)
    }

    /* ── theme store ──────────────────────────────────────────── */

    function createThemeStore(ctx) {
      const service = ctx.get('theme')
      const read = () => {
        try {
          return service?.getTheme?.() ?? null
        } catch {
          return null
        }
      }
      let snapshot = read()
      const listeners = new Set()
      const off = ctx.on('theme/change', (next) => {
        snapshot = next ?? read()
        for (const listener of listeners) {
          try {
            listener()
          } catch {
            // Keep notifying the other subscribers.
          }
        }
      })
      return {
        get: () => snapshot,
        subscribe: (listener) => {
          listeners.add(listener)
          return () => { listeners.delete(listener) }
        },
        dispose: () => {
          listeners.clear()
          if (typeof off === 'function') off()
        },
      }
    }

    const EMPTY_THEME_STORE = {
      get: () => null,
      subscribe: () => () => {},
    }

    function useTheme(store) {
      return React.useSyncExternalStore(store.subscribe, store.get, store.get)
    }

    /* ── composer surface: alpha + a materialColor-like tint ─── */

    function parseHex(value) {
      const match = /^#([0-9a-f]{3,8})$/i.exec(String(value).trim())
      if (match === null) return null
      let hex = match[1]
      if (hex.length === 3 || hex.length === 4) {
        hex = hex.slice(0, 3).split('').map(part => part + part).join('')
      } else {
        hex = hex.slice(0, 6)
      }
      if (hex.length !== 6) return null
      const int = parseInt(hex, 16)
      return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
    }

    function withAlpha(color, alpha) {
      const value = String(color).trim()
      const rgb = parseHex(value)
      if (rgb !== null) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
      return `color-mix(in srgb, ${value} ${Math.round(alpha * 100)}%, transparent)`
    }

    function tintedSurface(base, tint, amount, alpha) {
      const from = parseHex(base)
      const to = parseHex(tint)
      if (from === null || to === null) return withAlpha(base, alpha)
      const r = Math.round(from.r + (to.r - from.r) * amount)
      const g = Math.round(from.g + (to.g - from.g) * amount)
      const b = Math.round(from.b + (to.b - from.b) * amount)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    function resolveToken(tokens, name, depth = 0) {
      if (tokens === null || tokens === undefined || depth > 4) return null
      const value = tokens[name]
      if (typeof value !== 'string') return null
      const alias = /^var\((--[a-z0-9-]+)\)$/i.exec(value.trim())
      if (alias !== null) return resolveToken(tokens, alias[1], depth + 1)
      return value
    }

    function installSurfaceTint(ctx) {
      const service = ctx.get('theme')
      if (service === undefined || service === null) return () => {}
      if (typeof service.overrideTokens !== 'function') return () => {}
      let overrides
      try {
        const snapshot = service.getTheme()
        const read = (scheme, token, fallback) => {
          const theme = snapshot?.themes?.find(item => item.colorScheme === scheme)
          return resolveToken(theme?.tokens, token) ?? fallback
        }
        const baseLight = read('light', '--dsw-alias-bg-base', '#ffffff')
        const baseDark = read('dark', '--dsw-alias-bg-base', '#0f1115')
        /* One black for the whole chrome: the sidebar and the composer both
           derive from `bg-base`. The composer keeps transparency so the
           blurred conversation behind it becomes the material. */
        overrides = {
          '--dsw-specific-sidebar-fill': {
            light: baseLight,
            dark: baseDark,
          },
          '--dsw-specific-input-major': {
            light: tintedSurface(baseLight, '#6f8cff', 0.03, 0.72),
            dark: tintedSurface(baseDark, '#6f8cff', 0.03, 0.5),
          },
        }
      } catch {
        return () => {}
      }
      try {
        return service.overrideTokens('dsh-harmony-light:surface', overrides)
      } catch {
        // A theme may reject the derived value; keep the surface untouched.
        return () => {}
      }
    }

    /* ── press light: one bloom per real interaction ──────────── */

    let rippleSeq = 0

    function useInteractionRipples(enabled, setRipples) {
      React.useEffect(() => {
        if (!enabled || typeof window === 'undefined') return undefined
        const media = typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-reduced-motion: reduce)')
          : null
        if (media !== null && media.matches) return undefined

        const timers = new Set()
        const onPointerDown = (event) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return
          const target = event.target
          if (!(target instanceof Element)) return
          if (target.closest('.dhl-ios-switch') !== null) return
          /* Keep the composer calm while typing: only controls answer with a
             press light, not caret placement inside the editor. */
          if (target.closest('input, textarea, select, [contenteditable="true"]') !== null) return
          const interactive = target.closest(
            'button, a, summary, ' +
            '[role="button"], [role="switch"], [role="option"], [role="tab"], ' +
            '[role="menuitem"], [tabindex]:not([tabindex="-1"])',
          )
          if (interactive === null) return

          const ripple = { id: ++rippleSeq, x: event.clientX, y: event.clientY }
          setRipples(list => [...list, ripple])
          const timer = window.setTimeout(() => {
            timers.delete(timer)
            setRipples(list => list.filter(item => item.id !== ripple.id))
          }, 720)
          timers.add(timer)
        }

        window.addEventListener('pointerdown', onPointerDown, true)
        return () => {
          window.removeEventListener('pointerdown', onPointerDown, true)
          for (const timer of timers) window.clearTimeout(timer)
          timers.clear()
        }
      }, [enabled, setRipples])
    }

    function useDocumentVisible() {
      const [visible, setVisible] = React.useState(
        () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
      )
      React.useEffect(() => {
        const onChange = () => setVisible(document.visibilityState !== 'hidden')
        document.addEventListener('visibilitychange', onChange)
        return () => { document.removeEventListener('visibilitychange', onChange) }
      }, [])
      return visible
    }

    function useNoSessions() {
      return undefined
    }

    function useNoSessionStatus() {
      return false
    }

    function useNoChat() {
      return ''
    }

    /* ── idea meteors: a new agent thought, kept only if the user follows ── */

    let ideaSeq = 0
    let ideaSnapshot = []
    const ideaRecords = new Map()
    const ideaListeners = new Set()
    const ideaLastAt = new Map()

    function notifyIdeas() {
      ideaSnapshot = Array.from(ideaRecords.values(), record => ({ ...record.data }))
      for (const listener of ideaListeners) {
        try {
          listener()
        } catch {
          // Keep notifying the other subscribers.
        }
      }
    }

    function subscribeIdeas(listener) {
      ideaListeners.add(listener)
      return () => { ideaListeners.delete(listener) }
    }

    function getIdeaSnapshot() {
      return ideaSnapshot
    }

    function removeIdeaRecord(record) {
      if (record.timer) window.clearTimeout(record.timer)
      if (record.removal) window.clearTimeout(record.removal)
      ideaRecords.delete(record.data.id)
    }

    function addIdea(sessionId) {
      if (!sessionId) return
      const now = Date.now()
      const last = ideaLastAt.get(sessionId) ?? 0
      if (now - last < 6000) return
      ideaLastAt.set(sessionId, now)
      const existing = [...ideaRecords.values()].filter(record => record.data.sessionId === sessionId)
      while (existing.length >= 4) removeIdeaRecord(existing.shift())
      const data = {
        id: ++ideaSeq,
        sessionId,
        createdAt: now,
        executed: false,
        expired: false,
        seed: ideaSeq * 7919,
      }
      const record = { data, timer: 0, removal: 0 }
      record.timer = window.setTimeout(() => {
        record.timer = 0
        if (data.executed || data.expired) return
        data.expired = true
        notifyIdeas()
        record.removal = window.setTimeout(() => {
          record.removal = 0
          ideaRecords.delete(data.id)
          notifyIdeas()
        }, 900)
      }, 20000)
      ideaRecords.set(data.id, record)
      notifyIdeas()
    }

    function markIdeaExecuted(sessionId) {
      if (!sessionId) return
      for (const record of ideaRecords.values()) {
        if (record.data.sessionId !== sessionId) continue
        if (record.data.executed || record.data.expired) continue
        record.data.executed = true
        if (record.timer) {
          window.clearTimeout(record.timer)
          record.timer = 0
        }
        notifyIdeas()
        return
      }
    }

    function meteorVector(angle, travelX) {
      const radians = angle * Math.PI / 180
      const dx = Math.cos(radians) * travelX
      if (typeof window === 'undefined') return { dx, dy: dx }
      const dy = Math.tan(radians) * dx * (window.innerWidth / window.innerHeight)
      return { dx, dy }
    }

    function ideaMeteorSpec(idea) {
      const seed = idea.seed >>> 0
      return {
        id: idea.id,
        x: 2 + (seed % 70),
        y: -12 + (seed % 30),
        angle: 18 + (seed % 16),
        length: 180 + (seed % 80),
        duration: 11 + (seed % 5),
        delay: -(seed % 7),
        opacity: 0.9,
      }
    }

    function particleSpecs(meteor, idea, dim) {
      const seed = (meteor.id + 1) * (idea ? 97 : 53)
      const count = 4 + (seed % 5)
      return Array.from({ length: count }, (_, index) => {
        const spread = (index + 1) / (count + 1)
        const jitter = ((seed * 13 + index * 29) % 21) / 100
        return {
          left: meteor.length * (0.1 + spread * 0.82 + jitter * 0.06),
          size: 1.2 + ((seed + index * 7) % 5) * 0.5,
          delay: meteor.delay - (((seed + index * 11) % 13) / 10),
          duration: meteor.duration * (0.82 + ((seed + index * 3) % 5) * 0.05),
          opacity: (0.24 + ((seed + index * 17) % 56) / 100) * dim,
        }
      })
    }

    function renderFixedMeteor(meteor, active, colors, idea, dim = 1, generation = 0) {
      const vector = meteorVector(meteor.angle, 50 + (meteor.id % 3) * 8)
      const midX = vector.dx * 0.5 + 1.1
      const midY = vector.dy * 0.5 - 1.4
      const particles = particleSpecs(meteor, idea, dim)
      const keyBase = `${idea ? 'idea' : 'fixed'}-${meteor.id}-${generation}`
      return h(
        'span',
        {
          key: idea ? `idea-${meteor.id}` : `fixed-${meteor.id}`,
          className: 'dhl-fixed-meteor',
          'data-active': active ? 'true' : 'false',
          'data-idea': idea ? 'true' : 'false',
          style: {
            left: `${meteor.x}%`,
            top: `${meteor.y}%`,
            '--dhl-fixed-angle': `${meteor.angle.toFixed(1)}deg`,
            '--dhl-fixed-dx': `${vector.dx.toFixed(1)}vw`,
            '--dhl-fixed-dy': `${vector.dy.toFixed(1)}vh`,
            '--dhl-fixed-mx': `${midX.toFixed(1)}vw`,
            '--dhl-fixed-my': `${midY.toFixed(1)}vh`,
            '--dhl-fixed-duration': `${meteor.duration.toFixed(2)}s`,
            '--dhl-fixed-delay': `${meteor.delay.toFixed(2)}s`,
            '--dhl-fixed-opacity': (idea ? 1 : meteor.opacity * dim).toFixed(2),
            '--dhl-fixed-length': `${meteor.length.toFixed(0)}px`,
            '--dhl-fixed-tail': colors.tail,
            '--dhl-fixed-head': colors.head,
            '--dhl-fixed-glow': colors.glow,
          },
        },
        h(
          'span',
          { key: `${keyBase}-streak`, className: 'dhl-fixed-streak' },
          h('span', { className: 'dhl-fixed-head' }),
        ),
        particles.map((particle, index) => h('span', {
          key: `${keyBase}-p-${index}`,
          className: 'dhl-fixed-particle',
          style: {
            left: `${particle.left.toFixed(0)}px`,
            width: `${particle.size.toFixed(1)}px`,
            height: `${particle.size.toFixed(1)}px`,
            '--dhl-fixed-opacity': particle.opacity.toFixed(2),
            animationDelay: `${particle.delay.toFixed(2)}s`,
            animationDuration: `${particle.duration.toFixed(2)}s`,
          },
        })),
      )
    }

    function HarmonyObserver(props) {
      const sessionId = props.sessionId
      const useChat = typeof props.useChat === 'function' ? props.useChat : useNoChat
      const useSessionStatus = typeof props.useSessionStatus === 'function'
        ? props.useSessionStatus
        : useNoSessionStatus
      const selectRunning = React.useCallback(
        (status) => sessionId === undefined ? false : Boolean(status?.get?.(sessionId)?.running),
        [sessionId],
      )
      const running = useSessionStatus(selectRunning)
      /* Scan only the newest 12 nodes: enough to catch the assistant step that
         a tool-call node may have pushed off the tail, cheap on long sessions. */
      const activity = useChat((snapshot) => {
        const order = snapshot?.order
        if (!order || order.length === 0) return '0:0:0'
        const start = Math.max(0, order.length - 12)
        let assistant = 0
        let user = 0
        for (let index = start; index < order.length; index += 1) {
          const node = snapshot.nodes?.get?.(order[index])
          if (node?.kind === 'assistant-step') assistant += 1
          else if (node?.kind === 'user' || node?.kind === 'steering') user += 1
        }
        return `${order.length}:${assistant}:${user}`
      })
      const activityRef = React.useRef(null)
      const sessionRef = React.useRef(sessionId)
      React.useEffect(() => {
        if (sessionRef.current !== sessionId) {
          sessionRef.current = sessionId
          activityRef.current = activity
          return
        }
        if (activityRef.current === null) {
          activityRef.current = activity
          return
        }
        if (activityRef.current === activity) return
        const [length, assistant, user] = activity.split(':').map(Number)
        const [previousLength, previousAssistant, previousUser] = activityRef.current
          .split(':')
          .map(Number)
        activityRef.current = activity
        if (length === previousLength && assistant === previousAssistant && user === previousUser) {
          return
        }
        if (user > previousUser) markIdeaExecuted(sessionId)
        if (assistant > previousAssistant && running) addIdea(sessionId)
      }, [activity, running, sessionId])
      return null
    }

    /* ── component ────────────────────────────────────────────── */

    function HarmonyLight(props) {
      const t = typeof props.t === 'function' ? props.t : fallbackTranslate
      const store = props.themeStore ?? EMPTY_THEME_STORE
      const on = useOn()
      const theme = useTheme(store)
      const scheme = theme?.active?.colorScheme === 'light' ? 'light' : 'dark'
      const visible = useDocumentVisible()
      const [ripples, setRipples] = React.useState([])
      const [arc, setArc] = React.useState(0)

      useInteractionRipples(on, setRipples)

      const toggle = () => {
        setArc(value => value + 1)
        toggleOn()
      }

      React.useEffect(() => {
        const onKeyDown = (event) => {
          if (event.code !== 'KeyL' || !event.altKey) return
          if (event.ctrlKey || event.metaKey || event.shiftKey) return
          event.preventDefault()
          setArc(value => value + 1)
          toggleOn()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => { window.removeEventListener('keydown', onKeyDown) }
      }, [])

      /* ── live session signal: is the active session thinking? ── */

      const useSessions = typeof props.useSessions === 'function' ? props.useSessions : useNoSessions
      const useSessionStatus = typeof props.useSessionStatus === 'function'
        ? props.useSessionStatus
        : useNoSessionStatus
      const sessionId = useSessions(selectActiveSessionId)
      const selectRunning = React.useCallback(
        (statusSnapshot) => {
          if (sessionId === undefined || statusSnapshot === undefined || statusSnapshot === null) {
            return false
          }
          return Boolean(statusSnapshot.get(sessionId)?.running)
        },
        [sessionId],
      )
      const running = useSessionStatus(selectRunning)

      /* ── model directory: reasoning effort and model flavour ─── */

      const getDirectory = props.getDirectory
      const directory = React.useMemo(() => {
        if (sessionId === undefined || typeof getDirectory !== 'function') return null
        try {
          return getDirectory(sessionId) ?? null
        } catch {
          return null
        }
      }, [sessionId, getDirectory])

      const subscribeModel = React.useCallback(
        (listener) => directory === null ? () => {} : directory.store.subscribe(listener),
        [directory],
      )
      const readModel = React.useCallback(
        () => directory === null ? EMPTY_MODEL : directory.store.getSnapshot() ?? EMPTY_MODEL,
        [directory],
      )
      const modelSnapshot = React.useSyncExternalStore(subscribeModel, readModel, readModel)

      React.useEffect(() => {
        if (directory === null || typeof directory.load !== 'function') return undefined
        void Promise.resolve().then(() => directory.load()).catch(() => {})
        return undefined
      }, [directory])

      const current = modelSnapshot.current
      const group = current === null || current === undefined
        ? null
        : (modelSnapshot.groups ?? []).find(item => item.id === current.provider) ?? null
      const model = group === null || current === null || current === undefined
        ? null
        : (group.models ?? []).find(item => item.id === current.model) ?? null
      const efforts = Array.isArray(model?.reasoning?.efforts) ? model.reasoning.efforts : []
      const activeEffortId = current?.reasoningEffort ?? model?.reasoning?.defaultEffort
      let effortIndex = efforts.findIndex(item => item.id === activeEffortId)
      if (effortIndex < 0) effortIndex = 0
      const effortTier = effortTierOf(efforts[effortIndex], effortIndex, efforts.length)
      const effortWeight = EFFORT_WEIGHTS[effortTier] ?? 0.5
      const styleKey = modelStyleKey(current?.provider, current?.model)
      const fixedCount = FIXED_COUNTS[effortTier] ?? FIXED_COUNTS.other
      const meteorStyle = METEOR_STYLES[styleKey] ?? METEOR_STYLES.flow
      const fixedColors = scheme === 'light' ? meteorStyle.light : meteorStyle.dark
      const ideaColors = scheme === 'light' ? IDEA_COLORS.light : IDEA_COLORS.dark
      const ideas = React.useSyncExternalStore(subscribeIdeas, getIdeaSnapshot, getIdeaSnapshot)
      const sessionIdeas = sessionId === undefined
        ? []
        : ideas.filter(idea => idea.sessionId === sessionId)

      /* Every time a reasoning level adds a meteor, bump its generation so the
         streak restarts at the path start and flies in along its own route.
         Removals keep the generation, so the streak keeps travelling while
         the wrapper fades out. */
      const [generations, setGenerations] = React.useState(() => FIXED_METEORS.map(() => 0))
      const previousFixedCount = React.useRef(fixedCount)
      React.useEffect(() => {
        const previous = previousFixedCount.current
        previousFixedCount.current = fixedCount
        if (fixedCount <= previous) return
        setGenerations(list => list.map((value, index) => (
          index >= previous && index < fixedCount ? value + 1 : value
        )))
      }, [fixedCount])

      /* Enabling the effect restarts every fixed streak at its path start, so
         the meteors follow the light arc instead of appearing mid-flight. */
      const previousOn = React.useRef(on)
      React.useEffect(() => {
        if (on && !previousOn.current) {
          setGenerations(list => list.map(value => value + 1))
        }
        previousOn.current = on
      }, [on])

      /* No token-rate API is exposed to `shell.overlay`; the envelope below
         folds the run state, the reasoning level, and a slow organic pulse
         into one 0..1 intensity. */
      const [pulse, setPulse] = React.useState(0.6)
      React.useEffect(() => {
        if (!running || !visible) {
          setPulse(0)
          return undefined
        }
        let timer = 0
        const started = Date.now()
        const tick = () => {
          const seconds = (Date.now() - started) / 1000
          const value = 0.72 + 0.18 * Math.sin(seconds * 1.45) + 0.1 * Math.sin(seconds * 3.7 + 0.9)
          setPulse(Math.max(0, Math.min(1, value)))
          timer = window.setTimeout(tick, 850)
        }
        tick()
        return () => window.clearTimeout(timer)
      }, [running, visible])

      const intensity = !on
        ? 0
        : running
          ? Math.min(1, 0.28 + effortWeight * 0.5 + pulse * 0.22)
          : 0.09 + effortWeight * 0.05

      /* ── meteor spawner ──────────────────────────────────────── */

      const [meteors, setMeteors] = React.useState([])
      const meteorSeq = React.useRef(0)
      const meteorTimers = React.useRef(new Set())
      const intensityRef = React.useRef(intensity)
      intensityRef.current = intensity

      const spawnMeteor = React.useCallback((density) => {
        if (!on || typeof window === 'undefined') return
        const style = METEOR_STYLES[styleKey] ?? METEOR_STYLES.flow
        const colors = scheme === 'light' ? style.light : style.dark
        const angle = style.angle[0] + Math.random() * (style.angle[1] - style.angle[0])
        const lengthScale = 0.7 + effortWeight * 0.55
        const length = (style.length[0] + Math.random() * (style.length[1] - style.length[0]))
          * lengthScale
        const speedScale = 1.12 - effortWeight * 0.24
        const duration = (style.speed[0] + Math.random() * (style.speed[1] - style.speed[0]))
          * speedScale * 1.3
        const travelX = 30 + Math.random() * 28
        const radians = angle * Math.PI / 180
        const dx = Math.cos(radians) * travelX
        const dy = Math.tan(radians) * dx * (window.innerWidth / window.innerHeight)
        const midX = dx * 0.5 + 1
        const midY = dy * 0.5 - 1.2
        const opacity = Math.min(
          0.9,
          0.24 + effortWeight * 0.38 + density * 0.18,
        ) * (0.75 + Math.random() * 0.25)
        const meteor = {
          id: ++meteorSeq.current,
          x: -8 + Math.random() * 76,
          y: -14 + Math.random() * 36,
          length,
          angle,
          dx,
          dy,
          midX,
          midY,
          duration,
          opacity,
          tail: colors.tail,
          head: colors.head,
          glow: colors.glow,
        }
        setMeteors(list => [...list.slice(-9), meteor])
        const timer = window.setTimeout(() => {
          meteorTimers.current.delete(timer)
          setMeteors(list => list.filter(item => item.id !== meteor.id))
        }, duration * 1000 + 260)
        meteorTimers.current.add(timer)
      }, [on, styleKey, scheme, effortWeight])

      const spawnMeteorRef = React.useRef(spawnMeteor)
      spawnMeteorRef.current = spawnMeteor

      React.useEffect(() => {
        if (!on || !visible) return undefined
        let cancelled = false
        let timer = 0
        const schedule = () => {
          const hot = intensityRef.current
          const delay = 420 + Math.pow(1 - hot, 2) * 5000 + Math.random() * 500
          timer = window.setTimeout(() => {
            if (cancelled) return
            spawnMeteorRef.current(hot)
            if (hot > 0.78 && Math.random() < 0.35) spawnMeteorRef.current(hot)
            schedule()
          }, delay)
        }
        schedule()
        return () => {
          cancelled = true
          window.clearTimeout(timer)
        }
      }, [on, visible])

      const wasRunning = React.useRef(false)
      React.useEffect(() => {
        if (running && !wasRunning.current) {
          const count = effortTier === 'max' ? 4 : effortTier === 'high' ? 3 : 2
          const timers = []
          for (let index = 0; index < count; index += 1) {
            timers.push(window.setTimeout(() => spawnMeteorRef.current(1), index * 110))
          }
          wasRunning.current = true
          return () => { for (const item of timers) window.clearTimeout(item) }
        }
        wasRunning.current = running
        return undefined
      }, [running, effortTier])

      const wasOn = React.useRef(false)
      React.useEffect(() => {
        if (on && !wasOn.current) spawnMeteorRef.current(0.35)
        wasOn.current = on
      }, [on])

      React.useEffect(() => () => {
        for (const timer of meteorTimers.current) window.clearTimeout(timer)
        meteorTimers.current.clear()
      }, [])

      const moteColors = scheme === 'light' ? LIGHT_MOTE_COLORS : DARK_MOTE_COLORS
      const bokehColors = scheme === 'light' ? LIGHT_BOKEH_COLORS : DARK_BOKEH_COLORS
      const dustColors = scheme === 'light' ? LIGHT_DUST_COLORS : DARK_DUST_COLORS
      const stateLabel = on ? t('onState') : t('offState')
      const rootProps = {
        'data-on': on ? 'true' : 'false',
        'data-scheme': scheme,
        'data-visible': visible ? 'true' : 'false',
      }

      const effect = h(
        'div',
        { className: 'dhl-effect', 'aria-hidden': 'true' },
          h(
            'div',
            { className: 'dhl-field' },
            BLOBS.map(blob => h('span', {
              key: `blob-${blob}`,
              className: `dhl-blob dhl-blob-${blob}`,
            })),
          ),
          h('div', { className: 'dhl-wash' }),
          h('div', { className: 'dhl-pool' }),
          h(
            'div',
            { className: 'dhl-bokeh' },
            BOKEH.map((orb, index) => h('span', {
              key: `bokeh-${index}`,
              className: 'dhl-bokeh-orb',
              style: {
                left: `${orb.x.toFixed(2)}%`,
                top: `${orb.y.toFixed(2)}%`,
                width: `${orb.size.toFixed(1)}px`,
                height: `${orb.size.toFixed(1)}px`,
                marginLeft: `${(-orb.size / 2).toFixed(1)}px`,
                marginTop: `${(-orb.size / 2).toFixed(1)}px`,
                '--dhl-bokeh-color': bokehColors[orb.tone],
                '--dhl-dx': `${orb.dx.toFixed(1)}px`,
                '--dhl-dy': `${orb.dy.toFixed(1)}px`,
                '--dhl-bok-dur': `${orb.duration.toFixed(1)}s`,
                '--dhl-bok-delay': `${orb.delay.toFixed(1)}s`,
              },
            })),
          ),
          h(
            'div',
            { className: 'dhl-motes' },
            MOTES.map((mote, index) => h('span', {
              key: `mote-${index}`,
              className: 'dhl-mote',
              style: {
                left: `${mote.x.toFixed(2)}%`,
                top: `${mote.y.toFixed(2)}%`,
                width: `${mote.size.toFixed(1)}px`,
                height: `${mote.size.toFixed(1)}px`,
                '--dhl-mote-color': moteColors[mote.tone],
                '--dhl-mote-glow': `${(mote.size * 3.4).toFixed(1)}px`,
                '--dhl-mote-glow2': `${(mote.size * 7.5).toFixed(1)}px`,
                '--dhl-mote-opacity': mote.opacity.toFixed(2),
                '--dhl-dx': `${mote.dx.toFixed(1)}px`,
                '--dhl-dy': `${mote.dy.toFixed(1)}px`,
                '--dhl-dx2': `${(mote.dx * 0.4).toFixed(1)}px`,
                '--dhl-dy2': `${(mote.dy * 1.7).toFixed(1)}px`,
                '--dhl-dur': `${mote.duration.toFixed(1)}s`,
                '--dhl-delay': `${mote.delay.toFixed(1)}s`,
              },
            })),
          ),
          h(
            'div',
            { className: 'dhl-dust' },
            DUST.map((mote, index) => h('span', {
              key: `dust-${index}`,
              className: 'dhl-dust-mote',
              style: {
                left: `${mote.x.toFixed(2)}%`,
                top: `${mote.y.toFixed(2)}%`,
                width: `${mote.size.toFixed(1)}px`,
                height: `${mote.size.toFixed(1)}px`,
                '--dhl-dust-color': dustColors[mote.tone],
                '--dhl-dust-opacity': mote.opacity.toFixed(2),
                '--dhl-dust-dx': `${mote.dx.toFixed(1)}px`,
                '--dhl-dust-dy': `${mote.dy.toFixed(1)}px`,
                '--dhl-dust-duration': `${mote.duration.toFixed(1)}s`,
                '--dhl-dust-delay': `${mote.delay.toFixed(1)}s`,
              },
            })),
          ),
          h('div', { className: 'dhl-edge' }),
          h('div', { className: 'dhl-grain' }),
          h(
            'div',
            { className: 'dhl-fixed-meteors' },
            FIXED_METEORS.map((meteor, index) => renderFixedMeteor(
              meteor,
              index < fixedCount,
              fixedColors,
              false,
              running ? 1 : 0.72,
              generations[index] ?? 0,
            )),
            sessionIdeas.map(idea => renderFixedMeteor(
              ideaMeteorSpec(idea),
              !idea.expired,
              ideaColors,
              true,
            )),
          ),
          h(
            'div',
            { className: 'dhl-meteors' },
            meteors.map(meteor => h('span', {
              key: meteor.id,
              className: 'dhl-meteor',
              style: {
                left: `${meteor.x.toFixed(2)}%`,
                top: `${meteor.y.toFixed(2)}%`,
                width: `${meteor.length.toFixed(0)}px`,
                '--dhl-meteor-dx': `${meteor.dx.toFixed(1)}vw`,
                '--dhl-meteor-dy': `${meteor.dy.toFixed(1)}vh`,
                '--dhl-meteor-mx': `${meteor.midX.toFixed(1)}vw`,
                '--dhl-meteor-my': `${meteor.midY.toFixed(1)}vh`,
                '--dhl-meteor-angle': `${meteor.angle.toFixed(1)}deg`,
                '--dhl-meteor-tail': meteor.tail,
                '--dhl-meteor-head': meteor.head,
                '--dhl-meteor-glow': meteor.glow,
                '--dhl-meteor-opacity': meteor.opacity.toFixed(2),
                '--dhl-meteor-duration': `${meteor.duration.toFixed(2)}s`,
              },
            })),
          ),
          h('div', { className: 'dhl-enter' }),
      )

      const overlay = h(
        'div',
        { className: 'dhl-root dhl-overlay', ...rootProps },
        arc > 0
          ? h('div', {
            key: `sweep-${arc}`,
            className: 'dhl-toggle-sweep',
            'aria-hidden': 'true',
          })
          : null,
        h(
          'div',
          { className: 'dhl-ripples', 'aria-hidden': 'true' },
          ripples.map(ripple => h(
            'span',
            {
              key: ripple.id,
              className: 'dhl-ripple',
              style: { left: `${ripple.x}px`, top: `${ripple.y}px` },
            },
            h('span', { className: 'dhl-ripple-core' }),
            h('span', { className: 'dhl-ripple-ring' }),
          )),
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'dhl-ios-switch',
            role: 'switch',
            'aria-checked': on,
            'aria-label': t('name'),
            title: `${t('name')} · ${stateLabel} · ${t('hint')}`,
            'data-on': on ? 'true' : 'false',
            onClick: toggle,
          },
          h('span', { className: 'dhl-ios-track', 'aria-hidden': 'true' }),
          h('span', { className: 'dhl-ios-knob', 'aria-hidden': 'true' }),
        ),
      )

      return h('div', { className: 'dhl-root', ...rootProps }, effect, overlay)
    }

    /* ── plugin entry ─────────────────────────────────────────── */

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-harmony-light:locale')
      ctx.effect(installStyles, 'dsh-harmony-light:styles')
      ctx.effect(() => installSurfaceTint(ctx), 'dsh-harmony-light:surface')

      const themeStore = createThemeStore(ctx)
      ctx.effect(() => () => themeStore.dispose(), 'dsh-harmony-light:theme')

      ctx.effect(() => () => {
        for (const record of ideaRecords.values()) removeIdeaRecord(record)
        ideaRecords.clear()
        notifyIdeas()
      }, 'dsh-harmony-light:ideas')

      ctx.effect(() => {
        const onStorage = (event) => {
          if (event.key !== STORAGE_KEY) return
          const next = event.newValue !== 'off' && event.newValue !== '0'
          if (next === currentOn) return
          currentOn = next
          notifyOn()
        }
        window.addEventListener('storage', onStorage)
        return () => { window.removeEventListener('storage', onStorage) }
      }, 'dsh-harmony-light:storage')

      const directoryFor = (sessionId) => {
        if (sessionId === undefined || sessionId === null) return null
        let service
        try {
          service = ctx.get('modelDirectories')
        } catch {
          service = undefined
        }
        if (service === undefined || service === null) {
          /* The directory service can live on the per-session scope; root
             overlay entries still need the same face for the active session. */
          try {
            const sessions = ctx.get('sessions')
            const scope = sessions?.scope?.(sessionId)
            service = scope?.get?.('modelDirectories')
          } catch {
            service = undefined
          }
        }
        if (service === undefined || service === null) return null
        try {
          return service.directoryFor(sessionId) ?? null
        } catch {
          return null
        }
      }

      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'dsh-harmony-light',
        order: -100,
        locale: NS,
        inject: () => ({ themeStore, getDirectory: directoryFor }),
      }, HarmonyLight))

      /* Invisible session observer: watches new Chat nodes to turn a fresh
         agent step into a bright idea meteor, and a follow-up user message
         into "keep it flying". */
      ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
        name: 'conversation.input.left',
        id: 'dsh-harmony-light-observer',
        order: 999,
      }, HarmonyObserver))
    }

    return {
      name: 'dsh-harmony-light',
      inject: ['slots', 'locale', 'sessions', 'remote', 'remote.session', 'modelDirectories'],
      apply,
    }
  },
})
