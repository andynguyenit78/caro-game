'use client';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface GameOverOverlayProps {
    isWinner: boolean;
    onPlayAgain: () => void;
    playerRole: string;
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
    playerRole,
}: GameOverOverlayProps) {
    const [visible, setVisible] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

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
                <button className="btn-primary game-over-btn" onClick={onPlayAgain}>
                    {t('playAgain')}
                </button>
            </div>
        </div>
    );
}
