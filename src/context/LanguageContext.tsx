'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations, TranslationKey } from '../lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const stored = localStorage.getItem('caroLanguage') as Language | null;
        if (stored && (stored === 'en' || stored === 'vi')) {
            setLanguageState(stored);
        }
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('caroLanguage', lang);
    }, []);

    const t = useCallback((key: TranslationKey, vars?: Record<string, string>): string => {
        let text: string = translations[language][key] || translations.en[key] || key;
        if (vars) {
            Object.entries(vars).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, v);
            });
        }
        return text;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
    return ctx;
}
