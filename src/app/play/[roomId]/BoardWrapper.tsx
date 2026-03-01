'use client';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Board from '../../../components/Board';

export default function BoardWrapper({ roomId }: { roomId: string }) {
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        let storedId = localStorage.getItem('caroUserId');
        if (!storedId) {
            storedId = uuidv4();
            localStorage.setItem('caroUserId', storedId);
        }
        setUserId(storedId);
    }, []);

    if (!userId) {
        return <div className="glass" style={{ padding: '2rem' }}>Initializing Player...</div>;
    }

    return <Board roomId={roomId} userId={userId} />;
}
