'use client';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface GameOverOverlayProps {
    isWinner: boolean;
    onPlayAgain: () => void;
    onQuit?: () => void;
    playerRole: string;
    hasWaiting?: boolean;
}

function ConfettiParticle({ index }: { index: number }) {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6fb7', '#c084fc', '#22d3ee'];
    const color = colors[index % colors.length];
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    const size = Math.random() * 8 + 4;
    const duration = Math.random() * 2 + 3;

    return (
        <div
            className="confetti-particle"
            style={{
                left: `${left}%`,
                width: `${size}px`,
                height: `${size * 1.5}px`,
                backgroundColor: color,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
            }}
        />
    );
}

export default function GameOverOverlay({
    isWinner,
    onPlayAgain,
    onQuit,
    playerRole,
    hasWaiting,
}: GameOverOverlayProps) {
    const [visible, setVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);
    const { t } = useLanguage();

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // Auto-quit countdown timer
    useEffect(() => {
        if (timeLeft <= 0) {
            onQuit?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onQuit]);

    return (
        <div
            className={`game-over-overlay ${visible ? 'visible' : ''} ${isWinner ? 'win' : 'lose'}`}
        >
            {isWinner && (
                <div className="confetti-container">
                    {Array.from({ length: 60 }).map((_, i) => (
                        <ConfettiParticle key={i} index={i} />
                    ))}
                </div>
            )}

            <div className={`game-over-card glass ${isWinner ? 'win-card' : 'lose-card'}`}>
                <div className="game-over-emoji">{isWinner ? '🏆' : '😢'}</div>
                <h2 className="game-over-title">{isWinner ? t('victory') : t('defeat')}</h2>
                <p className="game-over-subtitle">
                    {isWinner ? t('congratsWin', { player: playerRole }) : t('betterLuck')}
                </p>
                <p
                    style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem',
                    }}
                >
                    Returning to home in {timeLeft}s...
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                        className="btn-primary game-over-btn"
                        onClick={onPlayAgain}
                        disabled={hasWaiting}
                    >
                        {hasWaiting ? 'Waiting for opponent...' : t('playAgain')}
                    </button>
                    {onQuit && (
                        <button
                            className="btn-secondary game-over-btn"
                            style={{ background: 'var(--surface-color)' }}
                            onClick={onQuit}
                        >
                            {t('backHome') || 'Quit'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
