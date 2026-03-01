import AIBoard from './AIBoard';

export const metadata = {
    title: 'Caro vs AI',
    description: 'Play Caro (Gomoku) against an AI opponent!',
};

export default function AIPage() {
    return (
        <main>
            <h1 className="header" style={{ marginBottom: '0.5rem' }}>
                🤖 <span>Caro vs AI</span>
            </h1>
            <AIBoard />
        </main>
    );
}
