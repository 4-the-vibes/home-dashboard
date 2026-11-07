import React from "react";
import { useConfig } from "../../config/ConfigContext.jsx";
import { callService } from "../../api/haClient";
import PanelShell from "./PanelShell.jsx";

function UtilityCard({ item, state }) {
  const isSwitch = item.entity.startsWith("switch.");
  const isOn = state?.state === "on";

  return (
    <div
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--divider)",
        borderRadius: "0.8rem",
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{item.label}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", marginTop: "0.2rem" }}>
          {isSwitch ? (isOn ? "On" : "Off") : state?.state != null ? `${state.state} ${item.unit || ""}` : "--"}
        </div>
      </div>
      {isSwitch && (
        <button
          onClick={() => callService("switch", isOn ? "turn_off" : "turn_on", item.entity)}
          style={{
            padding: "0.5rem 0.9rem",
            borderRadius: "0.5rem",
            border: `1px solid ${isOn ? "var(--good)" : "var(--divider)"}`,
            background: isOn ? "var(--good)33" : "var(--surface)",
            color: isOn ? "var(--good)" : "var(--text-muted)",
            fontSize: "0.85rem",
          }}
        >
          {isOn ? "Turn Off" : "Turn On"}
        </button>
      )}
    </div>
  );
}

export default function UtilitiesPanel({ states, onClose }) {
  const config = useConfig();
  return (
    <PanelShell title="Critical Utilities" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))", gap: "1rem" }}>
        {config.utilities.map((item) => (
          <UtilityCard key={item.entity} item={item} state={states[item.entity]} />
        ))}
      </div>
    </PanelShell>
  );
}
