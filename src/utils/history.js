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

// User-specific deletion (hides entries for user without affecting admin stats)
const USER_DELETED_KEY = 'user_deleted_entries_v1';

export function getUserDeletedEntries(userEmail) {
  try {
    const deleted = JSON.parse(localStorage.getItem(USER_DELETED_KEY) || '{}');
    return deleted[userEmail] || [];
  } catch {
    return [];
  }
}

export function saveUserDeletedEntries(userEmail, deletedIds) {
  try {
    const deleted = JSON.parse(localStorage.getItem(USER_DELETED_KEY) || '{}');
    deleted[userEmail] = deletedIds;
    localStorage.setItem(USER_DELETED_KEY, JSON.stringify(deleted));
  } catch {
    // Fail silently
  }
}

export function hideEntryForUser(entryId, userEmail) {
  const deletedIds = getUserDeletedEntries(userEmail);
  if (!deletedIds.includes(entryId)) {
    deletedIds.push(entryId);
    saveUserDeletedEntries(userEmail, deletedIds);
  }
}

export function loadUserHistoryFiltered(userEmail) {
  if (!userEmail) return [];
  const allHistory = loadHistory();
  const userEntries = allHistory.filter(entry => entry.email === userEmail);
  const deletedIds = getUserDeletedEntries(userEmail);
  return userEntries.filter(entry => !deletedIds.includes(entry.id));
}

export function makeId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// Get anonymized statistics for admin dashboard (no user identification)
export function getAnonymizedStats() {
  const allHistory = loadHistory();

  // Only return aggregated statistics, no user-identifiable data
  const stats = {
    totalSubmissions: allHistory.length,
    averageMood: allHistory.length > 0 ?
      (allHistory.reduce((sum, entry) => sum + Number(entry.mood || 0), 0) / allHistory.length) : 0,
    averageSleep: allHistory.length > 0 ?
      (allHistory.reduce((sum, entry) => sum + Number(entry.sleepHours || 0), 0) / allHistory.length) : 0,
    moodDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    ageGroups: { '12-16': 0, '17-21': 0, '22-25': 0 }
  };

  // Calculate mood distribution
  allHistory.forEach(entry => {
    const mood = Number(entry.mood);
    if (mood >= 1 && mood <= 5) {
      stats.moodDistribution[mood]++;
    }

    // Calculate age distribution (anonymized)
    const age = Number(entry.age);
    if (age >= 12 && age <= 16) {
      stats.ageGroups['12-16']++;
    } else if (age >= 17 && age <= 21) {
      stats.ageGroups['17-21']++;
    } else if (age >= 22 && age <= 25) {
      stats.ageGroups['22-25']++;
    }
  });

  return stats;
}