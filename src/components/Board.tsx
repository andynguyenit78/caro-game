'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import { IconX, IconO } from './Icons';
import GameOverOverlay from './GameOverOverlay';
import { useLanguage } from '../context/LanguageContext';
import { Player } from '../lib/gameLogic';
import { playMoveSound, playVictorySound, playDefeatSound } from '../lib/sounds';
import { updatePlayerName } from '../lib/playerStats';

const MOVE_TIMER_SECONDS = 30;

export default function Board({ roomId, userId }: { roomId: string, userId: string }) {
    const { gameState, myPlayerRole, opponentName, playersStats, makeMove, joinGame, resetGame, isMyTurn, lastMove } = useGameState(roomId, userId);
    const { t } = useLanguage();
    const [playerName, setPlayerName] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(MOVE_TIMER_SECONDS);
    const prevBoardRef = useRef<string>('');
    const prevWinnerRef = useRef<string>('');

    // Load player name
    useEffect(() => {
        setPlayerName(localStorage.getItem('caroPlayerName') || '');
    }, []);

    // Sound on move
    useEffect(() => {
        const boardStr = JSON.stringify(gameState.board);
        if (prevBoardRef.current && prevBoardRef.current !== boardStr && gameState.status !== 'loading') {
            playMoveSound();
        }
        prevBoardRef.current = boardStr;
    }, [gameState.board, gameState.status]);

    // Sound on win/lose
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

    // Move timer
    useEffect(() => {
        if (gameState.status !== 'playing') {
            setTimeLeft(MOVE_TIMER_SECONDS);
            return;
        }
        setTimeLeft(MOVE_TIMER_SECONDS);
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) return MOVE_TIMER_SECONDS;
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [gameState.status, gameState.currentPlayer]);

    // Auto-join
    useEffect(() => {
        if (gameState && gameState.status === 'waiting' && myPlayerRole === '') {
            joinGame();
        }
    }, [gameState, myPlayerRole, joinGame]);

    const saveName = useCallback(() => {
        const trimmed = nameInput.trim();
        setPlayerName(trimmed);
        localStorage.setItem('caroPlayerName', trimmed);
        setEditingName(false);
        // Sync to Firebase profile
        updatePlayerName(userId, trimmed);
    }, [nameInput, userId]);

    if (!gameState || gameState.status === 'loading') {
        return <div className="glass" style={{ padding: '2rem' }}>{t('loadingGame')}</div>;
    }

    const handleCellClick = (row: number, col: number) => {
        makeMove(row, col);
    };

    const getStatusMessage = () => {
        if (gameState.status === 'waiting') {
            return `${t('waitingForO')} (${roomId})...`;
        }
        if (gameState.winner) {
            if (gameState.winner === myPlayerRole) return t('youWon');
            return t('youLost');
        }
        return isMyTurn ? t('yourTurn') : t('opponentTurn');
    };

    const copyInviteLink = () => {
        const url = `${window.location.origin}/play/${roomId}`;
        navigator.clipboard.writeText(url);
        alert(t('inviteCopied'));
    };

    const timerDanger = timeLeft <= 10;
    const opponentRole = myPlayerRole === 'X' ? 'O' : 'X';

    return (
        <div className="board-container">
            <div className="dashboard glass">
                <div className="status-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem' }}>
                    <div className="players-row">
                        <button
                            className="profile-back-btn"
                            style={{ position: 'relative', top: 0, left: 0, marginRight: '0.5rem' }}
                            onClick={() => window.location.href = '/'}
                            title={t('backHome')}
                        >
                            🏠
                        </button>

                        <div className="player-tag">
                            <span className={myPlayerRole === 'X' ? 'icon-x' : 'icon-o'} style={{ fontWeight: 'bold' }}>
                                {myPlayerRole || '?'}
                            </span>
                            {playersStats && playersStats[myPlayerRole as 'X' | 'O']?.avatar && (
                                <span className="lb-avatar">{playersStats[myPlayerRole as 'X' | 'O'].avatar}</span>
                            )}
                            <span>{playerName || t('you')}</span>
                            {playersStats && playersStats[myPlayerRole as 'X' | 'O']?.gamesPlayed > 0 && (
                                <span className="lb-stats" style={{ marginLeft: '0.2rem' }}>
                                    ({Math.round((playersStats[myPlayerRole as 'X' | 'O'].wins / playersStats[myPlayerRole as 'X' | 'O'].gamesPlayed) * 100)}%)
                                </span>
                            )}
                            {!editingName && (
                                <button className="name-edit-btn" onClick={() => { setNameInput(playerName); setEditingName(true); }} title={t('editName')}>
                                    ✏️
                                </button>
                            )}
                        </div>
                        {gameState.status !== 'waiting' && opponentRole && (
                            <>
                                <span className="vs-text">VS</span>
                                <div className="player-tag">
                                    <span className={opponentRole === 'X' ? 'icon-x' : 'icon-o'} style={{ fontWeight: 'bold' }}>
                                        {opponentRole}
                                    </span>
                                    {playersStats && playersStats[opponentRole as 'X' | 'O']?.avatar && (
                                        <span className="lb-avatar">{playersStats[opponentRole as 'X' | 'O'].avatar}</span>
                                    )}
                                    <span>{opponentName || t('opponent')}</span>
                                    {playersStats && playersStats[opponentRole as 'X' | 'O']?.gamesPlayed > 0 && (
                                        <span className="lb-stats" style={{ marginLeft: '0.2rem' }}>
                                            ({Math.round((playersStats[opponentRole as 'X' | 'O'].wins / playersStats[opponentRole as 'X' | 'O'].gamesPlayed) * 100)}%)
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    {editingName && (
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <input
                                className="name-input"
                                type="text"
                                value={nameInput}
                                onChange={e => setNameInput(e.target.value)}
                                placeholder={t('enterName')}
                                maxLength={20}
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && saveName()}
                            />
                            <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={saveName}>
                                ✓
                            </button>
                        </div>
                    )}
                    <div>{getStatusMessage()}</div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {gameState.status === 'playing' && (
                        <div className={`timer ${timerDanger ? 'timer-danger' : ''}`}>
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

            <div
                className="board glass"
                style={{
                    padding: '0.2rem',
                    opacity: gameState.status === 'waiting' ? 0.5 : 1,
                    pointerEvents: (gameState.status !== 'playing' || !isMyTurn) ? 'none' : 'auto'
                }}
            >
                {gameState.board.map((row: Player[], rowIndex: number) => (
                    row.map((cell: Player, colIndex: number) => {
                        const isLastMove = lastMove && lastMove[0] === rowIndex && lastMove[1] === colIndex;
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`cell ${isLastMove ? 'cell-last-move' : ''}`}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                            >
                                {cell === 'X' && <IconX className="cell-icon icon-x" />}
                                {cell === 'O' && <IconO className="cell-icon icon-o" />}
                            </div>
                        );
                    })
                ))}
            </div>
            {gameState.status === 'finished' && myPlayerRole && (
                <GameOverOverlay
                    isWinner={gameState.winner === myPlayerRole}
                    onPlayAgain={resetGame}
                    playerRole={gameState.winner || ''}
                />
            )}
        </div>
    );
}
