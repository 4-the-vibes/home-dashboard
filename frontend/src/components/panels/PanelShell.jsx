import React from "react";

export default function PanelShell({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "4.5rem",
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(16,19,25,0.92)",
        backdropFilter: "blur(6px)",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          margin: "1.5rem",
          padding: "1.5rem",
          background: "var(--surface)",
          border: "1px solid var(--divider)",
          borderRadius: "1rem",
          flex: 1,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.2rem",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.3rem", margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--divider)",
              borderRadius: "0.5rem",
              color: "var(--text)",
              padding: "0.4rem 0.8rem",
              fontSize: "0.85rem",
            }}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
