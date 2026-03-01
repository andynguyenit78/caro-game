'use client';
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { v4 as uuidv4 } from 'uuid';
import { updatePlayerName, getOrCreateProfile } from '../lib/playerStats';

interface Props {
    onComplete: () => void;
}

export default function NameOnboarding({ onComplete }: Props) {
    const [name, setName] = useState('');
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;

        // Ensure user ID exists
        let userId = localStorage.getItem('caroUserId');
        if (!userId) {
            userId = uuidv4();
            localStorage.setItem('caroUserId', userId);
        }

        // Save name locally and to Firebase
        localStorage.setItem('caroPlayerName', trimmed);
        await getOrCreateProfile(userId);
        await updatePlayerName(userId, trimmed);

        onComplete();
    };

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-card glass">
                <div className="onboarding-emoji">🎮</div>
                <h2>{t('welcomeTitle')}</h2>
                <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>{t('welcomeSubtitle')}</p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={t('enterName')}
                        maxLength={20}
                        autoFocus
                        className="onboarding-input"
                    />
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={!name.trim()}
                        style={{ padding: '0.8rem', fontSize: '1rem' }}
                    >
                        {t('letsPlay')}
                    </button>
                </form>
            </div>
        </div>
    );
}
