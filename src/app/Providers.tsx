'use client';
import React, { useState, useEffect } from 'react';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import SettingsToolbar from '../components/SettingsToolbar';
import NameOnboarding from '../components/NameOnboarding';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [needsName, setNeedsName] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const name = localStorage.getItem('caroPlayerName');
        setNeedsName(!name);
        setChecked(true);
    }, []);

    const handleNameComplete = () => {
        setNeedsName(false);
    };

    return (
        <ThemeProvider>
            <LanguageProvider>
                <SettingsToolbar />
                {checked && needsName ? (
                    <NameOnboarding onComplete={handleNameComplete} />
                ) : (
                    children
                )}
            </LanguageProvider>
        </ThemeProvider>
    );
}
