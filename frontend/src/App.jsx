import React, { useEffect, useRef, useState, useCallback } from "react";
import { useConfig } from "./config/ConfigContext.jsx";
import { fetchStates, subscribeToStateChanges } from "./api/haClient";
import ClockScreen from "./components/ClockScreen.jsx";
import HomeScreen from "./components/HomeScreen.jsx";

export default function App() {
  const config = useConfig();
  const [states, setStates] = useState({});
  const [awake, setAwake] = useState(false);
  const [haConnected, setHaConnected] = useState(false);
  const idleTimer = useRef(null);

  // --- Entity state: initial REST load, then live WS updates ---
  useEffect(() => {
    let mounted = true;
    fetchStates()
      .then((list) => {
        if (!mounted) return;
        const map = {};
        for (const entity of list) map[entity.entity_id] = entity;
        setStates(map);
      })
      .catch((err) => console.error("Initial state load failed:", err));

    const unsubscribe = subscribeToStateChanges(
      (newState) => setStates((prev) => ({ ...prev, [newState.entity_id]: newState })),
      setHaConnected
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // --- Idle timer: any interaction while awake resets it ---
  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setAwake(false);
    }, (config.idleTimeoutSeconds || 60) * 1000);
  }, []);

  useEffect(() => {
    if (awake) {
      resetIdleTimer();
      return () => clearTimeout(idleTimer.current);
    }
    clearTimeout(idleTimer.current);
  }, [awake, resetIdleTimer]);

  const wake = () => setAwake(true);
  const handleInteraction = () => {
    if (awake) resetIdleTimer();
  };

  return (
    <div
      style={{ width: "100vw", height: "100vh", position: "relative" }}
      onPointerDown={handleInteraction}
    >
      {!awake ? (
        <ClockScreen states={states} onWake={wake} />
      ) : (
        <HomeScreen states={states} haConnected={haConnected} />
      )}
    </div>
  );
}
