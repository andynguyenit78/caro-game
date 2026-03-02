'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAIGameState } from '../../hooks/useAIGameState';
import { IconX, IconO } from '../../components/Icons';
import { useRouter } from 'next/navigation';
import GameOverOverlay from '../../components/GameOverOverlay';
import PlayerTag from '../../components/PlayerTag';
import InlineNameEditor from '../../components/InlineNameEditor';
import EmotePicker from '../../components/EmotePicker';
import { useLanguage } from '../../context/LanguageContext';
import { Player } from '../../lib/gameLogic';
import { playMoveSound, playVictorySound, playDefeatSound, playSlashSound } from '../../lib/sounds';
import { recordAIGameResult } from '../../lib/playerStats';

/**
 * AI game board — single-player mode against the built-in Caro AI.
 */
export default function AIBoard() {
    const { gameState, playerStats, makeMove, resetGame, sendEmote } = useAIGameState();
    const { t } = useLanguage();
    const prevBoardRef = useRef<string>('');
    const prevWinnerRef = useRef<string>('');
    const hasRecordedResult = useRef(false);
    const [playerName, setPlayerName] = useState('');
    const [userId, setUserId] = useState('');
    const [floatingEmotes, setFloatingEmotes] = useState<
        { id: string; emoji: string; sender: string }[]
    >([]);
    const router = useRouter();

    /** Load localStorage values on mount (client-only, safe for SSR). */
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlayerName(localStorage.getItem('caroPlayerName') || '');
        setUserId(localStorage.getItem('caroUserId') || '');
    }, []);

    // ── Effects ──────────────────────────────────────────────────────────────

    /** Listen for emotes and render floating animations */
    useEffect(() => {
        if (gameState.latestEmote) {
            if (Date.now() - gameState.latestEmote.timestamp > 3000) return;
            const newEmote = {
                id: Math.random().toString(),
                emoji: gameState.latestEmote.emoji,
                sender: gameState.latestEmote.sender,
            };
            const tId = setTimeout(() => setFloatingEmotes((prev) => [...prev, newEmote]), 0);
            const cId = setTimeout(
                () => setFloatingEmotes((prev) => prev.filter((e) => e.id !== newEmote.id)),
                2500
            );
            return () => {
                clearTimeout(tId);
                clearTimeout(cId);
            };
        }
    }, [gameState.latestEmote]);

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

        playSlashSound();

        setTimeout(() => {
            if (gameState.winner === 'X') {
                playVictorySound();
            } else {
                playDefeatSound();
            }
        }, 300);

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
                        <EmotePicker
                            onSelect={sendEmote}
                            disabled={gameState.status !== 'playing'}
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
                                score: 9999,
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
                {(() => {
                    const winningMap = new Map(
                        gameState.winningLine?.map((p, i) => [`${p[0]}-${p[1]}`, i]) || []
                    );
                    const warningMap = new Map(
                        !gameState.winningLine
                            ? gameState.warningLine?.map((p, i) => [`${p[0]}-${p[1]}`, i]) || []
                            : []
                    );

                    return gameState.board.map((row: Player[], rowIndex: number) =>
                        row.map((cell: Player, colIndex: number) => {
                            const key = `${rowIndex}-${colIndex}`;
                            const isLastMove =
                                gameState.lastMove &&
                                gameState.lastMove[0] === rowIndex &&
                                gameState.lastMove[1] === colIndex;

                            const winningIndex = winningMap.get(key) ?? -1;
                            const isWinningCell = winningIndex >= 0;

                            const warningIndex = warningMap.get(key) ?? -1;
                            const isWarningCell = warningIndex >= 0;

                            const popDelay = isWinningCell
                                ? winningIndex * 0.12
                                : isWarningCell
                                  ? warningIndex * 0.12
                                  : 0;
                            const warningPlayer = isWarningCell ? cell : '';

                            return (
                                <div
                                    key={key}
                                    className={`cell ${isLastMove ? 'cell-last-move' : ''} ${isWinningCell ? `cell-winning cell-winning-${gameState.winner}` : ''} ${isWarningCell ? `cell-warning cell-warning-${warningPlayer}` : ''}`}
                                    style={
                                        isWinningCell || isWarningCell
                                            ? { animationDelay: `${popDelay}s` }
                                            : undefined
                                    }
                                    onClick={() => makeMove(rowIndex, colIndex)}
                                >
                                    {cell === 'X' && <IconX className="cell-icon icon-x" />}
                                    {cell === 'O' && <IconO className="cell-icon icon-o" />}
                                    {cell === '' &&
                                        !gameState.aiThinking &&
                                        gameState.status === 'playing' && (
                                            <div className="ghost-icon">
                                                <IconX className="cell-icon icon-x" />
                                            </div>
                                        )}
                                </div>
                            );
                        })
                    );
                })()}

                {floatingEmotes.map((emote) => (
                    <div
                        key={emote.id}
                        className="floating-emote"
                        style={{
                            left: emote.sender === 'X' ? '20%' : '70%',
                            bottom: '15%',
                        }}
                    >
                        {emote.emoji}
                    </div>
                ))}
            </div>

            {/* ── Game Over Overlay ──────────────────────────────────── */}
            {gameState.status === 'finished' && (
                <GameOverOverlay
                    isWinner={gameState.winner === 'X'}
                    onPlayAgain={handleReset}
                    onQuit={() => router.push('/')}
                    playerRole={gameState.winner || ''}
                />
            )}
        </div>
    );
}
