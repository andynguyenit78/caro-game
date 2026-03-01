'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '../hooks/useGameState';
import { IconX, IconO } from './Icons';
import GameOverOverlay from './GameOverOverlay';
import PlayerTag from './PlayerTag';
import InlineNameEditor from './InlineNameEditor';
import { useLanguage } from '../context/LanguageContext';
import { Player } from '../lib/gameLogic';
import { playMoveSound, playVictorySound, playDefeatSound } from '../lib/sounds';
import { usePlayerSettings } from '../hooks/usePlayerSettings';

/** Fallback if the room was created before `timerDuration` existed in the schema. */
const DEFAULT_TIMER_SECONDS = 30;

/**
 * Main multiplayer game board — renders the grid, dashboard, timer, and game-over overlay.
 */
export default function Board({ roomId, userId }: { roomId: string; userId: string }) {
    const router = useRouter();
    const {
        gameState,
        myPlayerRole,
        opponentName,
        playersStats,
        makeMove,
        joinGame,
        requestPlayAgain,
        quitGame,
        handleTimeOut,
        hasRequestedPlayAgain,
        isMyTurn,
        lastMove,
    } = useGameState(roomId, userId);
    const { t } = useLanguage();
    const { soundEnabled } = usePlayerSettings();

    const [playerName, setPlayerName] = useState('');
    const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMER_SECONDS);
    const prevBoardRef = useRef<string>('');
    const prevWinnerRef = useRef<string>('');

    // Timer duration synced via Firebase so both players use the same value.
    const timerDuration = gameState.timerDuration ?? DEFAULT_TIMER_SECONDS;
    const opponentRole = myPlayerRole === 'X' ? 'O' : 'X';

    // ── Effects ──────────────────────────────────────────────────────────────

    /** Redirect both players to the homepage when the game is quit. */
    useEffect(() => {
        if (gameState.quit) router.push('/');
    }, [gameState.quit, router]);

    /** Load persisted player name on mount. */
    useEffect(() => {
        setPlayerName(localStorage.getItem('caroPlayerName') || '');
    }, []);

    /** Play a click sound whenever a new piece appears on the board. */
    useEffect(() => {
        const boardSnapshot = JSON.stringify(gameState.board);
        if (
            prevBoardRef.current &&
            prevBoardRef.current !== boardSnapshot &&
            gameState.status !== 'loading' &&
            soundEnabled
        ) {
            playMoveSound();
        }
        prevBoardRef.current = boardSnapshot;
    }, [gameState.board, gameState.status, soundEnabled]);

    /** Play victory or defeat fanfare when a winner is declared. */
    useEffect(() => {
        if (gameState.winner && gameState.winner !== prevWinnerRef.current) {
            if (gameState.winner === myPlayerRole) {
                playVictorySound();
            } else if (myPlayerRole) {
                playDefeatSound();
            }
        }
        prevWinnerRef.current = gameState.winner;
    }, [gameState.winner, myPlayerRole]);

    /** Countdown timer — resets on each turn change, reads duration from Firebase. */
    useEffect(() => {
        if (gameState.status !== 'playing') {
            setTimeLeft(timerDuration);
            return;
        }
        setTimeLeft(timerDuration);
        const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [gameState.status, gameState.currentPlayer, timerDuration]);

    /** Trigger auto-win for the opponent when the timer reaches zero. */
    useEffect(() => {
        if (timeLeft <= 0 && gameState.status === 'playing') {
            handleTimeOut();
        }
    }, [timeLeft, gameState.status, handleTimeOut]);

    /** Automatically join the room as Player O when arriving at a waiting room. */
    useEffect(() => {
        if (gameState?.status === 'waiting' && myPlayerRole === '') {
            joinGame();
        }
    }, [gameState, myPlayerRole, joinGame]);

    // ── Derived values ───────────────────────────────────────────────────────

    const statusMessage = (() => {
        if (gameState.status === 'waiting') return `${t('waitingForO')} (${roomId})...`;
        if (gameState.winner) return gameState.winner === myPlayerRole ? t('youWon') : t('youLost');
        return isMyTurn ? t('yourTurn') : t('opponentTurn');
    })();

    const isTimerDanger = timeLeft <= 10;

    // ── Handlers ─────────────────────────────────────────────────────────────

    const copyInviteLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/play/${roomId}`);
        alert(t('inviteCopied'));
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (!gameState || gameState.status === 'loading') {
        return (
            <div className="glass" style={{ padding: '2rem' }}>
                {t('loadingGame')}
            </div>
        );
    }

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
                            role={myPlayerRole || '?'}
                            displayName={playerName || t('you')}
                            stats={myPlayerRole ? playersStats[myPlayerRole as 'X' | 'O'] : null}
                        />
                        <InlineNameEditor userId={userId} onNameSaved={setPlayerName} />

                        {gameState.status !== 'waiting' && opponentRole && (
                            <>
                                <span className="vs-text">VS</span>
                                <PlayerTag
                                    role={opponentRole}
                                    displayName={opponentName || t('opponent')}
                                    stats={playersStats[opponentRole as 'X' | 'O']}
                                />
                            </>
                        )}
                    </div>
                    <div>{statusMessage}</div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {gameState.status === 'playing' && (
                        <div className={`timer ${isTimerDanger ? 'timer-danger' : ''}`}>
                            ⏱ {timeLeft}s
                        </div>
                    )}
                    {gameState.status === 'waiting' && (
                        <button className="btn-primary" onClick={copyInviteLink}>
                            {t('copyInvite')}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Board Grid ─────────────────────────────────────────── */}
            <div
                className="board glass"
                style={{
                    padding: '0.2rem',
                    opacity: gameState.status === 'waiting' ? 0.5 : 1,
                    pointerEvents: gameState.status !== 'playing' || !isMyTurn ? 'none' : 'auto',
                }}
            >
                {gameState.board.map((row: Player[], rowIndex: number) =>
                    row.map((cell: Player, colIndex: number) => {
                        const isLastMove =
                            lastMove && lastMove[0] === rowIndex && lastMove[1] === colIndex;
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
            {gameState.status === 'finished' && myPlayerRole && (
                <GameOverOverlay
                    isWinner={gameState.winner === myPlayerRole}
                    onPlayAgain={requestPlayAgain}
                    onQuit={quitGame}
                    playerRole={gameState.winner || ''}
                    hasWaiting={hasRequestedPlayAgain}
                />
            )}
        </div>
    );
}
