/**
 * Achievements System for Scrambl
 * Defines all achievements, handles unlock logic, and persists to localStorage.
 */

const STORAGE_KEY = 'scrambl_achievements';

export const ACHIEVEMENTS = [
  {
    id: 'first_blood',
    icon: '🏅',
    name: 'First Blood',
    description: 'Complete your first level',
    condition: (stats) => stats.levelsCompleted >= 1,
  },
  {
    id: 'globe_trotter',
    icon: '🌍',
    name: 'Globe Trotter',
    description: 'Complete 10 countries',
    condition: (stats) => stats.levelsCompleted >= 10,
  },
  {
    id: 'wordsmith',
    icon: '🧠',
    name: 'Wordsmith',
    description: 'Complete 50 levels',
    condition: (stats) => stats.levelsCompleted >= 50,
  },
  {
    id: 'world_champion',
    icon: '👑',
    name: 'World Champion',
    description: 'Complete 100 levels',
    condition: (stats) => stats.levelsCompleted >= 100,
  },
  {
    id: 'diamond_player',
    icon: '💎',
    name: 'Diamond Player',
    description: 'Complete 200 levels',
    condition: (stats) => stats.levelsCompleted >= 200,
  },
  {
    id: 'on_fire',
    icon: '🔥',
    name: 'On Fire',
    description: 'Reach a 5-day daily streak',
    condition: (stats) => stats.dailyStreak >= 5,
  },
  {
    id: 'inferno',
    icon: '🌋',
    name: 'Inferno',
    description: 'Reach a 15-day daily streak',
    condition: (stats) => stats.dailyStreak >= 15,
  },
  {
    id: 'speed_demon',
    icon: '⚡',
    name: 'Speed Demon',
    description: 'Score 10+ in Time Attack',
    condition: (stats) => stats.timeAttackBest >= 10,
  },
  {
    id: 'lightning',
    icon: '🌩️',
    name: 'Lightning',
    description: 'Score 20+ in Time Attack',
    condition: (stats) => stats.timeAttackBest >= 20,
  },
  {
    id: 'bookworm',
    icon: '📚',
    name: 'Bookworm',
    description: 'Read 10 word definitions',
    condition: (stats) => stats.definitionsRead >= 10,
  },
  {
    id: 'coin_hoarder',
    icon: '💰',
    name: 'Coin Hoarder',
    description: 'Accumulate 100 coins',
    condition: (stats) => stats.totalCoins >= 100,
  },
  {
    id: 'early_bird',
    icon: '🔓',
    name: 'Early Bird',
    description: 'Complete the daily before noon',
    condition: (stats) => stats.earlyBirdTriggered === true,
  },
];

/**
 * Get all unlocked achievement IDs from localStorage
 */
export function getUnlockedIds() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save unlocked achievement IDs to localStorage
 */
function saveUnlockedIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

/**
 * Get current player stats from various localStorage keys
 */
export function gatherStats() {
  return {
    levelsCompleted: parseInt(localStorage.getItem('scrambl_level') || '0', 10),
    dailyStreak: parseInt(localStorage.getItem('scrambl_daily_streak') || '0', 10),
    timeAttackBest: parseInt(localStorage.getItem('scrambl_ta_best') || '0', 10),
    definitionsRead: parseInt(localStorage.getItem('scrambl_defs_read') || '0', 10),
    totalCoins: parseInt(localStorage.getItem('scrambl_coins') || '0', 10),
    earlyBirdTriggered: localStorage.getItem('scrambl_early_bird') === 'true',
    sessionsPlayed: parseInt(localStorage.getItem('scrambl_sessions') || '0', 10),
  };
}

/**
 * Check all achievements against current stats.
 * Returns an array of newly unlocked achievement objects (if any).
 */
export function checkAchievements() {
  const stats = gatherStats();
  const unlockedIds = getUnlockedIds();
  const newlyUnlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.includes(achievement.id) && achievement.condition(stats)) {
      unlockedIds.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    saveUnlockedIds(unlockedIds);
  }

  return newlyUnlocked;
}

/**
 * Get all achievements with their unlocked status
 */
export function getAllAchievements() {
  const unlockedIds = getUnlockedIds();
  const stats = gatherStats();

  return ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: unlockedIds.includes(a.id),
    progress: getProgress(a, stats),
  }));
}

/**
 * Calculate progress percentage for an achievement
 */
function getProgress(achievement, stats) {
  const { id } = achievement;
  switch (id) {
    case 'first_blood': return Math.min(100, (stats.levelsCompleted / 1) * 100);
    case 'globe_trotter': return Math.min(100, (stats.levelsCompleted / 10) * 100);
    case 'wordsmith': return Math.min(100, (stats.levelsCompleted / 50) * 100);
    case 'world_champion': return Math.min(100, (stats.levelsCompleted / 100) * 100);
    case 'diamond_player': return Math.min(100, (stats.levelsCompleted / 200) * 100);
    case 'on_fire': return Math.min(100, (stats.dailyStreak / 5) * 100);
    case 'inferno': return Math.min(100, (stats.dailyStreak / 15) * 100);
    case 'speed_demon': return Math.min(100, (stats.timeAttackBest / 10) * 100);
    case 'lightning': return Math.min(100, (stats.timeAttackBest / 20) * 100);
    case 'bookworm': return Math.min(100, (stats.definitionsRead / 10) * 100);
    case 'coin_hoarder': return Math.min(100, (stats.totalCoins / 100) * 100);
    case 'early_bird': return stats.earlyBirdTriggered ? 100 : 0;
    default: return 0;
  }
}

/**
 * Increment a numeric stat in localStorage
 */
export function incrementStat(key, amount = 1) {
  const current = parseInt(localStorage.getItem(key) || '0', 10);
  localStorage.setItem(key, (current + amount).toString());
}
