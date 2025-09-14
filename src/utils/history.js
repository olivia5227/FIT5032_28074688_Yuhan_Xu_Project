// Simple LocalStorage-backed history for Reflect submissions
const HISTORY_KEY = 'reflect_history_v1';

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

export function saveHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function addEntry(entry) {
  const list = loadHistory();
  list.unshift(entry);         // newest first
  saveHistory(list);
}

export function loadUserHistory(userEmail) {
  if (!userEmail) return [];
  const allHistory = loadHistory();
  return allHistory.filter(entry => entry.email === userEmail);
}

export function removeEntry(id) {
  const list = loadHistory().filter(e => e.id !== id);
  saveHistory(list);
  return list;
}

export function makeId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}