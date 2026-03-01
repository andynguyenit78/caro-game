'use client';
import { useState, useCallback, useEffect } from 'react';
import { BoardState, Player, createEmptyBoard, checkWin } from '../lib/gameLogic';
import { findBestMove } from '../lib/caroAI';

export type GameStatus = 'playing' | 'finished';

interface AIGameState {
    board: BoardState;
    currentTurn: Player;
    winner: Player;
    status: GameStatus;
    lastMove: [number, number] | null;
    aiThinking: boolean;
}

export function useAIGameState() {
    const [gameState, setGameState] = useState<AIGameState>({
        board: createEmptyBoard(),
        currentTurn: 'X',
        winner: '',
        status: 'playing',
        lastMove: null,
        aiThinking: false,
    });

    const makeMove = useCallback((row: number, col: number) => {
        setGameState(prev => {
            if (prev.status !== 'playing' || prev.currentTurn !== 'X' || prev.aiThinking) return prev;
            if (prev.board[row][col] !== '') return prev;

            // Human moves
            const newBoard = prev.board.map(r => [...r]);
            newBoard[row][col] = 'X';

            if (checkWin(newBoard, row, col, 'X')) {
                return {
                    ...prev,
                    board: newBoard,
                    currentTurn: '' as Player,
                    winner: 'X' as Player,
                    status: 'finished' as GameStatus,
                    lastMove: [row, col] as [number, number],
                    aiThinking: false,
                };
            }

            // Set AI thinking state
            return {
                ...prev,
                board: newBoard,
                currentTurn: 'O' as Player,
                lastMove: [row, col] as [number, number],
                aiThinking: true,
            };
        });

        // Delayed AI response
        setTimeout(() => {
            setGameState(prev => {
                if (!prev.aiThinking || prev.status !== 'playing') return prev;

                const newBoard = prev.board.map(r => [...r]);
                const [aiRow, aiCol] = findBestMove(newBoard, 'O');
                newBoard[aiRow][aiCol] = 'O';

                if (checkWin(newBoard, aiRow, aiCol, 'O')) {
                    return {
                        ...prev,
                        board: newBoard,
                        currentTurn: '' as Player,
                        winner: 'O' as Player,
                        status: 'finished' as GameStatus,
                        lastMove: [aiRow, aiCol] as [number, number],
                        aiThinking: false,
                    };
                }

                return {
                    ...prev,
                    board: newBoard,
                    currentTurn: 'X' as Player,
                    lastMove: [aiRow, aiCol] as [number, number],
                    aiThinking: false,
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
        });
    }, []);

    const [playerStats, setPlayerStats] = useState<any>(null);
    useEffect(() => {
        const userId = localStorage.getItem('caroUserId');
        if (!userId) return;

        const { ref, onValue } = require('firebase/database');
        const { db } = require('../lib/firebase');

        const unsub = onValue(ref(db, `users/${userId}`), (snap: any) => {
            setPlayerStats(snap.val());
        });

        return () => unsub();
    }, []);

    return { gameState, playerStats, makeMove, resetGame };
}
