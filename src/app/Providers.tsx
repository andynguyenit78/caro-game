'use client';
import React from 'react';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import SettingsToolbar from '../components/SettingsToolbar';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <SettingsToolbar />
                {children}
            </LanguageProvider>
        </ThemeProvider>
    );
}
