'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAIGameState } from '../../hooks/useAIGameState';
import { IconX, IconO } from '../../components/Icons';
import GameOverOverlay from '../../components/GameOverOverlay';
import { useLanguage } from '../../context/LanguageContext';
import { Player } from '../../lib/gameLogic';
import { playMoveSound, playVictorySound, playDefeatSound } from '../../lib/sounds';
import { updatePlayerName, recordAIGameResult } from '../../lib/playerStats';

export default function AIBoard() {
    const { gameState, playerStats, makeMove, resetGame } = useAIGameState();
    const { t } = useLanguage();
    const [playerName, setPlayerName] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const prevBoardRef = useRef<string>('');
    const prevWinnerRef = useRef<string>('');
    const hasRecordedResult = useRef(false);

    // Load player name
    useEffect(() => {
        setPlayerName(localStorage.getItem('caroPlayerName') || '');
    }, []);

    // Sound on move
    useEffect(() => {
        const boardStr = JSON.stringify(gameState.board);
        if (prevBoardRef.current && prevBoardRef.current !== boardStr) {
            playMoveSound();
        }
        prevBoardRef.current = boardStr;
    }, [gameState.board]);

    // Sound on win/lose + record stats
    useEffect(() => {
        if (gameState.winner && gameState.winner !== prevWinnerRef.current) {
            if (gameState.winner === 'X') {
                playVictorySound();
            } else {
                playDefeatSound();
            }

            // Record AI game result
            if (!hasRecordedResult.current) {
                hasRecordedResult.current = true;
                const userId = localStorage.getItem('caroUserId');
                if (userId) {
                    recordAIGameResult(userId, gameState.winner === 'X');
                }
            }
        }
        prevWinnerRef.current = gameState.winner;
    }, [gameState.winner]);

    const saveName = useCallback(() => {
        const trimmed = nameInput.trim();
        setPlayerName(trimmed);
        localStorage.setItem('caroPlayerName', trimmed);
        setEditingName(false);
        // Sync to Firebase
        const userId = localStorage.getItem('caroUserId');
        if (userId) updatePlayerName(userId, trimmed);
    }, [nameInput]);

    const handleReset = useCallback(() => {
        hasRecordedResult.current = false;
        resetGame();
    }, [resetGame]);

    const handleCellClick = (row: number, col: number) => {
        makeMove(row, col);
    };

    const getStatusMessage = () => {
        if (gameState.winner === 'X') return t('youWon');
        if (gameState.winner === 'O') return t('youLost');
        if (gameState.aiThinking) return t('aiThinking');
        return t('yourTurn');
    };

    return (
        <div className="board-container">

            <div className="dashboard glass">
                <div className="status-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem' }}>
                    <div className="players-row">                        <div className="player-tag">
                        <span className="icon-x" style={{ fontWeight: 'bold' }}>X</span>
                        {playerStats && playerStats.avatar && (
                            <span className="lb-avatar">{playerStats.avatar}</span>
                        )}
                        <span>{playerName || t('you')}</span>
                        {playerStats && playerStats.gamesPlayed > 0 && (
                            <span className="lb-stats" style={{ marginLeft: '0.2rem' }}>
                                ({Math.round((playerStats.wins / playerStats.gamesPlayed) * 100)}%)
                            </span>
                        )}
                        {!editingName && (
                            <button className="name-edit-btn" onClick={() => { setNameInput(playerName); setEditingName(true); }} title={t('editName')}>
                                ✏️
                            </button>
                        )}
                    </div>
                        <span className="vs-text">VS</span>
                        <div className="player-tag">
                            <span className="icon-o" style={{ fontWeight: 'bold' }}>O</span>
                            <span className="lb-avatar">🤖</span>
                            <span>AI</span>
                            <span className="lb-stats" style={{ marginLeft: '0.2rem' }}>(99%)</span>
                        </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getStatusMessage()}
                        {gameState.aiThinking && <span className="ai-thinking-dot" />}
                    </div>
                </div>

                <button className="btn-primary" onClick={handleReset}>
                    {t('newGame')}
                </button>
            </div>

            <div
                className="board glass"
                style={{
                    padding: '0.2rem',
                    pointerEvents: (gameState.status !== 'playing' || gameState.aiThinking) ? 'none' : 'auto'
                }}
            >
                {gameState.board.map((row: Player[], rowIndex: number) => (
                    row.map((cell: Player, colIndex: number) => {
                        const isLastMove = gameState.lastMove && gameState.lastMove[0] === rowIndex && gameState.lastMove[1] === colIndex;
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
