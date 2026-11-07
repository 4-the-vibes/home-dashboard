// Thin client for the backend proxy. All requests go to our own server,
// which holds the real Home Assistant credentials.

export async function fetchStates() {
  const r = await fetch("/api/ha/states");
  if (!r.ok) throw new Error(`Failed to fetch states: ${r.status}`);
  return r.json();
}

export async function callService(domain, service, entity_id, extra = {}) {
  const r = await fetch(`/api/ha/services/${domain}/${service}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity_id, ...extra }),
  });
  if (!r.ok) throw new Error(`Service call failed: ${r.status}`);
  return r.json();
}

export function cameraSnapshotUrl(entity_id) {
  return `/api/ha/camera_proxy/${entity_id}`;
}

// Opens the state-change WebSocket and calls onStateChanged(newState) for
// every update. Reconnects automatically; returns a cleanup function.
export function subscribeToStateChanges(onStateChanged, onConnectionChange) {
  let socket;
  let cancelled = false;

  function connect() {
    if (cancelled) return;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    socket = new WebSocket(`${proto}://${window.location.host}/api/ws`);

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "state_changed" && msg.data?.new_state) {
        onStateChanged(msg.data.new_state);
      } else if (msg.type === "ha_connected") {
        onConnectionChange?.(true);
      } else if (msg.type === "ha_disconnected") {
        onConnectionChange?.(false);
      }
    };

    socket.onclose = () => {
      onConnectionChange?.(false);
      if (!cancelled) setTimeout(connect, 3000);
    };
  }

  connect();

  return () => {
    cancelled = true;
    socket?.close();
  };
}
