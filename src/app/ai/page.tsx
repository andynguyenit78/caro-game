import AIBoard from './AIBoard';

export const metadata = {
    title: 'Caro vs AI',
    description: 'Play Caro (Gomoku) against an AI opponent!',
};

export default function AIPage() {
    return (
        <main style={{ justifyContent: 'flex-start', paddingTop: '5rem' }}>
            <h1 className="header" style={{ marginBottom: '0.5rem' }}>🤖 Caro vs AI</h1>
            <AIBoard />
        </main>
    );
}
