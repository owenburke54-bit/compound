const KEY = "compound_hasSeenOnboarding";

export function getHasSeenOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "true";
}

export function setHasSeenOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, "true");
}
