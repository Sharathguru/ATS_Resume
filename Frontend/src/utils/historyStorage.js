const HISTORY_KEY = "ats-scan-history-v1";
const HISTORY_LIMIT = 8;

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const loadHistory = () => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : [];
  } catch (error) {
    console.warn("Failed to parse saved history", error);
    return [];
  }
};

export const saveHistory = (history = []) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
  } catch (error) {
    console.warn("Failed to persist history", error);
  }
};

export const historyLimit = HISTORY_LIMIT;

