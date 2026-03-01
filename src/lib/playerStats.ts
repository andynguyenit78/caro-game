import { ref, get, update, onValue } from 'firebase/database';
import { db } from './firebase';
import {
    calculateScoreChange,
    applyScoreFloor,
    getRankFromScore,
    getLevelFromScore,
} from './rankSystem';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlayerStats {
    name: string;
    avatar: string;
    wins: number;
    losses: number;
    gamesPlayed: number;
    /** Cumulative ranking score (starts at 0, used by rankSystem) */
    score: number;
}

const defaultStats: PlayerStats = {
    name: '',
    avatar: '',
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    score: 0,
};

// ─── Profile CRUD ────────────────────────────────────────────────────────────

/**
 * Get or create user profile in Firebase.
 * New profiles start with score: 0 (Tân thủ).
 */
export async function getOrCreateProfile(userId: string): Promise<PlayerStats> {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
        return { ...defaultStats, ...snapshot.val() } as PlayerStats;
    }

    const localName =
        typeof window !== 'undefined' ? localStorage.getItem('caroPlayerName') || '' : '';
    const newProfile: PlayerStats = { ...defaultStats, name: localName };
    await update(ref(db, `users/${userId}`), newProfile);
    return newProfile;
}

/**
 * Update user display name in Firebase.
 */
export async function updatePlayerName(userId: string, name: string) {
    await update(ref(db, `users/${userId}`), { name });
}

/**
 * Update user avatar in Firebase.
 */
export async function updatePlayerAvatar(userId: string, avatar: string) {
    await update(ref(db, `users/${userId}`), { avatar });
    if (typeof window !== 'undefined') {
        localStorage.setItem('caroPlayerAvatar', avatar);
    }
}

/**
 * Fetch a player's display name from Firebase.
 */
export async function getPlayerName(userId: string): Promise<string> {
    const snapshot = await get(ref(db, `users/${userId}/name`));
    return snapshot.exists() ? snapshot.val() : '';
}

// ─── Game Result Recording ───────────────────────────────────────────────────

/**
 * Record a multiplayer game result and update score + stats for both players.
 *
 * Score delta:
 * - Base: +100 / -100
 * - Upset bonus: if winner's level < loser's level → ±(levelDiff × 50) applied symmetrically
 */
export async function recordGameResult(winnerId: string, loserId: string) {
    const [winnerSnap, loserSnap] = await Promise.all([
        get(ref(db, `users/${winnerId}`)),
        get(ref(db, `users/${loserId}`)),
    ]);

    const winnerStats: PlayerStats = { ...defaultStats, ...winnerSnap.val() };
    const loserStats: PlayerStats = { ...defaultStats, ...loserSnap.val() };

    const { winnerDelta, loserDelta } = calculateScoreChange(
        winnerStats.score ?? 0,
        loserStats.score ?? 0
    );

    await Promise.all([
        update(ref(db, `users/${winnerId}`), {
            wins: (winnerStats.wins || 0) + 1,
            gamesPlayed: (winnerStats.gamesPlayed || 0) + 1,
            score: applyScoreFloor((winnerStats.score ?? 0) + winnerDelta),
        }),
        update(ref(db, `users/${loserId}`), {
            losses: (loserStats.losses || 0) + 1,
            gamesPlayed: (loserStats.gamesPlayed || 0) + 1,
            score: applyScoreFloor((loserStats.score ?? 0) + loserDelta),
        }),
    ]);
}

/**
 * Record an AI game result (only updates the human player's stats).
 * AI matches use a flat ±50 score change (half of PvP base).
 */
export async function recordAIGameResult(userId: string, won: boolean) {
    const snapshot = await get(ref(db, `users/${userId}`));
    const stats: PlayerStats = { ...defaultStats, ...snapshot.val() };

    const AI_SCORE_CHANGE = 50;
    const scoreDelta = won ? AI_SCORE_CHANGE : -AI_SCORE_CHANGE;

    const updates: Record<string, number> = {
        gamesPlayed: (stats.gamesPlayed || 0) + 1,
        score: applyScoreFloor((stats.score ?? 0) + scoreDelta),
    };

    if (won) {
        updates.wins = (stats.wins || 0) + 1;
    } else {
        updates.losses = (stats.losses || 0) + 1;
    }

    await update(ref(db, `users/${userId}`), updates);
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

/**
 * Subscribe to real-time updates for a player's stats.
 */
export function subscribeToStats(userId: string, callback: (stats: PlayerStats) => void) {
    const userRef = ref(db, `users/${userId}`);
    return onValue(userRef, (snapshot) => {
        callback(snapshot.exists() ? { ...defaultStats, ...snapshot.val() } : defaultStats);
    });
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
    userId: string;
    name: string;
    avatar: string;
    wins: number;
    losses: number;
    gamesPlayed: number;
    winRate: number;
    score: number;
    level: number;
    rankTitle: string; // Vietnamese
    rankTitleEn: string; // English
}

/** Shared helper: convert raw Firebase user map → sorted LeaderboardEntry array. */
function buildLeaderboard(usersVal: Record<string, unknown>, limit: number): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];

    for (const [userId, data] of Object.entries(usersVal)) {
        const d = data as PlayerStats;
        if (!d.name || !d.gamesPlayed || d.gamesPlayed < 1) continue;

        const score = d.score ?? 0;
        const rank = getRankFromScore(score);

        entries.push({
            userId,
            name: d.name,
            avatar: d.avatar || '',
            wins: d.wins || 0,
            losses: d.losses || 0,
            gamesPlayed: d.gamesPlayed,
            winRate: Math.round(((d.wins || 0) / d.gamesPlayed) * 100),
            score,
            level: rank.level,
            rankTitle: rank.title,
            rankTitleEn: rank.titleEn,
        });
    }

    // Sort by score descending, tiebreak by win rate
    entries.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.winRate - a.winRate;
    });

    return entries.slice(0, limit);
}

/**
 * Subscribe to real-time leaderboard updates via Firebase `onValue`.
 * Fires immediately with current data, then on every score change.
 * Returns an unsubscribe function.
 */
export function subscribeToLeaderboard(
    callback: (entries: LeaderboardEntry[]) => void,
    limit = 10
): () => void {
    const usersRef = ref(db, 'users');
    return onValue(usersRef, (snapshot) => {
        if (!snapshot.exists()) {
            callback([]);
            return;
        }
        callback(buildLeaderboard(snapshot.val(), limit));
    });
}

/**
 * One-time fetch of top players sorted by score.
 * Prefer `subscribeToLeaderboard` for live pages.
 */
export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const snapshot = await get(ref(db, 'users'));
    if (!snapshot.exists()) return [];
    return buildLeaderboard(snapshot.val(), limit);
}
