const PLAYER_ID_KEY = "rr_player_id";

export function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = window.localStorage.getItem(PLAYER_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(PLAYER_ID_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}
