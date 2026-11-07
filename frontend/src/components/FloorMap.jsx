import React from "react";
import EntityIcon from "./EntityIcon.jsx";

export default function FloorMap({ floor, states }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <img
        src={floor.plan}
        alt={`${floor.label} plan`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: "brightness(0.9)",
        }}
      />
      {floor.entities.map((entity) => (
        <EntityIcon key={entity.entity_id} config={entity} state={states[entity.entity_id]} />
      ))}
      {floor.entities.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            fontSize: "1rem",
          }}
        >
          No controls mapped for this floor yet
        </div>
      )}
    </div>
  );
}
