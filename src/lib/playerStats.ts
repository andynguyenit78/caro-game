import { ref, get, update, onValue } from 'firebase/database';
import { db } from './firebase';

export interface PlayerStats {
    name: string;
    wins: number;
    losses: number;
    gamesPlayed: number;
}

const defaultStats: PlayerStats = {
    name: '',
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
};

/**
 * Get or create user profile in Firebase
 */
export async function getOrCreateProfile(userId: string): Promise<PlayerStats> {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
        return { ...defaultStats, ...snapshot.val() } as PlayerStats;
    }

    // Create new profile
    const localName = typeof window !== 'undefined'
        ? localStorage.getItem('caroPlayerName') || ''
        : '';
    const newProfile: PlayerStats = { ...defaultStats, name: localName };
    await update(ref(db, `users/${userId}`), newProfile);
    return newProfile;
}

/**
 * Update user display name in Firebase
 */
export async function updatePlayerName(userId: string, name: string) {
    await update(ref(db, `users/${userId}`), { name });
}

/**
 * Fetch a player's display name from Firebase (for opponent)
 */
export async function getPlayerName(userId: string): Promise<string> {
    const snapshot = await get(ref(db, `users/${userId}/name`));
    return snapshot.exists() ? snapshot.val() : '';
}

/**
 * Record game result for both players
 */
export async function recordGameResult(winnerId: string, loserId: string) {
    // Get current stats
    const winnerSnap = await get(ref(db, `users/${winnerId}`));
    const loserSnap = await get(ref(db, `users/${loserId}`));

    const winnerStats = winnerSnap.exists() ? winnerSnap.val() : { ...defaultStats };
    const loserStats = loserSnap.exists() ? loserSnap.val() : { ...defaultStats };

    await update(ref(db, `users/${winnerId}`), {
        wins: (winnerStats.wins || 0) + 1,
        gamesPlayed: (winnerStats.gamesPlayed || 0) + 1,
    });

    await update(ref(db, `users/${loserId}`), {
        losses: (loserStats.losses || 0) + 1,
        gamesPlayed: (loserStats.gamesPlayed || 0) + 1,
    });
}

/**
 * Record AI game result (only the human player)
 */
export async function recordAIGameResult(userId: string, won: boolean) {
    const snapshot = await get(ref(db, `users/${userId}`));
    const stats = snapshot.exists() ? snapshot.val() : { ...defaultStats };

    const updates: Record<string, number> = {
        gamesPlayed: (stats.gamesPlayed || 0) + 1,
    };

    if (won) {
        updates.wins = (stats.wins || 0) + 1;
    } else {
        updates.losses = (stats.losses || 0) + 1;
    }

    await update(ref(db, `users/${userId}`), updates);
}

/**
 * Subscribe to user stats changes
 */
export function subscribeToStats(userId: string, callback: (stats: PlayerStats) => void) {
    const userRef = ref(db, `users/${userId}`);
    return onValue(userRef, (snapshot) => {
        callback(snapshot.exists() ? { ...defaultStats, ...snapshot.val() } : defaultStats);
    });
}

export interface LeaderboardEntry {
    userId: string;
    name: string;
    wins: number;
    losses: number;
    gamesPlayed: number;
    winRate: number;
}

/**
 * Fetch top players sorted by win rate (min 1 game)
 */
export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const snapshot = await get(ref(db, 'users'));
    if (!snapshot.exists()) return [];

    const users = snapshot.val();
    const entries: LeaderboardEntry[] = [];

    for (const [userId, data] of Object.entries(users)) {
        const d = data as PlayerStats;
        if (!d.name || !d.gamesPlayed || d.gamesPlayed < 1) continue;
        entries.push({
            userId,
            name: d.name,
            wins: d.wins || 0,
            losses: d.losses || 0,
            gamesPlayed: d.gamesPlayed,
            winRate: Math.round(((d.wins || 0) / d.gamesPlayed) * 100),
        });
    }

    entries.sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.wins - a.wins; // tiebreak by total wins
    });

    return entries.slice(0, limit);
}

