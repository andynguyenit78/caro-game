'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsToolbar() {
    const { language, setLanguage, t } = useLanguage();
    const { mode, setMode } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isHome = pathname === '/';

    return (
        <header className="app-header" style={{ visibility: mounted ? 'visible' : 'hidden' }}>
            {/* Left side: Empty for balance */}
            <div style={{ flex: 1 }}></div>

            {/* Center: Logo & Title */}
            <div
                className="app-brand"
                onClick={() => router.push('/')}
                title={t('backHome')}
                style={{ cursor: 'pointer', flex: 1, display: 'flex', justifyContent: 'center' }}
            >
                <div className="app-logo">⚔️</div>
                <div className="app-title-group">
                    <h1 className="app-title">Caro Game</h1>
                    <span className="app-version">v0.1.0</span>
                </div>
            </div>

            {/* Right side: Settings */}
            <div className="settings-toolbar" style={{ flex: 1, justifyContent: 'flex-end' }}>
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
        </header>
    );
}
