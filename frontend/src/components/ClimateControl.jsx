import React from "react";
import { callService } from "../api/haClient";

export default function ClimateControl({ entity_id, state, onClose }) {
  const target = state?.attributes?.temperature;
  const current = state?.attributes?.current_temperature;
  const unit = state?.attributes?.temperature_unit || "°";

  const adjust = async (delta) => {
    if (target == null) return;
    await callService("climate", "set_temperature", entity_id, { temperature: target + delta });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "3.8rem",
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--surface-elevated)",
        border: "1px solid var(--divider)",
        borderRadius: "0.8rem",
        padding: "0.9rem 1.1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.4rem",
        boxShadow: "0 0.5rem 1.5rem rgba(0,0,0,0.4)",
        zIndex: 5,
        minWidth: "10rem",
      }}
    >
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
        Current: {current != null ? `${current}${unit}` : "--"}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
        <button onClick={() => adjust(-0.5)} style={roundBtn}>
          −
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", minWidth: "3.5rem", textAlign: "center" }}>
          {target != null ? `${target}${unit}` : "--"}
        </span>
        <button onClick={() => adjust(0.5)} style={roundBtn}>
          +
        </button>
      </div>
      <button
        onClick={onClose}
        style={{ marginTop: "0.3rem", background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.75rem" }}
      >
        Close
      </button>
    </div>
  );
}

const roundBtn = {
  width: "2.2rem",
  height: "2.2rem",
  borderRadius: "50%",
  border: "1px solid var(--divider)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "1.2rem",
};
