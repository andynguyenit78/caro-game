'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAIGameState } from '../../hooks/useAIGameState';
import { IconX, IconO } from '../../components/Icons';
import GameOverOverlay from '../../components/GameOverOverlay';
import PlayerTag from '../../components/PlayerTag';
import InlineNameEditor from '../../components/InlineNameEditor';
import { useLanguage } from '../../context/LanguageContext';
import { Player } from '../../lib/gameLogic';
import { playMoveSound, playVictorySound, playDefeatSound } from '../../lib/sounds';
import { recordAIGameResult } from '../../lib/playerStats';

/**
 * AI game board — single-player mode against the built-in Caro AI.
 */
export default function AIBoard() {
    const { gameState, playerStats, makeMove, resetGame } = useAIGameState();
    const { t } = useLanguage();
    const prevBoardRef = useRef<string>('');
    const prevWinnerRef = useRef<string>('');
    const hasRecordedResult = useRef(false);
    const [playerName, setPlayerName] = useState('');
    const [userId, setUserId] = useState('');

    /** Load localStorage values on mount (client-only, safe for SSR). */
    useEffect(() => {
        setPlayerName(localStorage.getItem('caroPlayerName') || '');
        setUserId(localStorage.getItem('caroUserId') || '');
    }, []);

    // ── Effects ──────────────────────────────────────────────────────────────

    /** Play a click sound whenever a new piece appears on the board. */
    useEffect(() => {
        const boardSnapshot = JSON.stringify(gameState.board);
        if (prevBoardRef.current && prevBoardRef.current !== boardSnapshot) {
            playMoveSound();
        }
        prevBoardRef.current = boardSnapshot;
    }, [gameState.board]);

    /** Play victory/defeat fanfare and record the game result. */
    useEffect(() => {
        if (!gameState.winner || gameState.winner === prevWinnerRef.current) return;

        if (gameState.winner === 'X') {
            playVictorySound();
        } else {
            playDefeatSound();
        }

        if (!hasRecordedResult.current) {
            hasRecordedResult.current = true;
            const userId = localStorage.getItem('caroUserId');
            if (userId) recordAIGameResult(userId, gameState.winner === 'X');
        }

        prevWinnerRef.current = gameState.winner;
    }, [gameState.winner]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleReset = useCallback(() => {
        hasRecordedResult.current = false;
        resetGame();
    }, [resetGame]);

    // ── Derived values ───────────────────────────────────────────────────────

    const statusMessage = (() => {
        if (gameState.winner === 'X') return t('youWon');
        if (gameState.winner === 'O') return t('youLost');
        if (gameState.aiThinking) return t('aiThinking');
        return t('yourTurn');
    })();

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="board-container">
            {/* ── Dashboard ──────────────────────────────────────────── */}
            <div className="dashboard glass">
                <div
                    className="status-badge"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '0.3rem',
                    }}
                >
                    <div className="players-row">
                        <PlayerTag
                            role="X"
                            displayName={playerName || t('you')}
                            stats={playerStats}
                        />
                        <InlineNameEditor
                            userId={userId}
                            onNameSaved={(newName) => setPlayerName(newName)}
                        />

                        <span className="vs-text">VS</span>

                        <PlayerTag
                            role="O"
                            displayName="AI"
                            stats={{
                                name: 'AI',
                                avatar: '🤖',
                                wins: 99,
                                losses: 1,
                                gamesPlayed: 100,
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {statusMessage}
                        {gameState.aiThinking && <span className="ai-thinking-dot" />}
                    </div>
                </div>

                <button className="btn-primary" onClick={handleReset}>
                    {t('newGame')}
                </button>
            </div>

            {/* ── Board Grid ─────────────────────────────────────────── */}
            <div
                className="board glass"
                style={{
                    padding: '0.2rem',
                    pointerEvents:
                        gameState.status !== 'playing' || gameState.aiThinking ? 'none' : 'auto',
                }}
            >
                {gameState.board.map((row: Player[], rowIndex: number) =>
                    row.map((cell: Player, colIndex: number) => {
                        const isLastMove =
                            gameState.lastMove &&
                            gameState.lastMove[0] === rowIndex &&
                            gameState.lastMove[1] === colIndex;
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`cell ${isLastMove ? 'cell-last-move' : ''}`}
                                onClick={() => makeMove(rowIndex, colIndex)}
                            >
                                {cell === 'X' && <IconX className="cell-icon icon-x" />}
                                {cell === 'O' && <IconO className="cell-icon icon-o" />}
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── Game Over Overlay ──────────────────────────────────── */}
            {gameState.status === 'finished' && (
                <GameOverOverlay
                    isWinner={gameState.winner === 'X'}
                    onPlayAgain={handleReset}
                    playerRole={gameState.winner || ''}
                />
            )}
        </div>
    );
}
