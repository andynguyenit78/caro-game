'use client';
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsToolbar() {
    const { language, setLanguage, t } = useLanguage();
    const { mode, setMode } = useTheme();

    return (
        <div className="settings-toolbar">
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
