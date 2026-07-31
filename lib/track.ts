/**
 * Pulse snippet — anonymous usage counting for the family dashboard
 * (dash.vilaybende.com). Fire-and-forget by design: an ad blocker, an
 * offline network, or a dead endpoint must never break the tool.
 *
 * Privacy posture (mirrored on /privacy): no cookies, no stored IDs; the
 * server derives a daily-rotating anonymous hash and never stores IPs.
 * If the browser asks not to be tracked (DNT/GPC), nothing is sent at all.
 */

const ENDPOINT = "https://dash.vilaybende.com/api/i";
/** The ONLY line that differs between the family repos. */
const TOOL = "watchnext";

function send(payload: Record<string, unknown>): void {
  try {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;

    let url = ENDPOINT;
    const host = location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      // Local dev sends nothing unless ?pulse_debug (optionally =<port>)
      // targets a local dashboard.
      const debug = new URLSearchParams(location.search).get("pulse_debug");
      if (debug === null) return;
      url = `http://localhost:${/^\d+$/.test(debug) ? debug : "3000"}/api/i`;
    } else if (!host.endsWith("vilaybende.com")) {
      // Anywhere that is not the production domain (LAN-IP dev servers,
      // file:// builds, previews) never sends.
      return;
    }

    // JSON in a text/plain Blob keeps sendBeacon a CORS simple request
    // (no preflight); the server parses the body regardless of type.
    const body = JSON.stringify({ tool: TOOL, ...payload });
    const beacon =
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }));
    if (!beacon) {
      fetch(url, { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {
    // Never let counting break the tool.
  }
}

export function trackPageview(path: string): void {
  let ref: string | undefined;
  try {
    const host = document.referrer && new URL(document.referrer).hostname;
    if (host && host !== location.hostname) ref = host;
  } catch {
    // unparsable referrer — skip it
  }
  send({ type: "pageview", path, ref });
}

/** Count one completed use of the tool, e.g. track("spin_done"). */
export function track(name: string): void {
  send({ type: "event", path: location.pathname, name });
}
