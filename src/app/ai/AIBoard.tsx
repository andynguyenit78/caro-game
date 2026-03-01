'use client';
import React from 'react';
import { useAIGameState } from '../../hooks/useAIGameState';
import { IconX, IconO } from '../../components/Icons';
import GameOverOverlay from '../../components/GameOverOverlay';
import { useLanguage } from '../../context/LanguageContext';
import { Player } from '../../lib/gameLogic';

export default function AIBoard() {
    const { gameState, makeMove, resetGame } = useAIGameState();
    const { t } = useLanguage();

    const handleCellClick = (row: number, col: number) => {
        makeMove(row, col);
    };

    const getStatusMessage = () => {
        if (gameState.winner === 'X') return t('youWon');
        if (gameState.winner === 'O') return t('youLost');
        return gameState.currentTurn === 'X' ? t('yourTurn') : t('aiThinking');
    };

    return (
        <div className="board-container">
            <div className="dashboard glass">
                <div className="status-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{t('role')}:</span>
                        <span className="icon-x" style={{ fontWeight: 'bold' }}>X</span>
                        <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>vs 🤖 AI</span>
                    </div>
                    <div>{getStatusMessage()}</div>
                </div>

                <button className="btn-primary" onClick={resetGame}>
                    {t('newGame')}
                </button>
            </div>

            <div
                className="board glass"
                style={{
                    padding: '0.2rem',
                    pointerEvents: (gameState.status !== 'playing' || gameState.currentTurn !== 'X') ? 'none' : 'auto'
                }}
            >
                {gameState.board.map((row: Player[], rowIndex: number) => (
                    row.map((cell: Player, colIndex: number) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className="cell"
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                            {cell === 'X' && <IconX className="cell-icon icon-x" />}
                            {cell === 'O' && <IconO className="cell-icon icon-o" />}
                        </div>
                    ))
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
