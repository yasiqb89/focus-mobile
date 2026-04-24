const SNAPSHOT_KEY = "focus-state";

function hasLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadSnapshot<T>(): T | null {
  try {
    if (!hasLocalStorage()) return null;
    const value = window.localStorage.getItem(SNAPSHOT_KEY);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export function saveSnapshot<T>(snapshot: T): void {
  try {
    if (!hasLocalStorage()) return;
    window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // Persistence is best-effort in the MVP; the in-memory state remains authoritative.
  }
}
