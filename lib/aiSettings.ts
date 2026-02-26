const AI_ENABLED_KEY = "compound_aiSortingEnabled";

export function getAiSortingEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(AI_ENABLED_KEY);
  if (stored === null) return true; // default on
  return stored === "true";
}

export function setAiSortingEnabled(value: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AI_ENABLED_KEY, String(value));
}
