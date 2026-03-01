'use client';
import React from 'react';
import { PlayerStats } from '../lib/playerStats';
import { getRankFromScore, getRankIcon } from '../lib/rankSystem';

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
    const roleColorClass = role === 'X' ? 'icon-x' : 'icon-o';
    const score = stats?.score ?? 0;
    const rank = getRankFromScore(score);
    const rankIcon = getRankIcon(score);

    return (
        <div className="player-tag">
            <span className={roleColorClass} style={{ fontWeight: 'bold' }}>
                {role || '?'}
            </span>

            {stats?.avatar && <span className="lb-avatar">{stats.avatar}</span>}

            <span>{displayName}</span>

            {stats && (
                <span className="rank-badge" title={`${rank.title} — ${score} pts`}>
                    {rankIcon}
                    <span className="rank-level">Lv.{rank.level}</span>
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
