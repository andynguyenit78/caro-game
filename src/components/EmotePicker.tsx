import React, { useState, useRef, useEffect } from 'react';

const EMOTES = ['🤣', '😠', '😭', '🤯', '👏', '💖'];

interface Props {
    onSelect: (emote: string) => void;
    disabled?: boolean;
}

export default function EmotePicker({ onSelect, disabled }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (emote: string) => {
        onSelect(emote);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
            {isOpen && (
                <div
                    className="emote-menu glass"
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        right: 0,
                        marginBottom: '0.5rem',
                        display: 'flex',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        borderRadius: '20px',
                        animation: 'popIn 0.2s cubic-bezier(0.1, 0.9, 0.2, 1)',
                        zIndex: 100,
                    }}
                >
                    {EMOTES.map((emote) => (
                        <button
                            key={emote}
                            className="emote-btn"
                            onClick={() => handleSelect(emote)}
                        >
                            {emote}
                        </button>
                    ))}
                </div>
            )}
            <button
                className="btn-secondary"
                style={{
                    padding: '0.5rem',
                    fontSize: '1.2rem',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                title="Send Emote"
            >
                💬
            </button>
        </div>
    );
}
