import React from "react";
import { useLanguage } from "../i18n/LanguageProvider";

export default function PieChart({ completed = 0, ongoing = 0, size = 180, showLegend = true }) {
  const { t } = useLanguage();
  const total = Math.max(0, completed) + Math.max(0, ongoing);
  const radius = (size / 2) - 8;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const completedPct = total === 0 ? 0 : completed / total;
  const ongoingPct = total === 0 ? 0 : ongoing / total;

  const strokeWidth = 16;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-[180px]">
      {/* background circle */}
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />

      {/* completed arc (green) */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#16a34a"
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference * completedPct} ${circumference - circumference * completedPct}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />

      {/* ongoing arc stacked after completed (orange) */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference * ongoingPct} ${circumference - circumference * ongoingPct}`}
        strokeDashoffset={circumference * (1 - completedPct)}
        transform={`rotate(-90 ${cx} ${cy})`}
      />

      {/* center labels */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" className="fill-current" fill="#0f172a">
        {total === 0 ? "—" : Math.round(completedPct * 100) + "%"}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#64748b">
        {t("completed")}
      </text>
    </svg>
  );
}

export function PieLegend({ completed = 0, ongoing = 0 }) {
  const total = Math.max(0, completed) + Math.max(0, ongoing);
  const pct = (v) => (total === 0 ? 0 : Math.round((v / total) * 100));
  const { t, tryT } = useLanguage();

  const Item = ({ color, label, value }) => (
    <div className="flex items-center gap-2 text-sm">
      <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: color }} />
      <span className="text-slate-700">{t(label)}</span>
      <span className="text-slate-500">{value} ({pct(value)}%)</span>
    </div>
  );
  return (
    <div className="mt-2 grid grid-cols-2 gap-3">
      <Item color="#16a34a" label="completed" value={completed} />
      <Item color="#f59e0b" label="ongoing" value={ongoing} />
    </div>
  );
}


