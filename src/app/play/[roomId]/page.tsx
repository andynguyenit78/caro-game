import BoardWrapper from './BoardWrapper';

// In Next.js 15, params in dynamic routes is a Promise
export default async function PlayRoom({ params }: { params: Promise<{ roomId: string }> }) {
    const resolvedParams = await params;
    const roomId = resolvedParams.roomId;

    return (
        <main>
            <div>
                <div className="header board-page-header">
                    <h1>Real-Time Caro</h1>
                    <p>Room: {roomId}</p>
                </div>

                <BoardWrapper key={roomId} roomId={roomId} />
            </div>
        </main>
    );
}
