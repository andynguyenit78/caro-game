import { useEffect, useState, useCallback, useRef } from 'react';
import { Player, createEmptyBoard, checkWin } from '../lib/gameLogic';
import { PlayerStats, recordGameResult, updatePlayerName } from '../lib/playerStats';
import {
    GameState,
    subscribeToGame,
    subscribeToPlayer,
    setGameState,
    updateGameState,
} from '../lib/gameService';

// ─── Constants ──────────────────────────────────────────────────────────────────

const BOARD_SIZE = 15;
const DEFAULT_TIMER_SECONDS = 30;

// ─── Helpers (pure functions, no hooks) ─────────────────────────────────────────

/** Factory for the initial loading-state placeholder. */
const createDefaultState = (): GameState => ({
    board: createEmptyBoard(BOARD_SIZE),
    currentPlayer: 'X',
    winner: '',
    status: 'loading',
    players: {},
});

/** Read the player display name from localStorage (safe for SSR). */
function getLocalPlayerName(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('caroPlayerName') || '';
}

/** Read the preferred timer duration from localStorage (safe for SSR). */
function getLocalTimerDuration(): number {
    if (typeof window === 'undefined') return DEFAULT_TIMER_SECONDS;
    return parseInt(localStorage.getItem('caroTimerSeconds') || String(DEFAULT_TIMER_SECONDS), 10);
}

/** Build initial game state for a new room, owned by the given user. */
function buildNewRoomState(userId: string): GameState {
    return {
        board: createEmptyBoard(BOARD_SIZE),
        currentPlayer: 'X',
        winner: '',
        status: 'waiting',
        players: { X: userId },
        playerNames: { X: getLocalPlayerName() },
        timerDuration: getLocalTimerDuration(),
    };
}

// ─── Types ──────────────────────────────────────────────────────────────────────

interface PlayerStatsMap {
    X: PlayerStats | null;
    O: PlayerStats | null;
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Core multiplayer game-state hook.
 *
 * Subscribes to a Firebase game room and exposes:
 * - Reactive game state (board, players, status, winner)
 * - Player identity (role, opponent name, stats)
 * - Action callbacks (makeMove, joinGame, requestPlayAgain, quitGame, handleTimeOut)
 * - Derived flags (isMyTurn, hasRequestedPlayAgain, lastMove)
 */
export function useGameState(roomId: string, userId: string) {
    // ── State ────────────────────────────────────────────────────────────────
    const [gameState, setGameStateLocal] = useState<GameState>(createDefaultState);
    const [myPlayerRole, setMyPlayerRole] = useState<Player>('');
    const [opponentName, setOpponentName] = useState('');
    const [playersStats, setPlayersStats] = useState<PlayerStatsMap>({ X: null, O: null });

    // ── Refs (mutable flags that survive re-renders) ─────────────────────────
    const hasInitialized = useRef(false);
    const hasRecordedResult = useRef(false);

    // ── Effect: subscribe to game room ───────────────────────────────────────

    useEffect(() => {
        if (!roomId || !userId) return;

        // Reset everything when the roomId changes
        hasInitialized.current = false;
        hasRecordedResult.current = false;
        setTimeout(() => {
            setMyPlayerRole('');
            setOpponentName('');
            setGameStateLocal(createDefaultState());
        }, 0);

        const unsubscribe = subscribeToGame(roomId, (data) => {
            if (data) {
                handleExistingRoom(data, roomId, userId);
            } else if (!hasInitialized.current) {
                createNewRoom(roomId, userId);
            }
        });

        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, userId]);

    /**
     * Process an incoming snapshot for an existing room:
     * - Ensures the board array is present
     * - Determines our player role and the opponent's display name
     * - Syncs the room creator's timer preference while still in the lobby
     */
    function handleExistingRoom(data: GameState, currentRoomId: string, currentUserId: string) {
        if (!data.board) {
            data.board = createEmptyBoard(BOARD_SIZE);
        }
        setGameStateLocal(data);

        const players = data.players;
        if (!players) {
            setMyPlayerRole('');
            hasInitialized.current = true;
            return;
        }

        if (players.X === currentUserId) {
            setMyPlayerRole('X');
            syncTimerIfWaiting(data, currentRoomId);
            setOpponentName(data.playerNames?.O || '');
        } else if (players.O === currentUserId) {
            setMyPlayerRole('O');
            setOpponentName(data.playerNames?.X || '');
        } else {
            setMyPlayerRole('');
        }

        hasInitialized.current = true;
    }

    /**
     * If the room is still in the lobby ("waiting") and we are the creator,
     * push our current timer preference to Firebase so Player O inherits it.
     */
    function syncTimerIfWaiting(state: GameState, currentRoomId: string) {
        if (state.status !== 'waiting') return;

        const localDuration = getLocalTimerDuration();
        if (state.timerDuration !== localDuration) {
            updateGameState(currentRoomId, { timerDuration: localDuration }).catch(console.error);
        }
    }

    /** Create a brand-new room and publish it to Firebase. */
    function createNewRoom(currentRoomId: string, currentUserId: string) {
        hasInitialized.current = true;
        const newState = buildNewRoomState(currentUserId);
        setGameState(currentRoomId, newState).catch(console.error);

        const localName = getLocalPlayerName();
        if (localName) updatePlayerName(currentUserId, localName);
    }

    // ── Effect: record game result on finish ─────────────────────────────────

    useEffect(() => {
        if (
            gameState.status !== 'finished' ||
            !gameState.winner ||
            hasRecordedResult.current ||
            !gameState.players.X ||
            !gameState.players.O
        ) {
            return;
        }

        hasRecordedResult.current = true;
        const winnerId = gameState.winner === 'X' ? gameState.players.X : gameState.players.O;
        const loserId = gameState.winner === 'X' ? gameState.players.O : gameState.players.X;

        if (winnerId && loserId) {
            recordGameResult(winnerId, loserId);
        }
    }, [gameState.status, gameState.winner, gameState.players]);

    // ── Effect: subscribe to both players' profile stats ─────────────────────

    useEffect(() => {
        if (!gameState.players.X && !gameState.players.O) return;

        let unsubX: (() => void) | undefined;
        let unsubO: (() => void) | undefined;

        if (gameState.players.X) {
            unsubX = subscribeToPlayer(gameState.players.X, (data) => {
                setPlayersStats((prev) => ({ ...prev, X: data }));
            });
        }
        if (gameState.players.O) {
            unsubO = subscribeToPlayer(gameState.players.O, (data) => {
                setPlayersStats((prev) => ({ ...prev, O: data }));
            });
        }

        return () => {
            unsubX?.();
            unsubO?.();
        };
    }, [gameState.players.X, gameState.players.O]);

    // ── Callbacks ────────────────────────────────────────────────────────────

    /** Join an existing room as Player O. No-op if already assigned or room isn't waiting. */
    const joinGame = useCallback(async () => {
        if (myPlayerRole !== '' || gameState.status !== 'waiting') return;
        if (gameState.players.O || gameState.players.X === userId) return;

        const localName = getLocalPlayerName();
        await updateGameState(roomId, {
            'players/O': userId,
            status: 'playing',
            'playerNames/O': localName,
        });
        if (localName) updatePlayerName(userId, localName);
    }, [roomId, userId, gameState, myPlayerRole]);

    /** Place a piece on the board. Validates turn/cell and checks for a win. */
    const makeMove = useCallback(
        async (row: number, col: number) => {
            const isInvalidMove =
                gameState.status !== 'playing' ||
                gameState.board[row][col] !== '' ||
                gameState.currentPlayer !== myPlayerRole ||
                gameState.winner !== '';

            if (isInvalidMove) return;

            const newBoard = gameState.board.map((r: Player[]) => [...r]);
            newBoard[row][col] = myPlayerRole;

            const winningLine = checkWin(newBoard, row, col, myPlayerRole);
            const won = !!winningLine;
            const nextPlayer = myPlayerRole === 'X' ? 'O' : 'X';

            await updateGameState(roomId, {
                board: newBoard,
                currentPlayer: won ? gameState.currentPlayer : nextPlayer,
                winner: won ? myPlayerRole : '',
                status: won ? 'finished' : 'playing',
                lastMove: [row, col],
                ...(won ? { winningLine } : {}),
            });
        },
        [roomId, gameState, myPlayerRole]
    );

    /** Vote to play again. If both players voted, reset the board automatically. */
    const requestPlayAgain = useCallback(async () => {
        if (myPlayerRole === '') return;

        const opponentRole = myPlayerRole === 'X' ? 'O' : 'X';
        const opponentAgreed = gameState.playAgain?.[opponentRole as 'X' | 'O'] === true;

        if (opponentAgreed) {
            // Both agreed — reset the board
            hasRecordedResult.current = false;
            await updateGameState(roomId, {
                board: createEmptyBoard(BOARD_SIZE),
                currentPlayer: 'X',
                winner: '',
                status: 'playing',
                lastMove: null,
                quit: null,
                playAgain: null,
                winningLine: null,
            });
        } else {
            // Only this player voted so far
            await updateGameState(roomId, {
                playAgain: { ...gameState.playAgain, [myPlayerRole]: true },
            });
        }
    }, [roomId, myPlayerRole, gameState.playAgain]);

    /** Signal both players to quit — triggers a redirect in Board.tsx. */
    const quitGame = useCallback(async () => {
        if (myPlayerRole === '') return;
        await updateGameState(roomId, { quit: true });
    }, [roomId, myPlayerRole]);

    /** Called when the move timer expires — the opponent of the current player wins. */
    const handleTimeOut = useCallback(async () => {
        if (gameState.status !== 'playing') return;
        const winner = gameState.currentPlayer === 'X' ? 'O' : 'X';
        await updateGameState(roomId, { status: 'finished', winner });
    }, [roomId, gameState.status, gameState.currentPlayer]);

    /** Send a floating emoji reaction to the room. */
    const sendEmote = useCallback(
        async (emoji: string) => {
            if (!myPlayerRole) return;
            await updateGameState(roomId, {
                latestEmote: {
                    emoji,
                    sender: myPlayerRole,
                    timestamp: Date.now(),
                },
            });
        },
        [roomId, myPlayerRole]
    );

    // ── Public API ───────────────────────────────────────────────────────────

    return {
        gameState,
        myPlayerRole,
        opponentName,
        playersStats,
        makeMove,
        joinGame,
        requestPlayAgain,
        quitGame,
        handleTimeOut,
        sendEmote,
        hasRequestedPlayAgain: gameState.playAgain?.[myPlayerRole as 'X' | 'O'] === true,
        isMyTurn: gameState.currentPlayer === myPlayerRole,
        lastMove: gameState.lastMove || null,
    };
}
