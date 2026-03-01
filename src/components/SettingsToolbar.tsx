'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsToolbar() {
    const { language, setLanguage, t } = useLanguage();
    const { mode, setMode } = useTheme();
    const router = useRouter();

    return (
        <div className="settings-toolbar">
            {/* Profile Button */}
            <button
                className="pill profile-pill"
                onClick={() => router.push('/profile')}
                title={t('profile')}
            >
                👤
            </button>

            {/* Language Toggle */}
            <div className="settings-group">
                <div className="toggle-pills">
                    <button
                        className={`pill ${language === 'en' ? 'active' : ''}`}
                        onClick={() => setLanguage('en')}
                        title="English"
                    >
                        🇬🇧 EN
                    </button>
                    <button
                        className={`pill ${language === 'vi' ? 'active' : ''}`}
                        onClick={() => setLanguage('vi')}
                        title="Tiếng Việt"
                    >
                        🇻🇳 VI
                    </button>
                </div>
            </div>

            {/* Theme Toggle */}
            <div className="settings-group">
                <div className="toggle-pills">
                    <button
                        className={`pill ${mode === 'light' ? 'active' : ''}`}
                        onClick={() => setMode('light')}
                        title={t('light')}
                    >
                        ☀️
                    </button>
                    <button
                        className={`pill ${mode === 'system' ? 'active' : ''}`}
                        onClick={() => setMode('system')}
                        title={t('system')}
                    >
                        💻
                    </button>
                    <button
                        className={`pill ${mode === 'dark' ? 'active' : ''}`}
                        onClick={() => setMode('dark')}
                        title={t('dark')}
                    >
                        🌙
                    </button>
                </div>
            </div>
        </div>
    );
}
