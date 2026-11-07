# Home Assistant Wall Dashboard

A standalone dashboard for a Crestron TSW-1060 (or any browser-based touch
panel). Two modes:

- **Asleep**: large clock + a one-line weather summary. Tap anywhere to wake.
- **Awake**: a floor plan per level with tap-to-control lights, locks, and
  climate, plus three dropdowns — **Cameras**, **Weather Details**
  (multi-source + air quality + pollen), and **Utilities** (power, water,
  related sensors). Returns to the clock after 1 minute of inactivity
  (configurable).

It runs as two pieces in one container: a small Node/Express backend that
holds your Home Assistant token and proxies requests, and a React frontend
it serves as static files. The panel's browser never sees your HA token.

---

## 1. Create a Home Assistant Long-Lived Access Token

In Home Assistant: click your profile (bottom left) → **Security** tab →
**Long-Lived Access Tokens** → **Create Token**. Copy it somewhere safe —
HA only shows it once.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
HA_URL=http://homeassistant.local:8123     # your HA instance, no trailing slash
HA_TOKEN=eyJ...                             # the token from step 1
```

Use an address reachable from wherever this container runs (Docker host),
not from the panel — the browser never talks to HA directly.

## 3. Map your entities and floor plans

Edit `frontend/public/config/dashboard.config.json`:

- `idleTimeoutSeconds` — how long before the screen sleeps (starts at `60`).
- `primaryWeatherEntity` — the weather entity shown on the sleep screen.
- `weatherSources` — label/entity pairs for OpenWeather, Environment
  Canada, Ecowitt, etc., shown side by side in the Weather Details panel.
- `airQuality` / `pollen` — sensor entities for AQI, PM2.5, and your three
  scrape sensors (tree/grass/weed pollen).
- `cameras` — camera entities for the Cameras panel.
- `utilities` — sensors/switches for the Utilities panel (add `"unit"` for
  sensors; entities starting with `switch.` automatically get a toggle).
- `floors` — one entry per level. Each has a `plan` (path to an SVG/PNG
  under `frontend/public/floorplans/`) and an `entities` array placing
  lights/locks/climate on the map as `x`/`y` **percentages** of the image
  (0–100, from top-left), e.g.:

  ```json
  { "entity_id": "light.living_room", "type": "light", "x": 30, "y": 55 }
  ```

  `type` is one of `light`, `lock`, or `climate`. To position icons, open
  the plan image, estimate the percentage across/down where each fixture
  sits, and adjust by eye once it's running.

This file is fetched at runtime (not baked into the build), so once it's
volume-mounted (see below) you can edit it and just refresh the panel —
no rebuild needed.

## 4. Add your floor plans

Drop your real plans into `frontend/public/floorplans/` (SVG preferred,
PNG/JPG also fine) and point each floor's `"plan"` field at them:

- `main.svg` / `upper.svg` — currently placeholders, replace with your
  actual plans.
- `basement-placeholder.svg` — shown until you have a basement plan. When
  ready, add `basement.svg`, set `"plan": "/floorplans/basement.svg"` in
  the config, and give it an `entities` array.

## 5. Build and run

```bash
docker compose up -d --build
```

The dashboard is then at `http://<docker-host>:8080`. On the Crestron
panel, point its browser widget at that URL.

The compose file mounts the config file and `floorplans/` folder as
read-only volumes, so edits to either take effect on a page refresh
without rebuilding the image. If you'd rather have them baked into the
image (e.g. for a locked-down deployment), remove the `volumes:` block
from `docker-compose.yml`.

## 6. Point the Crestron panel at it

On the TSW-1060, set its web browser feature's URL to
`http://<docker-host>:8080` and configure it to auto-load on boot /
after idle. The dashboard's own inactivity timer and sleep screen handle
the "wake on tap" behavior in-app, so the panel itself doesn't need a
separate screensaver — just keep its own browser view static.

---

## Project layout

```
home-dashboard/
├── backend/              Express proxy + static file server
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx              idle timer + screen switching
│   │   ├── components/
│   │   │   ├── ClockScreen.jsx  sleep screen
│   │   │   ├── HomeScreen.jsx   floor tabs + dropdown triggers
│   │   │   ├── FloorMap.jsx     renders plan + entity icons
│   │   │   ├── EntityIcon.jsx   light/lock/climate tap targets
│   │   │   ├── ClimateControl.jsx
│   │   │   └── panels/          Cameras / Weather / Utilities dropdowns
│   │   ├── api/haClient.js      talks to the backend proxy only
│   │   └── config/ConfigContext.jsx
│   └── public/
│       ├── config/dashboard.config.json   ← your entity/floor mapping
│       └── floorplans/                    ← your plan images
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Notes on real-time updates

The backend keeps one authenticated WebSocket connection to Home
Assistant and re-broadcasts `state_changed` events to every connected
panel over `/api/ws`. If that connection drops, it retries every 5
seconds and the top bar shows a "Reconnecting" indicator; the dashboard
also does an initial REST fetch of all states on load so it isn't blank
while the socket connects.

## Extending it

- **More entity types on the floor plan** (covers, fans, media players):
  add a case in `EntityIcon.jsx`'s `isActive`/`handleTap` and an icon in
  `ICONS`.
- **Per-floor camera groups** or **room-scoped utilities**: the config
  schema is intentionally flat; nest it further if you want panels
  scoped to the active floor.
- **Auth hardening**: if this ever leaves your local network, put it
  behind a reverse proxy with its own auth (e.g. Authelia, or your
  router/VPN) — the app itself assumes a trusted local network, matching
  how the Crestron panel reaches it today.
