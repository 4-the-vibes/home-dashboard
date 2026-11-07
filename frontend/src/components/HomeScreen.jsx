import React, { useState } from "react";
import { useConfig } from "../config/ConfigContext.jsx";
import FloorMap from "./FloorMap.jsx";
import CameraPanel from "./panels/CameraPanel.jsx";
import WeatherPanel from "./panels/WeatherPanel.jsx";
import UtilitiesPanel from "./panels/UtilitiesPanel.jsx";

const PANELS = [
  { id: "cameras", label: "Cameras" },
  { id: "weather", label: "Weather Details" },
  { id: "utilities", label: "Utilities" },
];

export default function HomeScreen({ states, haConnected }) {
  const config = useConfig();
  const [activeFloor, setActiveFloor] = useState(config.floors[0]?.id);
  const [openPanel, setOpenPanel] = useState(null); // null | 'cameras' | 'weather' | 'utilities'

  const floor = config.floors.find((f) => f.id === activeFloor);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          height: "4.5rem",
          borderBottom: "1px solid var(--divider)",
          background: "var(--surface)",
          flexShrink: 0,
        }}
      >
        {/* Floor tabs */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {config.floors.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFloor(f.id)}
              style={{
                padding: "0.6rem 1.1rem",
                borderRadius: "0.6rem",
                border: "none",
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                fontWeight: 500,
                background: f.id === activeFloor ? "var(--surface-elevated)" : "transparent",
                color: f.id === activeFloor ? "var(--text)" : "var(--text-muted)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {!haConnected && (
            <span style={{ fontSize: "0.8rem", color: "var(--alert)" }}>
              ● Reconnecting to Home Assistant
            </span>
          )}
          {/* Dropdown triggers */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {PANELS.map((p) => (
              <button
                key={p.id}
                onClick={() => setOpenPanel(openPanel === p.id ? null : p.id)}
                style={{
                  padding: "0.6rem 1.1rem",
                  borderRadius: "0.6rem",
                  border: "1px solid var(--divider)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  background: openPanel === p.id ? "var(--accent-dim)" : "var(--surface-elevated)",
                  color: openPanel === p.id ? "var(--accent)" : "var(--text)",
                }}
              >
                {p.label} ▾
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floor map fills remaining space */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {floor && <FloorMap floor={floor} states={states} />}
      </div>

      {/* Panel overlay */}
      {openPanel === "cameras" && <CameraPanel onClose={() => setOpenPanel(null)} />}
      {openPanel === "weather" && (
        <WeatherPanel states={states} onClose={() => setOpenPanel(null)} />
      )}
      {openPanel === "utilities" && (
        <UtilitiesPanel states={states} onClose={() => setOpenPanel(null)} />
      )}
    </div>
  );
}
