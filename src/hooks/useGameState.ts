import { useEffect, useState, useCallback, useRef } from 'react';
import { Player, createEmptyBoard, checkWin } from '../lib/gameLogic';
import { PlayerStats, recordGameResult, updatePlayerName } from '../lib/playerStats';
import { GameState, subscribeToGame, subscribeToPlayer, setGameState, updateGameState } from '../lib/gameService';

const createDefaultState = (): GameState => ({
    board: createEmptyBoard(15),
    currentPlayer: 'X',
    winner: '',
    status: 'loading',
    players: {},
});

export function useGameState(roomId: string, userId: string) {
    const [gameState, setGameStateLocal] = useState<GameState>(createDefaultState);
    const [myPlayerRole, setMyPlayerRole] = useState<Player>('');
    const [opponentName, setOpponentName] = useState('');
    const hasInitialized = useRef(false);
    const hasRecordedResult = useRef(false);

    // Get local player name
    const getLocalName = () => {
        return typeof window !== 'undefined' ? localStorage.getItem('caroPlayerName') || '' : '';
    };

    useEffect(() => {
        if (!roomId || !userId) return;

        // Reset on roomId change
        hasInitialized.current = false;
        hasRecordedResult.current = false;
        setTimeout(() => {
            setMyPlayerRole('');
            setOpponentName('');
            setGameStateLocal(createDefaultState());
        }, 0);

        const unsubscribe = subscribeToGame(roomId, (data) => {
            if (data) {
                if (!data.board) {
                    data.board = createEmptyBoard(15);
                }
                setGameStateLocal(data as GameState);

                // Determine our role
                if (data.players?.X === userId) {
                    setMyPlayerRole('X');
                    // Fetch opponent O's name
                    if (data.players?.O) {
                        const oName = data.playerNames?.O || '';
                        setOpponentName(oName);
                    }
                } else if (data.players?.O === userId) {
                    setMyPlayerRole('O');
                    // Fetch opponent X's name
                    const xName = data.playerNames?.X || '';
                    setOpponentName(xName);
                } else {
                    setMyPlayerRole('');
                }
                hasInitialized.current = true;
            } else if (!hasInitialized.current) {
                hasInitialized.current = true;
                const localName = getLocalName();
                const newState: GameState = {
                    board: createEmptyBoard(15),
                    currentPlayer: 'X',
                    winner: '',
                    status: 'waiting',
                    players: { X: userId },
                    playerNames: { X: localName },
                };
                setGameState(roomId, newState).catch(console.error);
                // Also update profile name
                if (localName) updatePlayerName(userId, localName);
            }
        });

        return () => unsubscribe();
    }, [roomId, userId]);

    // Record game result when game finishes
    useEffect(() => {
        if (
            gameState.status === 'finished' &&
            gameState.winner &&
            !hasRecordedResult.current &&
            gameState.players.X &&
            gameState.players.O
        ) {
            hasRecordedResult.current = true;
            const winnerId = gameState.winner === 'X' ? gameState.players.X : gameState.players.O;
            const loserId = gameState.winner === 'X' ? gameState.players.O : gameState.players.X;
            if (winnerId && loserId) {
                recordGameResult(winnerId, loserId);
            }
        }
    }, [gameState.status, gameState.winner, gameState.players]);

    // Join an existing game as Player O
    const joinGame = useCallback(async () => {
        if (myPlayerRole !== '' || gameState.status !== 'waiting') return;

        if (!gameState.players.O && gameState.players.X !== userId) {
            const localName = getLocalName();
            const updates: Record<string, string> = {
                'players/O': userId,
                'status': 'playing',
                'playerNames/O': localName,
            };
            await updateGameState(roomId, updates);
            if (localName) updatePlayerName(userId, localName);
        }
    }, [roomId, userId, gameState, myPlayerRole]);

    const makeMove = useCallback(async (row: number, col: number) => {
        if (
            gameState.status !== 'playing' ||
            gameState.board[row][col] !== '' ||
            gameState.currentPlayer !== myPlayerRole ||
            gameState.winner !== ''
        ) {
            return;
        }

        const newBoard = gameState.board.map((r: Player[]) => [...r]);
        newBoard[row][col] = myPlayerRole;

        const isWin = checkWin(newBoard, row, col, myPlayerRole);
        const nextPlayer = myPlayerRole === 'X' ? 'O' : 'X';

        const updates = {
            board: newBoard,
            currentPlayer: isWin ? gameState.currentPlayer : nextPlayer,
            winner: isWin ? myPlayerRole : '',
            status: isWin ? 'finished' : 'playing',
            lastMove: [row, col],
        };

        await updateGameState(roomId, updates);
    }, [roomId, gameState, myPlayerRole]);

    const resetGame = useCallback(async () => {
        if (myPlayerRole === '') return;
        hasRecordedResult.current = false;

        const updates = {
            board: createEmptyBoard(15),
            currentPlayer: 'X',
            winner: '',
            status: 'playing',
            lastMove: null,
        };

        await updateGameState(roomId, updates);
    }, [roomId, myPlayerRole]);

    // Fetch stats for both players
    const [playersStats, setPlayersStats] = useState<{ X: PlayerStats | null, O: PlayerStats | null }>({ X: null, O: null });

    useEffect(() => {
        if (!gameState.players.X && !gameState.players.O) return;

        let unsubX: (() => void) | undefined;
        let unsubO: (() => void) | undefined;

        if (gameState.players.X) {
            unsubX = subscribeToPlayer(gameState.players.X, data => {
                setPlayersStats(prev => ({ ...prev, X: data }));
            });
        }
        if (gameState.players.O) {
            unsubO = subscribeToPlayer(gameState.players.O, data => {
                setPlayersStats(prev => ({ ...prev, O: data }));
            });
        }

        return () => {
            if (unsubX) unsubX();
            if (unsubO) unsubO();
        };
    }, [gameState.players.X, gameState.players.O]);

    return {
        gameState,
        myPlayerRole,
        opponentName,
        playersStats,
        makeMove,
        joinGame,
        resetGame,
        isMyTurn: gameState.currentPlayer === myPlayerRole,
        lastMove: gameState.lastMove || null,
    };
}
