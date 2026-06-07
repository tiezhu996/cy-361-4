import type { KpiItem } from "../types";
import { APP_THEME } from "../constants/app";

interface MetricGridProps {
  items: KpiItem[];
}

const toneColors: Record<string, string> = {
  primary: APP_THEME.accent,
  warm: APP_THEME.warm,
  cool: APP_THEME.cool,
  danger: APP_THEME.danger,
  neutral: APP_THEME.neutral,
};

export function MetricGrid({ items }: MetricGridProps) {
  return (
    <section className="metric-grid" aria-label="关键指标">
      {items.map((item) => {
        const color = toneColors[item.tone] || APP_THEME.accent;
        return (
          <article className="metric-card" key={item.label} style={{ borderLeft: `4px solid ${color}` }}>
            <span style={{ color: "#666" }}>{item.label}</span>
            <strong className="metric-value" style={{ color }}>
              {item.value}
            </strong>
            <small style={{ color: "#999" }}>{item.trend}</small>
          </article>
        );
      })}
    </section>
  );
}
