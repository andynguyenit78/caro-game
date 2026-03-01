'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { updatePlayerName } from '../lib/playerStats';

interface InlineNameEditorProps {
    /** Firebase user ID — needed to sync the name to the backend */
    userId: string;
    /** Callback after save completes, passes the new trimmed name */
    onNameSaved: (newName: string) => void;
}

/**
 * Self-contained inline name editor with input, save button, and Firebase sync.
 * Manages its own editing state internally, exposing only the saved result.
 */
export default function InlineNameEditor({ userId, onNameSaved }: InlineNameEditorProps) {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [nameInput, setNameInput] = useState('');

    /** Pre-fill the input with the current localStorage name when editing starts */
    const startEditing = useCallback(() => {
        setNameInput(localStorage.getItem('caroPlayerName') || '');
        setIsEditing(true);
    }, []);

    /** Persist the name to localStorage + Firebase, then notify the parent */
    const saveName = useCallback(() => {
        const trimmed = nameInput.trim();
        if (!trimmed) return;

        localStorage.setItem('caroPlayerName', trimmed);
        updatePlayerName(userId, trimmed);
        setIsEditing(false);
        onNameSaved(trimmed);
    }, [nameInput, userId, onNameSaved]);

    if (!isEditing) {
        return (
            <button className="name-edit-btn" onClick={startEditing} title={t('editName')}>
                ✏️
            </button>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '0.3rem' }}>
            <input
                className="name-input"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={t('enterName')}
                maxLength={20}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
            />
            <button
                className="btn-primary"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                onClick={saveName}
            >
                ✓
            </button>
        </div>
    );
}
