'use client';
import { useState, useCallback } from 'react';

export const TIMER_OPTIONS = [15, 30, 60, 90] as const;
export type TimerOption = (typeof TIMER_OPTIONS)[number];
export const DEFAULT_TIMER_SECONDS: TimerOption = 30;

function getInitialSoundEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('caroSoundEnabled');
    return stored === null ? true : stored === 'true';
}

function getInitialTimerSeconds(): TimerOption {
    if (typeof window === 'undefined') return DEFAULT_TIMER_SECONDS;
    const stored = parseInt(localStorage.getItem('caroTimerSeconds') || '30', 10);
    return (TIMER_OPTIONS as readonly number[]).includes(stored)
        ? (stored as TimerOption)
        : DEFAULT_TIMER_SECONDS;
}

export function usePlayerSettings() {
    const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => getInitialSoundEnabled());
    const [timerSeconds, setTimerSecondsState] = useState<TimerOption>(() =>
        getInitialTimerSeconds()
    );

    const setSoundEnabled = useCallback((enabled: boolean) => {
        setSoundEnabledState(enabled);
        localStorage.setItem('caroSoundEnabled', String(enabled));
    }, []);

    const setTimerSeconds = useCallback((seconds: TimerOption) => {
        setTimerSecondsState(seconds);
        localStorage.setItem('caroTimerSeconds', String(seconds));
    }, []);

    return {
        soundEnabled,
        timerSeconds,
        setSoundEnabled,
        setTimerSeconds,
    };
}
