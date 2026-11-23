/**
 * Player Stats Tracking for Scrambl
 * Tracks session data, total time played, and aggregated stats.
 */

const STATS_PREFIX = 'scrambl_';

/**
 * Initialize a new play session
 */
export function startSession() {
  const sessions = parseInt(localStorage.getItem(`${STATS_PREFIX}sessions`) || '0', 10);
  localStorage.setItem(`${STATS_PREFIX}sessions`, (sessions + 1).toString());
  localStorage.setItem(`${STATS_PREFIX}session_start`, Date.now().toString());
  localStorage.setItem(`${STATS_PREFIX}session_levels`, '0');
}

/**
 * Record a level completion in the current session
 */
export function recordLevelComplete() {
  const sessionLevels = parseInt(localStorage.getItem(`${STATS_PREFIX}session_levels`) || '0', 10);
  localStorage.setItem(`${STATS_PREFIX}session_levels`, (sessionLevels + 1).toString());

  const totalWords = parseInt(localStorage.getItem(`${STATS_PREFIX}total_words`) || '0', 10);
  localStorage.setItem(`${STATS_PREFIX}total_words`, (totalWords + 1).toString());
}

/**
 * Record a word definition being read
 */
export function recordDefinitionRead() {
  const current = parseInt(localStorage.getItem(`${STATS_PREFIX}defs_read`) || '0', 10);
  localStorage.setItem(`${STATS_PREFIX}defs_read`, (current + 1).toString());
}

/**
 * Record time attack score
 */
export function recordTimeAttackScore(score) {
  const best = parseInt(localStorage.getItem(`${STATS_PREFIX}ta_best`) || '0', 10);
  if (score > best) {
    localStorage.setItem(`${STATS_PREFIX}ta_best`, score.toString());
  }
  const totalGames = parseInt(localStorage.getItem(`${STATS_PREFIX}ta_games`) || '0', 10);
  localStorage.setItem(`${STATS_PREFIX}ta_games`, (totalGames + 1).toString());
}

/**
 * Get session duration in seconds
 */
function getSessionDuration() {
  const start = parseInt(localStorage.getItem(`${STATS_PREFIX}session_start`) || '0', 10);
  if (!start) return 0;
  return Math.floor((Date.now() - start) / 1000);
}

/**
 * Get total time played across all sessions (approximate)
 */
function getTotalTimePlayed() {
  const stored = parseInt(localStorage.getItem(`${STATS_PREFIX}total_time`) || '0', 10);
  return stored + getSessionDuration();
}

/**
 * Save total time when leaving
 */
export function endSession() {
  const duration = getSessionDuration();
  const total = parseInt(localStorage.getItem(`${STATS_PREFIX}total_time`) || '0', 10);
  localStorage.setItem(`${STATS_PREFIX}total_time`, (total + duration).toString());
  localStorage.removeItem(`${STATS_PREFIX}session_start`);
}

/**
 * Format seconds to human-readable string
 */
function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

/**
 * Get all player stats for the dashboard
 */
export function getPlayerStats(campaignDataLength) {
  const levelsCompleted = parseInt(localStorage.getItem(`${STATS_PREFIX}level`) || '0', 10);
  const totalWords = parseInt(localStorage.getItem(`${STATS_PREFIX}total_words`) || '0', 10);
  const dailyStreak = parseInt(localStorage.getItem(`${STATS_PREFIX}daily_streak`) || '0', 10);
  const bestStreak = parseInt(localStorage.getItem(`${STATS_PREFIX}best_streak`) || '0', 10);
  const timeAttackBest = parseInt(localStorage.getItem(`${STATS_PREFIX}ta_best`) || '0', 10);
  const timeAttackGames = parseInt(localStorage.getItem(`${STATS_PREFIX}ta_games`) || '0', 10);
  const totalCoins = parseInt(localStorage.getItem(`${STATS_PREFIX}coins`) || '0', 10);
  const sessions = parseInt(localStorage.getItem(`${STATS_PREFIX}sessions`) || '0', 10);
  const defsRead = parseInt(localStorage.getItem(`${STATS_PREFIX}defs_read`) || '0', 10);
  const totalTime = getTotalTimePlayed();

  // Update best streak if current is higher
  if (dailyStreak > bestStreak) {
    localStorage.setItem(`${STATS_PREFIX}best_streak`, dailyStreak.toString());
  }

  const campaignProgress = campaignDataLength > 0
    ? Math.min(100, Math.round((levelsCompleted / campaignDataLength) * 100))
    : 0;

  return {
    levelsCompleted,
    totalWords,
    dailyStreak,
    bestStreak: Math.max(bestStreak, dailyStreak),
    timeAttackBest,
    timeAttackGames,
    totalCoins,
    sessions,
    defsRead,
    totalTimePlayed: formatTime(totalTime),
    campaignProgress,
    sessionLevels: parseInt(localStorage.getItem(`${STATS_PREFIX}session_levels`) || '0', 10),
    sessionTime: formatTime(getSessionDuration()),
  };
}
