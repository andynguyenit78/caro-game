'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import {
    subscribeToStats,
    updatePlayerName,
    updatePlayerAvatar,
    PlayerStats,
} from '../../lib/playerStats';

const AVATAR_OPTIONS = [
    '😀', '😎', '🤓', '🧑‍💻', '👨‍🚀', '🥷',
    '🦊', '🐱', '🐶', '🐼', '🦁', '🐸',
    '🎯', '⚡', '🔥', '💎', '🌟', '🎮',
    '🏆', '👑', '🦄', '🐉', '🤖', '👻',
];

export default function ProfilePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [nameInput, setNameInput] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const uid = localStorage.getItem('caroUserId') || '';
        setUserId(uid);
        setNameInput(localStorage.getItem('caroPlayerName') || '');
        setSelectedAvatar(localStorage.getItem('caroPlayerAvatar') || '');

        if (uid) {
            const unsub = subscribeToStats(uid, (s) => {
                setStats(s);
                if (s.name && !nameInput) setNameInput(s.name);
                if (s.avatar && !selectedAvatar) setSelectedAvatar(s.avatar);
            });
            return () => unsub();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = async () => {
        if (!userId || !nameInput.trim()) return;
        setSaving(true);

        localStorage.setItem('caroPlayerName', nameInput.trim());
        localStorage.setItem('caroPlayerAvatar', selectedAvatar);

        await updatePlayerName(userId, nameInput.trim());
        if (selectedAvatar) await updatePlayerAvatar(userId, selectedAvatar);

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const winRate = stats && stats.gamesPlayed > 0
        ? Math.round((stats.wins / stats.gamesPlayed) * 100)
        : 0;

    return (
        <main>
            <div className="glass profile-card">
                <button
                    className="profile-back-btn"
                    onClick={() => router.push('/')}
                    title={t('backHome')}
                >
                    ← {t('backHome')}
                </button>

                <h2>{t('profile')}</h2>

                {/* Avatar Display */}
                <div className="profile-avatar-display">
                    {selectedAvatar || '👤'}
                </div>

                {/* Avatar Picker */}
                <div className="avatar-picker">
                    <label className="profile-label">{t('chooseAvatar')}</label>
                    <div className="avatar-grid">
                        {AVATAR_OPTIONS.map(emoji => (
                            <button
                                key={emoji}
                                className={`avatar-option ${selectedAvatar === emoji ? 'avatar-selected' : ''}`}
                                onClick={() => setSelectedAvatar(emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name Input */}
                <div className="profile-field">
                    <label className="profile-label">{t('displayName')}</label>
                    <input
                        type="text"
                        className="profile-input"
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        placeholder={t('enterName')}
                        maxLength={20}
                    />
                </div>

                {/* Stats */}
                {stats && stats.gamesPlayed > 0 && (
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">{stats.gamesPlayed}</span>
                            <span className="stat-label">{t('gamesPlayed')}</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">{stats.wins}</span>
                            <span className="stat-label">{t('wins')}</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">{stats.losses}</span>
                            <span className="stat-label">{t('losses')}</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">{winRate}%</span>
                            <span className="stat-label">{t('winRate')}</span>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <button
                    className="btn-primary profile-save-btn"
                    onClick={handleSave}
                    disabled={saving || !nameInput.trim()}
                >
                    {saving ? '...' : saved ? '✓ ' + t('saved') : t('saveProfile')}
                </button>
            </div>
        </main>
    );
}
