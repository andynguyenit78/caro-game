'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getInitialMode(): ThemeMode {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('caroTheme') as ThemeMode) || 'system';
}

function getSystemPref(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    /**
     * Lazy initializer: on the client, read localStorage immediately so the
     * mode is correct on the very first render — no extra re-render needed.
     * On the server, fall back to 'system' (hydration mismatch is suppressed
     * with suppressHydrationWarning on the affected header element).
     */
    const [mode, setModeState] = useState<ThemeMode>(() => getInitialMode());
    const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(() =>
        getSystemPref()
    );

    // Listen to system preference changes
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemPreference(mq.matches ? 'dark' : 'light');

        const handler = (e: MediaQueryListEvent) => {
            setSystemPreference(e.matches ? 'dark' : 'light');
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const resolvedTheme = mode === 'system' ? systemPreference : mode;

    // Apply data-theme attribute to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
    }, [resolvedTheme]);

    const setMode = useCallback(
        (m: ThemeMode) => {
            setModeState(m);
            localStorage.setItem('caroTheme', m);

            // Brief flash overlay for a polished theme-switch transition
            if (typeof document !== 'undefined') {
                const overlay = document.createElement('div');
                const flashColor =
                    m === 'dark' || (m === 'system' && systemPreference === 'dark')
                        ? 'rgba(0,0,0,0.6)'
                        : 'rgba(255,255,255,0.6)';
                overlay.style.background = flashColor;
                overlay.className = 'theme-flash-overlay';
                document.body.appendChild(overlay);
                setTimeout(() => overlay.remove(), 400);
            }
        },
        [systemPreference]
    );

    return (
        <ThemeContext.Provider value={{ mode, setMode, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
    return ctx;
}
