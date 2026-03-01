'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAIGameState } from '../../hooks/useAIGameState';
import { IconX, IconO } from '../../components/Icons';
import GameOverOverlay from '../../components/GameOverOverlay';
import { useLanguage } from '../../context/LanguageContext';
import { Player } from '../../lib/gameLogic';
import { playMoveSound, playVictorySound, playDefeatSound } from '../../lib/sounds';

export default function AIBoard() {
    const { gameState, makeMove, resetGame } = useAIGameState();
    const { t } = useLanguage();
    const [playerName, setPlayerName] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const prevBoardRef = useRef<string>('');
    const prevWinnerRef = useRef<string>('');

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

    // Sound on win/lose
    useEffect(() => {
        if (gameState.winner && gameState.winner !== prevWinnerRef.current) {
            if (gameState.winner === 'X') {
                playVictorySound();
            } else {
                playDefeatSound();
            }
        }
        prevWinnerRef.current = gameState.winner;
    }, [gameState.winner]);

    const saveName = useCallback(() => {
        const trimmed = nameInput.trim();
        setPlayerName(trimmed);
        localStorage.setItem('caroPlayerName', trimmed);
        setEditingName(false);
    }, [nameInput]);

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
                <div className="status-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span>{t('role')}:</span>
                        <span className="icon-x" style={{ fontWeight: 'bold' }}>X</span>
                        {playerName && <span style={{ opacity: 0.6, fontSize: '0.85rem' }}>({playerName})</span>}
                        {!editingName && (
                            <button className="name-edit-btn" onClick={() => { setNameInput(playerName); setEditingName(true); }} title={t('editName')}>
                                ✏️
                            </button>
                        )}
                        <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>vs 🤖 AI</span>
                    </div>
                    {editingName && (
                        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem' }}>
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

                <button className="btn-primary" onClick={resetGame}>
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
                    onPlayAgain={resetGame}
                    playerRole={gameState.winner || ''}
                />
            )}
        </div>
    );
}
