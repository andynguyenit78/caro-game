'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode, event?: React.MouseEvent) => void;
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
    const [mode, setModeState] = useState<ThemeMode>('system');
    const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    // Initialize from localStorage on client mount
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setModeState(getInitialMode());
        setSystemPreference(getSystemPref());
        setMounted(true);
    }, []);

    // Listen to system preference changes
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        (m: ThemeMode, e?: React.MouseEvent) => {
            setModeState(m);
            localStorage.setItem('caroTheme', m);

            if (typeof document !== 'undefined') {
                const isDark = m === 'dark' || (m === 'system' && systemPreference === 'dark');
                // The new background color that will fill the screen
                const flashColor = isDark ? '#1a1a2e' : '#f8f9fa';

                if (e) {
                    // --- Circular Reveal Animation ---
                    const x = e.clientX;
                    const y = e.clientY;

                    // Calculate distance to the furthest corner to ensure full coverage
                    const endRadius = Math.hypot(
                        Math.max(x, window.innerWidth - x),
                        Math.max(y, window.innerHeight - y)
                    );

                    const circle = document.createElement('div');
                    circle.style.position = 'fixed';
                    circle.style.top = `${y}px`;
                    circle.style.left = `${x}px`;
                    circle.style.width = '0px';
                    circle.style.height = '0px';
                    circle.style.borderRadius = '50%';
                    circle.style.pointerEvents = 'none';
                    circle.style.backgroundColor = flashColor;
                    circle.style.zIndex = '9999';
                    circle.style.transform = 'translate(-50%, -50%) scale(0)';
                    // Use the elastic spring curve for the expanding circle
                    circle.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';

                    document.body.appendChild(circle);

                    // Trigger the animation on the next frame
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            circle.style.transform = `translate(-50%, -50%) scale(${endRadius * 2})`;
                        });
                    });

                    // Remove the DOM node after it covers the screen
                    setTimeout(() => circle.remove(), 600);
                } else {
                    // Fallback to simple fade if no event provided
                    const overlay = document.createElement('div');
                    overlay.style.background = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
                    overlay.className = 'theme-flash-overlay';
                    document.body.appendChild(overlay);
                    setTimeout(() => overlay.remove(), 400);
                }
            }
        },
        [systemPreference]
    );

    return (
        <ThemeContext.Provider value={{ mode, setMode, resolvedTheme }}>
            <div style={{ display: mounted ? 'block' : 'none' }}>{children}</div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
    return ctx;
}
