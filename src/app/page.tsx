'use client';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { subscribeToStats, fetchLeaderboard, PlayerStats, LeaderboardEntry } from '../lib/playerStats';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let userId = localStorage.getItem('caroUserId');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('caroUserId', userId);
    }

    // Subscribe to own stats
    const unsub = subscribeToStats(userId, setStats);

    // Fetch leaderboard
    fetchLeaderboard(10).then(setLeaderboard);

    return () => unsub();
  }, []);

  const createGame = () => {
    const newRoomId = uuidv4().slice(0, 8);
    router.push(`/play/${newRoomId}`);
  };

  const joinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/play/${roomId.trim()}`);
    }
  };

  const playAI = () => {
    router.push('/ai');
  };

  const winRate = stats && stats.gamesPlayed > 0
    ? Math.round((stats.wins / stats.gamesPlayed) * 100)
    : 0;

  const myUserId = typeof window !== 'undefined' ? localStorage.getItem('caroUserId') : null;

  return (
    <main>
      <div className="glass" style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div className="header">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </div>

        {/* Stats Badge */}
        {stats && stats.gamesPlayed > 0 && (
          <div className="stats-badge">
            <div className="stat-item">
              <span className="stat-value">{stats.wins}</span>
              <span className="stat-label">{t('wins')}</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">{stats.losses}</span>
              <span className="stat-label">{t('losses')}</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">{winRate}%</span>
              <span className="stat-label">{t('winRate')}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>

          {/* Mode Buttons */}
          <div className="mode-buttons">
            <button className="btn-primary mode-btn" onClick={createGame}>
              <span className="mode-icon">👥</span>
              <span className="mode-label">{t('playFriend')}</span>
            </button>
            <button className="btn-ai mode-btn" onClick={playAI}>
              <span className="mode-icon">🤖</span>
              <span className="mode-label">{t('playVsAI')}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--grid-line-color)' }}></div>
            <span style={{ opacity: 0.5 }}>{t('or')}</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--grid-line-color)' }}></div>
          </div>

          <form onSubmit={joinGame} style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              placeholder={t('enterRoomId')}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{
                flex: 1,
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--grid-line-color)',
                outline: 'none',
                background: 'var(--background)',
                color: 'var(--text-color)',
              }}
            />
            <button type="submit" className="btn-primary" disabled={!roomId.trim()}>
              {t('join')}
            </button>
          </form>
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="leaderboard">
            <h3 className="leaderboard-title">🏆 {t('leaderboard')}</h3>
            <div className="leaderboard-list">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  className={`leaderboard-row ${entry.userId === myUserId ? 'leaderboard-row-me' : ''}`}
                >
                  <span className="lb-rank">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <span className="lb-name">{entry.name}</span>
                  <span className="lb-stats">
                    {entry.wins}W {entry.losses}L
                  </span>
                  <span className="lb-winrate">{entry.winRate}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
