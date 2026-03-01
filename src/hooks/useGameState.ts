import { useEffect, useState, useCallback, useRef } from 'react';
import { ref, onValue, set, update, get } from 'firebase/database';
import { db } from '../lib/firebase';
import { BoardState, Player, createEmptyBoard, checkWin } from '../lib/gameLogic';

export interface GameState {
    board: BoardState;
    currentPlayer: Player;
    winner: Player | '';
    status: 'loading' | 'waiting' | 'playing' | 'finished';
    players: {
        X?: string;
        O?: string;
    };
    lastMove?: [number, number] | null;
}

const createDefaultState = (): GameState => ({
    board: createEmptyBoard(15),
    currentPlayer: 'X',
    winner: '',
    status: 'loading',
    players: {},
});

export function useGameState(roomId: string, userId: string) {
    const [gameState, setGameState] = useState<GameState>(createDefaultState);
    const [myPlayerRole, setMyPlayerRole] = useState<Player>('');
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!roomId || !userId) return;

        // Reset on roomId change
        hasInitialized.current = false;
        setMyPlayerRole('');
        setGameState(createDefaultState());

        const gameRef = ref(db, `games/${roomId}`);

        const unsubscribe = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();

            if (data) {
                // Room exists in Firebase — load it
                // Ensure board is present (fallback for corrupted states)
                if (!data.board) {
                    data.board = createEmptyBoard(15);
                }
                setGameState(data as GameState);

                // Determine our role based on stored player IDs
                if (data.players?.X === userId) {
                    setMyPlayerRole('X');
                } else if (data.players?.O === userId) {
                    setMyPlayerRole('O');
                } else {
                    // We're a spectator (our userId doesn't match either player)
                    setMyPlayerRole('');
                }
                hasInitialized.current = true;
            } else if (!hasInitialized.current) {
                // Room does NOT exist and we haven't initialized yet
                // Create it and join as Player X
                hasInitialized.current = true;
                const newState: GameState = {
                    board: createEmptyBoard(15),
                    currentPlayer: 'X',
                    winner: '',
                    status: 'waiting',
                    players: { X: userId },
                };
                set(gameRef, newState);
                // Don't need to setGameState here — the set() above will
                // trigger onValue again with the new data
            }
        });

        return () => unsubscribe();
    }, [roomId, userId]);

    // Join an existing game as Player O
    const joinGame = useCallback(async () => {
        if (myPlayerRole !== '' || gameState.status !== 'waiting') return;

        // Only join as O if the slot is free and we're not already Player X
        if (!gameState.players.O && gameState.players.X !== userId) {
            const updates = {
                'players/O': userId,
                'status': 'playing',
            };
            await update(ref(db, `games/${roomId}`), updates);
            // onValue will fire and update our role automatically
        }
    }, [roomId, userId, gameState, myPlayerRole]);

    const makeMove = useCallback(async (row: number, col: number) => {
        if (
            gameState.status !== 'playing' ||
            gameState.board[row][col] !== '' ||
            gameState.currentPlayer !== myPlayerRole ||
            gameState.winner !== ''
        ) {
            return;
        }

        const newBoard = gameState.board.map((r: Player[]) => [...r]);
        newBoard[row][col] = myPlayerRole;

        const isWin = checkWin(newBoard, row, col, myPlayerRole);
        const nextPlayer = myPlayerRole === 'X' ? 'O' : 'X';

        const updates = {
            board: newBoard,
            currentPlayer: isWin ? gameState.currentPlayer : nextPlayer,
            winner: isWin ? myPlayerRole : '',
            status: isWin ? 'finished' : 'playing',
            lastMove: [row, col],
        };

        await update(ref(db, `games/${roomId}`), updates);
    }, [roomId, gameState, myPlayerRole]);

    const resetGame = useCallback(async () => {
        if (myPlayerRole === '') return;

        const updates = {
            board: createEmptyBoard(15),
            currentPlayer: 'X',
            winner: '',
            status: 'playing',
            lastMove: null,
        };

        await update(ref(db, `games/${roomId}`), updates);
    }, [roomId, myPlayerRole]);

    return {
        gameState,
        myPlayerRole,
        makeMove,
        joinGame,
        resetGame,
        isMyTurn: gameState.currentPlayer === myPlayerRole,
        lastMove: gameState.lastMove || null,
    };
}
