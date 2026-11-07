import React, { createContext, useContext, useEffect, useState } from "react";

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/config/dashboard.config.json")
      .then((r) => {
        if (!r.ok) throw new Error(`Config load failed: ${r.status}`);
        return r.json();
      })
      .then(setConfig)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div style={{ color: "var(--alert)", padding: "2rem", fontFamily: "monospace" }}>
        Failed to load dashboard config: {error}
      </div>
    );
  }

  if (!config) return null; // brief blank frame while config loads

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const config = useContext(ConfigContext);
  if (!config) throw new Error("useConfig must be used within ConfigProvider");
  return config;
}
