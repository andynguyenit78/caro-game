import { BoardState, Player, checkWin } from './gameLogic';

const BOARD_SIZE = 15;

// Pattern scores for the heuristic evaluation
const SCORES = {
    FIVE: 1000000,
    OPEN_FOUR: 100000,
    FOUR: 10000,
    OPEN_THREE: 5000,
    THREE: 500,
    OPEN_TWO: 100,
    TWO: 50,
    ONE: 10,
};

interface LineInfo {
    count: number;
    openEnds: number;
}

/**
 * Count consecutive pieces in a direction and how many ends are open
 */
function evaluateLine(
    board: BoardState,
    row: number,
    col: number,
    dx: number,
    dy: number,
    player: Player
): LineInfo {
    if (player === '') return { count: 0, openEnds: 0 };

    const rows = board.length;
    const cols = board[0].length;
    let count = 1;
    let openEnds = 0;

    // Forward
    let r = row + dx;
    let c = col + dy;
    while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === player) {
        count++;
        r += dx;
        c += dy;
    }
    if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === '') {
        openEnds++;
    }

    // Backward
    r = row - dx;
    c = col - dy;
    while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === player) {
        count++;
        r -= dx;
        c -= dy;
    }
    if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === '') {
        openEnds++;
    }

    return { count, openEnds };
}

/**
 * Score a single cell position for a given player
 */
function scorePosition(board: BoardState, row: number, col: number, player: Player): number {
    const directions = [
        [0, 1],  // horizontal
        [1, 0],  // vertical
        [1, 1],  // diagonal right
        [1, -1], // diagonal left
    ];

    let totalScore = 0;

    for (const [dx, dy] of directions) {
        const { count, openEnds } = evaluateLine(board, row, col, dx, dy, player);

        if (count >= 5) {
            totalScore += SCORES.FIVE;
        } else if (count === 4) {
            totalScore += openEnds === 2 ? SCORES.OPEN_FOUR : openEnds === 1 ? SCORES.FOUR : 0;
        } else if (count === 3) {
            totalScore += openEnds === 2 ? SCORES.OPEN_THREE : openEnds === 1 ? SCORES.THREE : 0;
        } else if (count === 2) {
            totalScore += openEnds === 2 ? SCORES.OPEN_TWO : openEnds === 1 ? SCORES.TWO : 0;
        } else if (count === 1) {
            totalScore += openEnds === 2 ? SCORES.ONE : 0;
        }
    }

    return totalScore;
}

/**
 * Get candidate cells (empty cells near existing pieces)
 */
function getCandidateMoves(board: BoardState): [number, number][] {
    const candidates = new Set<string>();
    const range = 2; // Check 2 cells radius around existing pieces

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] !== '') {
                for (let dr = -range; dr <= range; dr++) {
                    for (let dc = -range; dc <= range; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (
                            nr >= 0 && nr < BOARD_SIZE &&
                            nc >= 0 && nc < BOARD_SIZE &&
                            board[nr][nc] === ''
                        ) {
                            candidates.add(`${nr},${nc}`);
                        }
                    }
                }
            }
        }
    }

    return Array.from(candidates).map(key => {
        const [r, c] = key.split(',').map(Number);
        return [r, c] as [number, number];
    });
}

/**
 * Main AI function — finds the best move for the AI player
 */
export function findBestMove(board: BoardState, aiPlayer: Player): [number, number] {
    const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';

    let candidates = getCandidateMoves(board);

    // If no candidates (empty board), play center
    if (candidates.length === 0) {
        return [Math.floor(BOARD_SIZE / 2), Math.floor(BOARD_SIZE / 2)];
    }

    let bestScore = -Infinity;
    let bestMove: [number, number] = candidates[0];

    for (const [r, c] of candidates) {
        // Temporarily place the AI piece
        board[r][c] = aiPlayer;

        // Check if this is an instant win
        if (checkWin(board, r, c, aiPlayer)) {
            board[r][c] = '';
            return [r, c];
        }

        board[r][c] = '';

        // Check if the human can win here (must block)
        board[r][c] = humanPlayer;
        if (checkWin(board, r, c, humanPlayer)) {
            board[r][c] = '';
            return [r, c]; // Block the win
        }
        board[r][c] = '';

        // Score: prioritize AI attack with a slight edge over defense
        board[r][c] = aiPlayer;
        const attackScore = scorePosition(board, r, c, aiPlayer);
        board[r][c] = '';

        board[r][c] = humanPlayer;
        const defenseScore = scorePosition(board, r, c, humanPlayer);
        board[r][c] = '';

        const totalScore = attackScore * 1.1 + defenseScore;

        if (totalScore > bestScore) {
            bestScore = totalScore;
            bestMove = [r, c];
        }
    }

    return bestMove;
}
