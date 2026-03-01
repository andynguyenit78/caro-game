'use client';
import { useState, useCallback } from 'react';
import { BoardState, Player, createEmptyBoard, checkWin } from '../lib/gameLogic';
import { findBestMove } from '../lib/caroAI';

export type GameStatus = 'playing' | 'finished';

interface AIGameState {
    board: BoardState;
    currentTurn: Player;
    winner: Player;
    status: GameStatus;
}

export function useAIGameState() {
    const [gameState, setGameState] = useState<AIGameState>({
        board: createEmptyBoard(),
        currentTurn: 'X', // Human is always X, goes first
        winner: '',
        status: 'playing',
    });

    const makeMove = useCallback((row: number, col: number) => {
        setGameState(prev => {
            if (prev.status !== 'playing' || prev.currentTurn !== 'X') return prev;
            if (prev.board[row][col] !== '') return prev;

            // Human moves
            const newBoard = prev.board.map(r => [...r]);
            newBoard[row][col] = 'X';

            if (checkWin(newBoard, row, col, 'X')) {
                return {
                    board: newBoard,
                    currentTurn: '' as Player,
                    winner: 'X' as Player,
                    status: 'finished',
                };
            }

            // AI moves
            const [aiRow, aiCol] = findBestMove(newBoard, 'O');
            newBoard[aiRow][aiCol] = 'O';

            if (checkWin(newBoard, aiRow, aiCol, 'O')) {
                return {
                    board: newBoard,
                    currentTurn: '' as Player,
                    winner: 'O' as Player,
                    status: 'finished',
                };
            }

            return {
                board: newBoard,
                currentTurn: 'X' as Player,
                winner: '' as Player,
                status: 'playing',
            };
        });
    }, []);

    const resetGame = useCallback(() => {
        setGameState({
            board: createEmptyBoard(),
            currentTurn: 'X',
            winner: '',
            status: 'playing',
        });
    }, []);

    return { gameState, makeMove, resetGame };
}
