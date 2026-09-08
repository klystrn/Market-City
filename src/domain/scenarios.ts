import type { GodSettings } from "./simulation";
export interface ScenarioState {
  god: GodSettings;
  tomorrow: -1 | 0 | 1 | null;
}
export interface SavedScenario extends ScenarioState {
  id: string;
  name: string;
  createdAt: string;
}
// Base64url encode/decode for embedding a scenario in a shareable URL.
// Only ever called from browser event handlers or effects (never during
// server-side prerendering), so btoa/atob are always available here.
export function encodeScenario(state: ScenarioState): string {
  const json = JSON.stringify(state);
  return btoa(unescape(encodeURIComponent(json)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
export function decodeScenario(code: string): ScenarioState | null {
  try {
    const padded = code.replaceAll("-", "+").replaceAll("_", "/");
    const withPad = padded + "=".repeat((4 - (padded.length % 4)) % 4);
    const json = decodeURIComponent(escape(atob(withPad)));
    const parsed: unknown = JSON.parse(json);
    if (
      parsed &&
      typeof parsed === "object" &&
      "god" in parsed &&
      "tomorrow" in parsed
    )
      return parsed as ScenarioState;
    return null;
  } catch {
    return null;
  }
}
