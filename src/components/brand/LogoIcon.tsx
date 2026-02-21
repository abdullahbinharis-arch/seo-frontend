/**
 * LogoIcon — Neural node network SVG icon only (no text).
 * Used for favicon, app icon, and anywhere the icon appears solo.
 */
export function LogoIcon({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="46" stroke="#10b981" strokeWidth="1.5" opacity="0.12" />

      {/* Connection lines */}
      <line x1="50" y1="50" x2="22" y2="25" stroke="#3d8b6e" strokeWidth="1.2" opacity="0.35" />
      <line x1="50" y1="50" x2="78" y2="25" stroke="#4a8a9e" strokeWidth="1.2" opacity="0.35" />
      <line x1="50" y1="50" x2="22" y2="75" stroke="#3d8b6e" strokeWidth="1.2" opacity="0.25" />
      <line x1="50" y1="50" x2="78" y2="75" stroke="#4a8a9e" strokeWidth="1.2" opacity="0.25" />

      {/* Outer nodes */}
      <circle cx="22" cy="25" r="4.5" fill="#3daa7a" opacity="0.7" />
      <circle cx="78" cy="25" r="4.5" fill="#4a9ab5" opacity="0.7" />
      <circle cx="22" cy="75" r="4" fill="#3d8b6e" opacity="0.4" />
      <circle cx="78" cy="75" r="4" fill="#6670a8" opacity="0.4" />
      <circle cx="50" cy="12" r="3.5" fill="#4d8a6e" opacity="0.5" />

      {/* Core glow rings */}
      <circle cx="50" cy="50" r="18" fill="#10b981" opacity="0.08" />
      <circle cx="50" cy="50" r="13" fill="#10b981" opacity="0.12" />

      {/* Core circle */}
      <circle cx="50" cy="50" r="10" fill="#10b981" />

      {/* Map pin icon (white) */}
      <path
        d="M50 43.5c-2.5 0-4.5 2-4.5 4.5s4.5 9 4.5 9 4.5-6.5 4.5-9-2-4.5-4.5-4.5z"
        fill="white"
        opacity="0.95"
      />
      <circle cx="50" cy="48" r="1.5" fill="#10b981" />
    </svg>
  );
}
