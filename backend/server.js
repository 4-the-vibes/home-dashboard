// Home Assistant Dashboard - Backend Proxy
//
// Why this exists: the Crestron panel's browser has no secure credential
// storage, so the Long-Lived Access Token must never reach client-side JS.
// This server holds the token, talks to Home Assistant on the dashboard's
// behalf, and serves the built frontend as static files.

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HA_URL = (process.env.HA_URL || "").replace(/\/+$/, "");
const HA_TOKEN = process.env.HA_TOKEN;
const PORT = process.env.PORT || 8080;

if (!HA_URL || !HA_TOKEN) {
  console.error(
    "Missing HA_URL or HA_TOKEN environment variables. Set them in your .env or docker-compose.yml."
  );
  process.exit(1);
}

const HA_WS_URL = HA_URL.replace(/^http/, "ws") + "/api/websocket";

const app = express();
app.use(express.json());

const authHeaders = {
  Authorization: `Bearer ${HA_TOKEN}`,
  "Content-Type": "application/json",
};

// ---- REST proxy -----------------------------------------------------

// Get all entity states (used for initial load / fallback polling)
app.get("/api/ha/states", async (req, res) => {
  try {
    const r = await fetch(`${HA_URL}/api/states`, { headers: authHeaders });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error("GET /api/ha/states failed:", err.message);
    res.status(502).json({ error: "Could not reach Home Assistant" });
  }
});

// Call a service, e.g. POST /api/ha/services/light/toggle { entity_id }
app.post("/api/ha/services/:domain/:service", async (req, res) => {
  const { domain, service } = req.params;
  try {
    const r = await fetch(`${HA_URL}/api/services/${domain}/${service}`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(req.body || {}),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error(`POST /api/ha/services/${domain}/${service} failed:`, err.message);
    res.status(502).json({ error: "Could not reach Home Assistant" });
  }
});

// Camera snapshot passthrough, e.g. GET /api/ha/camera_proxy/camera.front_door
app.get("/api/ha/camera_proxy/:entity_id", async (req, res) => {
  try {
    const r = await fetch(`${HA_URL}/api/camera_proxy/${req.params.entity_id}`, {
      headers: authHeaders,
    });
    res.set("Content-Type", r.headers.get("content-type") || "image/jpeg");
    const buf = Buffer.from(await r.arrayBuffer());
    res.status(r.status).send(buf);
  } catch (err) {
    console.error("camera_proxy failed:", err.message);
    res.status(502).end();
  }
});

// ---- Static frontend --------------------------------------------------

const distPath = path.join(__dirname, "public");
app.use(express.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(distPath, "index.html"));
});

// ---- HTTP + WS server ---------------------------------------------------

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/api/ws" });

// One upstream connection to Home Assistant, fanned out to every connected
// dashboard client. Keeps a single authenticated session instead of one
// per browser tab.
let haSocket = null;
let haMsgId = 1;
const clients = new Set();

function broadcast(obj) {
  const payload = JSON.stringify(obj);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  }
}

function connectToHA() {
  haSocket = new WebSocket(HA_WS_URL);

  haSocket.on("open", () => console.log("Connected to Home Assistant websocket"));

  haSocket.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.type === "auth_required") {
      haSocket.send(JSON.stringify({ type: "auth", access_token: HA_TOKEN }));
    } else if (msg.type === "auth_ok") {
      haSocket.send(
        JSON.stringify({ id: haMsgId++, type: "subscribe_events", event_type: "state_changed" })
      );
      broadcast({ type: "ha_connected" });
    } else if (msg.type === "auth_invalid") {
      console.error("Home Assistant rejected the access token.");
    } else if (msg.type === "event" && msg.event?.event_type === "state_changed") {
      broadcast({ type: "state_changed", data: msg.event.data });
    }
  });

  haSocket.on("close", () => {
    broadcast({ type: "ha_disconnected" });
    setTimeout(connectToHA, 5000);
  });

  haSocket.on("error", (err) => console.error("HA websocket error:", err.message));
}

connectToHA();

wss.on("connection", (client) => {
  clients.add(client);
  client.on("close", () => clients.delete(client));
});

server.listen(PORT, () => {
  console.log(`Dashboard backend listening on port ${PORT}`);
});
