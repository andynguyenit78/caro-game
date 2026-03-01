'use client';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let userId = localStorage.getItem('caroUserId');
      if (!userId) {
        localStorage.setItem('caroUserId', uuidv4());
      }
    }
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

  return (
    <main>
      <div className="glass" style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div className="header">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>

          {/* Mode Buttons */}
          <div className="mode-buttons">
            <button
              className="btn-primary mode-btn"
              onClick={createGame}
            >
              <span className="mode-icon">👥</span>
              <span className="mode-label">{t('playFriend')}</span>
            </button>
            <button
              className="btn-ai mode-btn"
              onClick={playAI}
            >
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
      </div>
    </main>
  );
}
