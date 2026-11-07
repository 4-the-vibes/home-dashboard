import React, { useState, useEffect } from "react";
import { useConfig } from "../../config/ConfigContext.jsx";
import { cameraSnapshotUrl } from "../../api/haClient";
import PanelShell from "./PanelShell.jsx";

function CameraTile({ camera }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 5000); // refresh snapshot every 5s
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ borderRadius: "0.7rem", overflow: "hidden", border: "1px solid var(--divider)" }}>
      <img
        src={`${cameraSnapshotUrl(camera.entity)}?t=${tick}`}
        alt={camera.label}
        style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block", background: "#000" }}
      />
      <div style={{ padding: "0.5rem 0.7rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>{camera.label}</div>
    </div>
  );
}

export default function CameraPanel({ onClose }) {
  const config = useConfig();
  return (
    <PanelShell title="Security Cameras" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))", gap: "1rem" }}>
        {config.cameras.map((cam) => (
          <CameraTile key={cam.entity} camera={cam} />
        ))}
      </div>
    </PanelShell>
  );
}
