// Simple inline SVG icons for dashboard mini charts
// Usage: place inside .gv-area-chart or .gv-sparkline containers

export function ChartAreaIcon({ color = "blue" }) {
  const fill = color === "red" ? "#fecaca" : "#bfdbfe"; // light red / light blue
  const stroke = color === "red" ? "#ef4444" : "#3b82f6"; // red / blue
  const gradId = `grad-${color}`;
  return (
    <svg viewBox="0 0 300 140" preserveAspectRatio="none" aria-hidden="true" className="gv-chart-svg">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.7" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* area fill */}
      <path
        d="M0 120 L20 92 C40 60, 60 40, 80 70 C95 92, 115 25, 130 60 C150 100, 170 30, 190 86 C205 110, 225 75, 245 115 C255 130, 265 122, 280 84 L300 40 L300 140 L0 140 Z"
        fill={`url(#${gradId})`}
      />
      {/* trend line */}
      <path
        d="M0 120 L20 92 C40 60, 60 40, 80 70 C95 92, 115 25, 130 60 C150 100, 170 30, 190 86 C205 110, 225 75, 245 115 C255 130, 265 122, 280 84 L300 40"
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChartSparklineIcon({ color = "green" }) {
  const stroke = color === "green" ? "#22c55e" : color === "red" ? "#ef4444" : "#64748b";
  return (
    <svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true" className="gv-chart-svg">
      <path
        d="M10 100 C 60 40, 140 80, 200 70 C 240 65, 270 50, 290 30"
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}