'use client';
import React, { useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { IconX, IconO } from './Icons';
import GameOverOverlay from './GameOverOverlay';
import { useLanguage } from '../context/LanguageContext';

export default function Board({ roomId, userId }: { roomId: string, userId: string }) {
    const { gameState, myPlayerRole, makeMove, joinGame, resetGame, isMyTurn } = useGameState(roomId, userId);
    const { t } = useLanguage();

    // Auto-join the game if it is waiting and we are visiting the room
    useEffect(() => {
        if (gameState && gameState.status === 'waiting' && myPlayerRole === '') {
            joinGame();
        }
    }, [gameState, myPlayerRole, joinGame]);

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

    return (
        <div className="board-container">
            <div className="dashboard glass">
                <div className="status-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{t('role')}:</span>
                        {myPlayerRole ? (
                            <span className={myPlayerRole === 'X' ? 'icon-x' : 'icon-o'} style={{ fontWeight: 'bold' }}>
                                {myPlayerRole}
                            </span>
                        ) : t('spectator')}
                    </div>
                    <div>{getStatusMessage()}</div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
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
                {gameState.board.map((row: import('../lib/gameLogic').Player[], rowIndex: number) => (
                    row.map((cell: import('../lib/gameLogic').Player, colIndex: number) => (
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
