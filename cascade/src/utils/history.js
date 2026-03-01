/**
 * localStorage utilities for saving and retrieving game history.
 */

const STORAGE_KEY = 'cascade-history';

/**
 * Save a completed game to localStorage.
 * @param {Object} gameData - { profile, decision, history, summaryData, metrics }
 */
export function saveGame(gameData) {
  const { profile, decision, history, summaryData, metrics } = gameData;

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    date: new Date().toISOString(),
    profileName: profile?.name || 'Unknown',
    scenario: decision || '',
    score: summaryData?.score || '?',
    tagline: summaryData?.tagline || '',
    narrative: summaryData?.narrative || '',
    metrics: metrics || {},
    choices: (history || []).map((round) => {
      const chosen = round.options?.find((o) => o.id === round.chosenId);
      return {
        round: round.round,
        dilemma: round.dilemma || '',
        chosenTitle: chosen?.title || '',
        philosophy: chosen?.philosophy || '',
      };
    }),
  };

  const existing = getHistory();
  existing.unshift(entry);

  // Keep max 50 entries
  if (existing.length > 50) {
    existing.length = 50;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Storage full — remove oldest entries and try again
    existing.length = 25;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // silently fail
    }
  }

  return entry;
}

/**
 * Get all saved games from localStorage.
 * @returns {Array} Array of saved game objects
 */
export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Clear all saved games from localStorage.
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}
