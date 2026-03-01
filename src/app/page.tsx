'use client';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');

  // Make sure we have a user ID stored
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let userId = localStorage.getItem('caroUserId');
      if (!userId) {
        localStorage.setItem('caroUserId', uuidv4());
      }
    }
  }, []);

  const createGame = () => {
    const newRoomId = uuidv4().slice(0, 8); // Short hash for aesthetics
    router.push(`/play/${newRoomId}`);
  };

  const joinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/play/${roomId.trim()}`);
    }
  };

  return (
    <main>
      <div className="glass" style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div className="header">
          <h1>Real-Time Caro</h1>
          <p>Five in a row wins. Play with a friend online!</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>

          <button
            className="btn-primary"
            style={{ padding: '1rem', fontSize: '1.2rem' }}
            onClick={createGame}
          >
            Create New Room
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--grid-line-color)' }}></div>
            <span style={{ opacity: 0.5 }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--grid-line-color)' }}></div>
          </div>

          <form onSubmit={joinGame} style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Enter Room ID"
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
              Join
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
