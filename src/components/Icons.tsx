import React from 'react';

export const IconX = ({ className = '' }: { className?: string }) => (
    <svg
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path
            d="M20 20 L80 80 M80 20 L20 80"
            style={{ strokeDasharray: 120, strokeDashoffset: 0, animation: 'draw 0.3s ease-out forwards' }}
        />
    </svg>
);

export const IconO = ({ className = '' }: { className?: string }) => (
    <svg
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="16"
    >
        <circle
            cx="50"
            cy="50"
            r="34"
            style={{ strokeDasharray: 215, strokeDashoffset: 0, animation: 'drawCircle 0.4s ease-out forwards' }}
        />
    </svg>
);
