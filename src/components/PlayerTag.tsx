'use client';
import React from 'react';
import { PlayerStats } from '../lib/playerStats';

interface PlayerTagProps {
    /** Player role identifier ('X' or 'O') */
    role: string;
    /** Display name of the player */
    displayName: string;
    /** Player stats for avatar and win-rate display */
    stats?: PlayerStats | null;
    /** Whether to show the edit-name button */
    isEditable?: boolean;
    /** Callback when the edit button is clicked */
    onEditClick?: () => void;
}

/**
 * Reusable player identity badge — shows role icon, avatar, name, and win-rate.
 * Used by both the multiplayer Board and the AI Board.
 */
export default function PlayerTag({
    role,
    displayName,
    stats,
    isEditable = false,
    onEditClick,
}: PlayerTagProps) {
    const roleColorClass = role === 'X' ? 'icon-x' : 'icon-o';
    const winRate =
        stats && stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : null;

    return (
        <div className="player-tag">
            <span className={roleColorClass} style={{ fontWeight: 'bold' }}>
                {role || '?'}
            </span>

            {stats?.avatar && <span className="lb-avatar">{stats.avatar}</span>}

            <span>{displayName}</span>

            {winRate !== null && (
                <span className="lb-stats" style={{ marginLeft: '0.2rem' }}>
                    ({winRate}%)
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
