import React from "react";
import { useConfig } from "../../config/ConfigContext.jsx";
import PanelShell from "./PanelShell.jsx";

function Row({ label, value, unit, accent }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "0.7rem 0",
        borderBottom: "1px solid var(--divider)",
      }}
    >
      <span style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: accent || "var(--text)" }}>
        {value != null ? `${value}${unit || ""}` : "--"}
      </span>
    </div>
  );
}

function pollenColor(value) {
  if (value == null) return "var(--text)";
  const v = Number(value);
  if (v >= 4) return "var(--alert)";
  if (v >= 2) return "var(--accent)";
  return "var(--good)";
}

export default function WeatherPanel({ states, onClose }) {
  const config = useConfig();
  return (
    <PanelShell title="Weather Details" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <section>
          <h3 style={sectionHeading}>Sources</h3>
          {config.weatherSources.map((src) => {
            const s = states[src.entity];
            return (
              <Row
                key={src.entity}
                label={src.label}
                value={s?.attributes?.temperature}
                unit={s?.attributes?.temperature_unit || "°"}
              />
            );
          })}

          <h3 style={sectionHeading}>Air Quality</h3>
          {config.airQuality.map((aq) => {
            const s = states[aq.entity];
            return <Row key={aq.entity} label={aq.label} value={s?.state} />;
          })}
        </section>

        <section>
          <h3 style={sectionHeading}>Pollen &amp; Allergens</h3>
          {config.pollen.map((p) => {
            const s = states[p.entity];
            return (
              <Row
                key={p.entity}
                label={p.label}
                value={s?.state}
                accent={pollenColor(s?.state)}
              />
            );
          })}
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "1rem" }}>
            Pollen levels sourced from local scrape sensors. Color indicates relative severity
            (green = low, amber = moderate, red = high).
          </p>
        </section>
      </div>
    </PanelShell>
  );
}

const sectionHeading = {
  fontFamily: "var(--font-body)",
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--text-muted)",
  marginTop: "1.5rem",
  marginBottom: "0.3rem",
};
