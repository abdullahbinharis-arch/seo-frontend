/**
 * Logo — Full LocalRankr brand mark (icon + text).
 *
 * Sizes: hero (76px icon), large (48px), medium (36px), sidebar (18px in box), icon (icon only)
 * Animated: adds float, data-flow pulses, orbiting dot, core glow breathing
 */
"use client";

import { LogoIcon } from "./LogoIcon";

type LogoSize = "hero" | "large" | "medium" | "sidebar" | "icon";

const SIZE_CFG = {
  hero:    { icon: 76, textSize: 46, gap: 16, io: true },
  large:   { icon: 48, textSize: 28, gap: 12, io: true },
  medium:  { icon: 36, textSize: 20, gap: 10, io: false },
  sidebar: { icon: 18, textSize: 15, gap: 10, io: false },
  icon:    { icon: 48, textSize: 0,  gap: 0,  io: false },
} as const;

export function Logo({
  size = "medium",
  animated = false,
  showText = true,
}: {
  size?: LogoSize;
  animated?: boolean;
  showText?: boolean;
}) {
  const cfg = SIZE_CFG[size];

  const icon =
    size === "sidebar" ? (
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.12)",
        }}
      >
        {animated ? (
          <AnimatedIcon size={cfg.icon} />
        ) : (
          <LogoIcon size={cfg.icon} />
        )}
      </div>
    ) : (
      <div className={animated ? "logo-float" : undefined}>
        {animated ? (
          <AnimatedIcon size={cfg.icon} />
        ) : (
          <LogoIcon size={cfg.icon} />
        )}
      </div>
    );

  if (size === "icon" || !showText) {
    return icon;
  }

  return (
    <div className="flex items-center" style={{ gap: cfg.gap }}>
      {icon}
      <span
        className="font-logo font-bold leading-none"
        style={{ fontSize: cfg.textSize }}
      >
        <span style={{ color: "#fafafa" }}>Local</span>
        <span style={{ color: "#6ee7b7" }}>Rankr</span>
        {cfg.io && <span style={{ color: "#6ee7b7" }}>.io</span>}
      </span>
    </div>
  );
}

/** Animated variant with data-flow pulses, orbiting dot, and breathing glow. */
function AnimatedIcon({ size }: { size: number }) {
  const id = `logo-anim-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className="logo-animated-icon"
    >
      <defs>
        {/* Orbiting dot path */}
        <circle id={`${id}-orbit`} cx="50" cy="50" r="46" />
      </defs>

      {/* Outer ring */}
      <circle cx="50" cy="50" r="46" stroke="#10b981" strokeWidth="1.5" opacity="0.12" />

      {/* Inner dashed ring — counter-rotating */}
      <circle
        cx="50" cy="50" r="26"
        stroke="#10b981" strokeWidth="0.8" opacity="0.08"
        strokeDasharray="4 6"
        className="logo-counter-rotate"
      />

      {/* Connection lines */}
      <line x1="50" y1="50" x2="22" y2="25" stroke="#3d8b6e" strokeWidth="1.2" opacity="0.35" />
      <line x1="50" y1="50" x2="78" y2="25" stroke="#4a8a9e" strokeWidth="1.2" opacity="0.35" />
      <line x1="50" y1="50" x2="22" y2="75" stroke="#3d8b6e" strokeWidth="1.2" opacity="0.25" />
      <line x1="50" y1="50" x2="78" y2="75" stroke="#4a8a9e" strokeWidth="1.2" opacity="0.25" />

      {/* Data flow pulse on top-left line */}
      <circle r="2" fill="#6ee7b7" opacity="0.7">
        <animateMotion dur="3s" repeatCount="indefinite" path="M50,50 L22,25" />
      </circle>

      {/* Data flow pulse on top-right line */}
      <circle r="2" fill="#4a9ab5" opacity="0.6">
        <animateMotion dur="3.5s" repeatCount="indefinite" path="M50,50 L78,25" begin="1.5s" />
      </circle>

      {/* Outer nodes */}
      <circle cx="22" cy="25" r="4.5" fill="#3daa7a" opacity="0.7" />
      <circle cx="78" cy="25" r="4.5" fill="#4a9ab5" opacity="0.7" />
      <circle cx="22" cy="75" r="4" fill="#3d8b6e" opacity="0.4" />
      <circle cx="78" cy="75" r="4" fill="#6670a8" opacity="0.4" />
      <circle cx="50" cy="12" r="3.5" fill="#4d8a6e" opacity="0.5" />

      {/* Core glow — breathing */}
      <circle cx="50" cy="50" r="18" fill="#10b981" opacity="0.08">
        <animate attributeName="r" values="16;20;16" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.06;0.12;0.06" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="50" r="13" fill="#10b981" opacity="0.12" />

      {/* Core circle */}
      <circle cx="50" cy="50" r="10" fill="#10b981" />

      {/* Map pin */}
      <path
        d="M50 43.5c-2.5 0-4.5 2-4.5 4.5s4.5 9 4.5 9 4.5-6.5 4.5-9-2-4.5-4.5-4.5z"
        fill="white"
        opacity="0.95"
      />
      <circle cx="50" cy="48" r="1.5" fill="#10b981" />

      {/* Orbiting dot */}
      <circle r="2.5" fill="#6ee7b7" opacity="0.5">
        <animateMotion dur="25s" repeatCount="indefinite">
          <mpath xlinkHref={`#${id}-orbit`} />
        </animateMotion>
      </circle>
    </svg>
  );
}
