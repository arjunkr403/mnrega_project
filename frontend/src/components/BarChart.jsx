import React from "react";
import { useLanguage } from "../i18n/LanguageProvider";

export default function BarChart({ data = [], height = 180, padding = 24, xLabel = "", yLabel = "" }) {
  const width = 560;
  const values = data.map((d) => Number(d.value) || 0);
  const labels = data.map((d) => d.label);
  const max = Math.max(1, ...values);
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const barW = values.length > 0 ? innerW / values.length : innerW;
  const x = (i) => padding + i * barW + barW * 0.1;
  const barInnerW = barW * 0.8;
  const barH = (v) => ((v) / max) * innerH;

  const yBase = height - padding;

  const xTicks = [0, values.length - 1].filter((i) => i >= 0);
  const { t, tryT } = useLanguage();

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px]">
      {/* axes */}
      <line x1={padding} y1={padding} x2={padding} y2={yBase} stroke="#e2e8f0" />
      <line x1={padding} y1={yBase} x2={width - padding} y2={yBase} stroke="#e2e8f0" />

      {/* y-axis ticks (0 and max) */}
      <text x={padding - 6} y={yBase} textAnchor="end" fontSize="10" fill="#64748b">0</text>
      <text x={padding - 6} y={padding + 8} textAnchor="end" fontSize="10" fill="#64748b">{max}</text>

      {/* x labels (first/last) */}
      {xTicks.map((i) => {
        const raw = labels[i];
        const translated = tryT(`months.${raw}`, raw);
        return (
          <text key={i} x={x(i) + barInnerW / 2} y={yBase + 12} textAnchor={i === 0 ? "start" : "end"} fontSize="10" fill="#64748b">
            {translated}
          </text>
        );
      })}

      {/* axis titles */}
      {xLabel ? (
        <text x={(width) / 2} y={height - 4} textAnchor="middle" fontSize="11" fill="#475569">{xLabel}</text>
      ) : null}
      {yLabel ? (
        <text x={10} y={height / 2} textAnchor="middle" fontSize="11" fill="#475569" transform={`rotate(-90 10 ${height/2})`}>
          {yLabel}
        </text>
      ) : null}

      {/* bars */}
      {values.map((v, i) => {
        const h = barH(v);
        return (
          <rect key={i} x={x(i)} y={yBase - h} width={barInnerW} height={h} fill="#2563eb" />
        );
      })}
    </svg>
  );
}


