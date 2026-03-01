'use client';
import { useState, useCallback, useEffect } from 'react';
import { BoardState, Player, createEmptyBoard, checkWin, checkWarning } from '../lib/gameLogic';
import { findBestMove } from '../lib/caroAI';
import { subscribeToStats, PlayerStats } from '../lib/playerStats';

export type GameStatus = 'playing' | 'finished';

interface AIGameState {
    board: BoardState;
    currentTurn: Player;
    winner: Player;
    status: GameStatus;
    lastMove: [number, number] | null;
    aiThinking: boolean;
    winningLine?: [number, number][] | null;
    warningLine?: [number, number][] | null;
    latestEmote?: {
        emoji: string;
        sender: Player;
        timestamp: number;
    } | null;
}

export function useAIGameState() {
    const [gameState, setGameState] = useState<AIGameState>({
        board: createEmptyBoard(),
        currentTurn: 'X',
        winner: '',
        status: 'playing',
        lastMove: null,
        aiThinking: false,
        winningLine: null,
        warningLine: null,
        latestEmote: null,
    });

    const makeMove = useCallback((row: number, col: number) => {
        setGameState((prev) => {
            if (prev.status !== 'playing' || prev.currentTurn !== 'X' || prev.aiThinking)
                return prev;
            if (prev.board[row][col] !== '') return prev;

            // Human moves
            const newBoard = prev.board.map((r) => [...r]);
            newBoard[row][col] = 'X';

            const winningLine = checkWin(newBoard, row, col, 'X');
            if (winningLine) {
                return {
                    ...prev,
                    board: newBoard,
                    currentTurn: '' as Player,
                    winner: 'X' as Player,
                    status: 'finished' as GameStatus,
                    lastMove: [row, col] as [number, number],
                    aiThinking: false,
                    winningLine,
                    warningLine: null,
                };
            }

            const warningLine = checkWarning(newBoard, row, col, 'X');

            // Set AI thinking state
            return {
                ...prev,
                board: newBoard,
                currentTurn: 'O' as Player,
                lastMove: [row, col] as [number, number],
                aiThinking: true,
                warningLine,
            };
        });

        // Delayed AI response
        setTimeout(() => {
            setGameState((prev) => {
                if (!prev.aiThinking || prev.status !== 'playing') return prev;

                const newBoard = prev.board.map((r) => [...r]);
                const [aiRow, aiCol] = findBestMove(newBoard, 'O');
                newBoard[aiRow][aiCol] = 'O';

                const aiWinningLine = checkWin(newBoard, aiRow, aiCol, 'O');
                if (aiWinningLine) {
                    return {
                        ...prev,
                        board: newBoard,
                        currentTurn: '' as Player,
                        winner: 'O' as Player,
                        status: 'finished' as GameStatus,
                        lastMove: [aiRow, aiCol] as [number, number],
                        aiThinking: false,
                        winningLine: aiWinningLine,
                        warningLine: null,
                        latestEmote: { emoji: '🤣', sender: 'O', timestamp: Date.now() },
                    };
                }

                const aiWarningLine = checkWarning(newBoard, aiRow, aiCol, 'O');

                return {
                    ...prev,
                    board: newBoard,
                    currentTurn: 'X' as Player,
                    lastMove: [aiRow, aiCol] as [number, number],
                    aiThinking: false,
                    warningLine: aiWarningLine,
                };
            });
        }, 400);
    }, []);

    const resetGame = useCallback(() => {
        setGameState({
            board: createEmptyBoard(),
            currentTurn: 'X',
            winner: '',
            status: 'playing',
            lastMove: null,
            aiThinking: false,
            winningLine: null,
            warningLine: null,
            latestEmote: null,
        });
    }, []);

    const sendEmote = useCallback((emoji: string) => {
        setGameState((prev) => ({
            ...prev,
            latestEmote: {
                emoji,
                sender: 'X',
                timestamp: Date.now(),
            },
        }));

        // AI might reply with a random emote
        if (Math.random() > 0.4) {
            setTimeout(
                () => {
                    setGameState((prev) => {
                        if (prev.status !== 'playing') return prev;
                        const aiEmotes = ['😠', '😭', '🤯', '🤔', '👀'];
                        const randomEmote = aiEmotes[Math.floor(Math.random() * aiEmotes.length)];
                        return {
                            ...prev,
                            latestEmote: {
                                emoji: randomEmote,
                                sender: 'O',
                                timestamp: Date.now(),
                            },
                        };
                    });
                },
                1000 + Math.random() * 1000
            );
        }
    }, []);

    const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
    useEffect(() => {
        const userId = localStorage.getItem('caroUserId');
        if (!userId) return;

        const unsub = subscribeToStats(userId, (stats: PlayerStats) => {
            setPlayerStats(stats);
        });

        return () => unsub();
    }, []);

    return { gameState, playerStats, makeMove, resetGame, sendEmote };
}
