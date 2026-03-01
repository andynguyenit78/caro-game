'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsToolbar() {
    const { language, setLanguage, t } = useLanguage();
    const { mode, setMode } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="app-header" style={{ visibility: mounted ? 'visible' : 'hidden' }}>
            {/* Left side: Back Button + Logo & Title */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    pointerEvents: 'auto',
                }}
            >
                <div
                    className="app-brand"
                    onClick={() => router.push('/')}
                    title={t('backHome')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="app-logo">⚔️</div>
                    <div className="app-title-group">
                        <h1 className="app-title">Caro Game</h1>
                        <span className="app-version">v0.1.0</span>
                    </div>
                </div>
            </div>

            {/* Right side: Settings */}
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
                    <div
                        className="toggle-pills"
                        style={
                            {
                                '--num-pills': 2,
                                '--active-idx': language === 'en' ? 0 : 1,
                            } as React.CSSProperties
                        }
                    >
                        <div className="slider-bg" />
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
                    <div
                        className="toggle-pills"
                        style={
                            {
                                '--num-pills': 3,
                                '--active-idx': mode === 'light' ? 0 : mode === 'system' ? 1 : 2,
                            } as React.CSSProperties
                        }
                    >
                        <div className="slider-bg" />
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
        </header>
    );
}
