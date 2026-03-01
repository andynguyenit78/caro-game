/**
 * Rank (xếp hạng) system for Caro.
 *
 * Rankings are based on a cumulative `score` stored per player.
 * Score changes are calculated from the level difference between winner and loser.
 */

// ─── Config ─────────────────────────────────────────────────────────────────

export interface RankThreshold {
    level: number;
    title: string;
    minScore: number;
}

export const RANK_CONFIG: RankThreshold[] = [
    { level: 1, title: 'Tân thủ', minScore: 0 },
    { level: 2, title: 'Kỳ thủ', minScore: 500 },
    { level: 3, title: 'Cao thủ', minScore: 1200 },
    { level: 4, title: 'Siêu cao thủ', minScore: 1800 },
    { level: 5, title: 'Kiện tướng', minScore: 2400 },
    { level: 6, title: 'Đại kiện tướng', minScore: 3000 },
    { level: 7, title: 'Kỳ tiên', minScore: 3800 },
    { level: 8, title: 'Kỳ thánh', minScore: 4500 },
];

/** Score constants */
const BASE_SCORE_CHANGE = 100;
const LEVEL_BONUS_PER_TIER = 50;

/** Emoji badges per level (index matches level - 1) */
export const RANK_ICONS = ['🌱', '⚔️', '🔥', '💥', '🏅', '🎖️', '👑', '🌟'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Return the rank entry for a given score (highest matching level).
 */
export function getRankFromScore(score: number): RankThreshold {
    let rank = RANK_CONFIG[0];
    for (const entry of RANK_CONFIG) {
        if (score >= entry.minScore) {
            rank = entry;
        }
    }
    return rank;
}

/**
 * Return the rank level (1–8) for a given score.
 */
export function getLevelFromScore(score: number): number {
    return getRankFromScore(score).level;
}

/**
 * Return the icon emoji for a given score.
 */
export function getRankIcon(score: number): string {
    const level = getLevelFromScore(score);
    return RANK_ICONS[level - 1];
}

// ─── Score Calculation ───────────────────────────────────────────────────────

export interface ScoreChange {
    /** Points change for the winner (always positive) */
    winnerDelta: number;
    /** Points change for the loser (always negative) */
    loserDelta: number;
}

/**
 * Calculate how many points each player gains/loses.
 *
 * Rules:
 * - Win vs HIGHER level (upset): +100 + levelDiff×50 (bonus for the upset)
 * - Win vs SAME level: +100 base
 * - Win vs LOWER level: max(20, 100 - levelDiff×20) — fewer points for beating a weaker player
 *
 * Loss is always the mirror (negative) of whatever the winner gained.
 */
export function calculateScoreChange(winnerScore: number, loserScore: number): ScoreChange {
    const winnerLevel = getLevelFromScore(winnerScore);
    const loserLevel = getLevelFromScore(loserScore);
    const levelDiff = Math.abs(winnerLevel - loserLevel);

    let winnerDelta: number;

    if (winnerLevel < loserLevel) {
        // Upset: weaker player beat stronger — big bonus
        winnerDelta = BASE_SCORE_CHANGE + levelDiff * LEVEL_BONUS_PER_TIER;
    } else if (winnerLevel > loserLevel) {
        // Expected win vs weaker — reduced reward, minimum 20 pts
        winnerDelta = Math.max(20, BASE_SCORE_CHANGE - levelDiff * 20);
    } else {
        // Same level — base change
        winnerDelta = BASE_SCORE_CHANGE;
    }

    return {
        winnerDelta,
        loserDelta: -winnerDelta,
    };
}

/**
 * Clamp so a player's score never goes below 0.
 */
export function applyScoreFloor(score: number): number {
    return Math.max(0, score);
}
