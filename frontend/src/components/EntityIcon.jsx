import React, { useState } from "react";
import { callService } from "../api/haClient";
import ClimateControl from "./ClimateControl.jsx";

const ICONS = { light: "💡", lock: "🔒", climate: "🌡️" };

function isActive(type, state) {
  if (!state) return false;
  if (type === "lock") return state.state === "unlocked";
  return state.state === "on" || state.state === "heat" || state.state === "cool";
}

function glowColor(type, state) {
  if (type === "lock") return state?.state === "unlocked" ? "var(--alert)" : "var(--good)";
  return isActive(type, state) ? "var(--accent)" : "var(--text-muted)";
}

export default function EntityIcon({ config, state }) {
  const { entity_id, type, x, y } = config;
  const [showClimate, setShowClimate] = useState(false);
  const active = isActive(type, state);
  const color = glowColor(type, state);

  const handleTap = async () => {
    if (type === "light") {
      await callService("light", "toggle", entity_id);
    } else if (type === "lock") {
      await callService("lock", state?.state === "locked" ? "unlock" : "lock", entity_id);
    } else if (type === "climate") {
      setShowClimate((v) => !v);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <button
        onClick={handleTap}
        aria-label={`${type} ${entity_id}`}
        style={{
          width: "3.4rem",
          height: "3.4rem",
          borderRadius: "50%",
          border: `2px solid ${color}`,
          background: active ? `${color}33` : "var(--surface)",
          boxShadow: active ? `0 0 1.1rem ${color}88` : "none",
          fontSize: "1.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
        }}
      >
        {ICONS[type] || "●"}
      </button>

      {showClimate && type === "climate" && (
        <ClimateControl entity_id={entity_id} state={state} onClose={() => setShowClimate(false)} />
      )}
    </div>
  );
}
