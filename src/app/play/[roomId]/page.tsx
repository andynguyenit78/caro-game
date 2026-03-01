import BoardWrapper from './BoardWrapper';

// In Next.js 15, params in dynamic routes is a Promise
export default async function PlayRoom({ params }: { params: Promise<{ roomId: string }> }) {
    const resolvedParams = await params;
    const roomId = resolvedParams.roomId;

    return (
        <main style={{ justifyContent: 'flex-start', paddingTop: '5rem' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="header">
                    <h1>Real-Time Caro</h1>
                    <p>Room: {roomId}</p>
                </div>

                <BoardWrapper key={roomId} roomId={roomId} />
            </div>
        </main>
    );
}
