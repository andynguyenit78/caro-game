/**
 * Rank (xếp hạng) system for Caro.
 *
 * Rankings are based on a cumulative `score` stored per player.
 * Score changes are calculated from the level difference between winner and loser.
 */

// ─── Config ─────────────────────────────────────────────────────────────────

export interface RankThreshold {
    level: number;
    /** Vietnamese title */
    title: string;
    /** English title */
    titleEn: string;
    minScore: number;
}

export const RANK_CONFIG: RankThreshold[] = [
    { level: 1, title: 'Tân thủ', titleEn: 'Novice', minScore: 0 },
    { level: 2, title: 'Kỳ thủ', titleEn: 'Apprentice', minScore: 500 },
    { level: 3, title: 'Cao thủ', titleEn: 'Expert', minScore: 1200 },
    { level: 4, title: 'Siêu cao thủ', titleEn: 'Master', minScore: 1800 },
    { level: 5, title: 'Kiện tướng', titleEn: 'Grandmaster', minScore: 2400 },
    { level: 6, title: 'Đại kiện tướng', titleEn: 'Elite', minScore: 3000 },
    { level: 7, title: 'Kỳ tiên', titleEn: 'Legend', minScore: 3800 },
    { level: 8, title: 'Kỳ thánh', titleEn: 'Immortal', minScore: 4500 },
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
 * Return the rank icon emoji for a given score.
 */
export function getRankIcon(score: number): string {
    const level = getLevelFromScore(score);
    return RANK_ICONS[level - 1];
}

/**
 * Return the localized rank title for a given score.
 * @param language - 'en' | 'vi'
 */
export function getRankTitle(score: number, language: 'en' | 'vi' = 'vi'): string {
    const rank = getRankFromScore(score);
    return language === 'en' ? rank.titleEn : rank.title;
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
 * - Base: winner +100, loser -100
 * - If winner's level < loser's level (upset win): bonus = levelDiff × 50 added to winner
 * - If loser's level > winner's level (expected win): no bonus
 * - Symmetric: if loser was HIGHER ranked → winner gains bonus, loser loses extra
 * - If winner was HIGHER ranked → no bonus (expected outcome)
 *
 * Penalty for loser:
 * - If loser was HIGHER ranked (lost to a weaker player): extra penalty = levelDiff × 50
 * - If loser was LOWER ranked (lost to a stronger player): no extra penalty
 */
export function calculateScoreChange(winnerScore: number, loserScore: number): ScoreChange {
    const winnerLevel = getLevelFromScore(winnerScore);
    const loserLevel = getLevelFromScore(loserScore);
    const levelDiff = Math.abs(winnerLevel - loserLevel);
    const bonus = levelDiff * LEVEL_BONUS_PER_TIER;

    if (winnerLevel < loserLevel) {
        // Upset: weaker player beat stronger player — bigger reward AND bigger loss
        return {
            winnerDelta: BASE_SCORE_CHANGE + bonus,
            loserDelta: -(BASE_SCORE_CHANGE + bonus),
        };
    }

    if (winnerLevel > loserLevel) {
        // Expected: stronger beat weaker — only base change
        return {
            winnerDelta: BASE_SCORE_CHANGE,
            loserDelta: -BASE_SCORE_CHANGE,
        };
    }

    // Same level — base change
    return {
        winnerDelta: BASE_SCORE_CHANGE,
        loserDelta: -BASE_SCORE_CHANGE,
    };
}

/**
 * Clamp so a player's score never goes below 0.
 */
export function applyScoreFloor(score: number): number {
    return Math.max(0, score);
}
