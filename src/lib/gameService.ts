import { ref, onValue, set, update } from 'firebase/database';
import { db } from './firebase';
import { BoardState, Player } from './gameLogic';
import { PlayerStats } from './playerStats';

export interface GameState {
    board: BoardState;
    currentPlayer: Player;
    winner: Player | '';
    status: 'loading' | 'waiting' | 'playing' | 'finished';
    players: {
        X?: string;
        O?: string;
    };
    playerNames?: {
        X?: string;
        O?: string;
    };
    lastMove?: [number, number] | null;
    quit?: boolean;
    timerDuration?: number;
    playAgain?: {
        X?: boolean;
        O?: boolean;
    };
    winningLine?: [number, number][] | null;
    warningLine?: [number, number][] | null;
    latestEmote?: {
        emoji: string;
        sender: Player;
        timestamp: number;
    } | null;
}

/**
 * Subscribes to changes in a game room
 */
export function subscribeToGame(roomId: string, callback: (data: GameState | null) => void) {
    const gameRef = ref(db, `games/${roomId}`);
    return onValue(gameRef, (snapshot) => {
        callback(snapshot.val());
    });
}

/**
 * Subscribes to a player's profile data
 */
export function subscribeToPlayer(userId: string, callback: (data: PlayerStats | null) => void) {
    const userRef = ref(db, `users/${userId}`);
    return onValue(userRef, (snapshot) => {
        callback(snapshot.val());
    });
}

/**
 * Creates or updates a game room with the given state
 */
export async function setGameState(roomId: string, state: GameState) {
    const gameRef = ref(db, `games/${roomId}`);
    await set(gameRef, state);
}

/**
 * Applies partial updates to a game room
 */
export async function updateGameState(
    roomId: string,
    updates: Partial<GameState> | Record<string, unknown>
) {
    await update(ref(db, `games/${roomId}`), updates);
}
