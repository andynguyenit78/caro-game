'use client';
import React from 'react';
import { PlayerStats } from '../lib/playerStats';
import { getRankIcon, getRankTitle } from '../lib/rankSystem';
import { useLanguage } from '../context/LanguageContext';

interface PlayerTagProps {
    /** Player role identifier ('X' or 'O') */
    role: string;
    /** Display name of the player */
    displayName: string;
    /** Player stats for avatar, rank, and win-rate display */
    stats?: PlayerStats | null;
    /** Whether to show the edit-name button */
    isEditable?: boolean;
    /** Callback when the edit button is clicked */
    onEditClick?: () => void;
}

/**
 * Reusable player identity badge — shows role icon, avatar, rank, name, and score.
 * Used by both the multiplayer Board and the AI Board.
 */
export default function PlayerTag({
    role,
    displayName,
    stats,
    isEditable = false,
    onEditClick,
}: PlayerTagProps) {
    const { language } = useLanguage();
    const roleColorClass = role === 'X' ? 'icon-x' : 'icon-o';
    const score = stats?.score ?? 0;
    const rankIcon = getRankIcon(score);
    const rankTitle = getRankTitle(score, language);

    return (
        <div className="player-tag">
            <span className={roleColorClass} style={{ fontWeight: 'bold' }}>
                {role || '?'}
            </span>

            {stats?.avatar && <span className="lb-avatar">{stats.avatar}</span>}

            <span>{displayName}</span>

            {stats && (
                <span className="rank-badge" title={`${rankTitle} — ${score} pts`}>
                    {rankIcon}
                    <span className="rank-level">{rankTitle}</span>
                </span>
            )}

            {isEditable && onEditClick && (
                <button className="name-edit-btn" onClick={onEditClick} title="Edit name">
                    ✏️
                </button>
            )}
        </div>
    );
}
