import React, { useEffect, useState } from "react";
import { useConfig } from "../config/ConfigContext.jsx";

const WEATHER_ICONS = {
  "clear-night": "🌙",
  sunny: "☀️",
  "partlycloudy": "⛅",
  cloudy: "☁️",
  rainy: "🌧️",
  pouring: "🌧️",
  snowy: "❄️",
  fog: "🌫️",
  windy: "💨",
  lightning: "⛈️",
};

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date) {
  return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

export default function ClockScreen({ states, onWake }) {
  const config = useConfig();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const weather = states[config.primaryWeatherEntity];
  const condition = weather?.state;
  const temp = weather?.attributes?.temperature;
  const tempUnit = weather?.attributes?.temperature_unit || "°";
  const high = weather?.attributes?.forecast?.[0]?.temperature;
  const low = weather?.attributes?.forecast?.[0]?.templow;

  return (
    <div
      onClick={onWake}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "9rem",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "var(--text)",
        }}
      >
        {formatTime(now)}
      </div>

      <div
        style={{
          marginTop: "1rem",
          fontFamily: "var(--font-body)",
          fontSize: "1.4rem",
          color: "var(--text-muted)",
        }}
      >
        {formatDate(now)}
      </div>

      {weather && (
        <div
          style={{
            marginTop: "2.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontFamily: "var(--font-body)",
            fontSize: "1.6rem",
            color: "var(--text)",
          }}
        >
          <span style={{ fontSize: "2rem" }}>{WEATHER_ICONS[condition] || "🌡️"}</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>
            {temp != null ? `${Math.round(temp)}${tempUnit}` : "--"}
          </span>
          {high != null && low != null && (
            <span style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
              H:{Math.round(high)}° L:{Math.round(low)}°
            </span>
          )}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "3rem",
          fontSize: "0.9rem",
          color: "var(--text-muted)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        Tap to open
      </div>
    </div>
  );
}
