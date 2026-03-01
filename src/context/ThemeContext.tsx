'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>('system');
    const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light');

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

    // Load saved mode
    useEffect(() => {
        const stored = localStorage.getItem('caroTheme') as ThemeMode | null;
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
            setModeState(stored);
        }
    }, []);

    const resolvedTheme = mode === 'system' ? systemPreference : mode;

    // Apply data-theme attribute to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
    }, [resolvedTheme]);

    const setMode = useCallback((m: ThemeMode) => {
        setModeState(m);
        localStorage.setItem('caroTheme', m);
    }, []);

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
