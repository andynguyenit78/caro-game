/**
 * Caro AI — heuristic-based move evaluation engine.
 *
 * Strategy:
 * 1. If an instant win exists, take it.
 * 2. If the opponent can win next turn, block it.
 * 3. Otherwise, score each candidate cell by combining attack potential
 *    (AI's patterns) and defense urgency (opponent's patterns), with a
 *    slight bias toward offense (×1.1 multiplier).
 */

import { BoardState, Player, checkWin } from './gameLogic';

const BOARD_SIZE = 15;

/** Candidate search radius — how far from existing pieces to look for moves. */
const SEARCH_RADIUS = 2;

// ─── Pattern Scores ─────────────────────────────────────────────────────────────

/** Score weights for each pattern recognised during heuristic evaluation. */
const PATTERN_SCORES = {
    FIVE: 1_000_000,
    OPEN_FOUR: 100_000,
    FOUR: 10_000,
    OPEN_THREE: 5_000,
    THREE: 500,
    OPEN_TWO: 100,
    TWO: 50,
    ONE: 10,
} as const;

// ─── Line Evaluation ────────────────────────────────────────────────────────────

interface LineEvaluation {
    /** Number of consecutive pieces belonging to the player. */
    consecutiveCount: number;
    /** Number of open (empty) ends flanking the line (0, 1, or 2). */
    openEnds: number;
}

/** All four axes to check for patterns. */
const DIRECTIONS: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
];

/**
 * Evaluate a single line through (`row`, `col`) along the given direction.
 * Returns how many of `player`'s pieces are consecutive and how many ends are open.
 */
function evaluateLine(
    board: BoardState,
    row: number,
    col: number,
    rowDelta: number,
    colDelta: number,
    player: Player
): LineEvaluation {
    if (player === '') return { consecutiveCount: 0, openEnds: 0 };

    const totalRows = board.length;
    const totalCols = board[0].length;
    let consecutiveCount = 1;
    let openEnds = 0;

    // Scan forward
    let currentRow = row + rowDelta;
    let currentCol = col + colDelta;
    while (
        currentRow >= 0 &&
        currentRow < totalRows &&
        currentCol >= 0 &&
        currentCol < totalCols &&
        board[currentRow][currentCol] === player
    ) {
        consecutiveCount++;
        currentRow += rowDelta;
        currentCol += colDelta;
    }
    if (
        currentRow >= 0 &&
        currentRow < totalRows &&
        currentCol >= 0 &&
        currentCol < totalCols &&
        board[currentRow][currentCol] === ''
    ) {
        openEnds++;
    }

    // Scan backward
    currentRow = row - rowDelta;
    currentCol = col - colDelta;
    while (
        currentRow >= 0 &&
        currentRow < totalRows &&
        currentCol >= 0 &&
        currentCol < totalCols &&
        board[currentRow][currentCol] === player
    ) {
        consecutiveCount++;
        currentRow -= rowDelta;
        currentCol -= colDelta;
    }
    if (
        currentRow >= 0 &&
        currentRow < totalRows &&
        currentCol >= 0 &&
        currentCol < totalCols &&
        board[currentRow][currentCol] === ''
    ) {
        openEnds++;
    }

    return { consecutiveCount, openEnds };
}

/**
 * Compute a heuristic score for a cell, measuring how valuable it is
 * for the given `player` across all four directions.
 */
function scorePosition(board: BoardState, row: number, col: number, player: Player): number {
    let totalScore = 0;

    for (const [rowDelta, colDelta] of DIRECTIONS) {
        const { consecutiveCount, openEnds } = evaluateLine(
            board,
            row,
            col,
            rowDelta,
            colDelta,
            player
        );

        if (consecutiveCount >= 5) {
            totalScore += PATTERN_SCORES.FIVE;
        } else if (consecutiveCount === 4) {
            totalScore +=
                openEnds === 2
                    ? PATTERN_SCORES.OPEN_FOUR
                    : openEnds === 1
                      ? PATTERN_SCORES.FOUR
                      : 0;
        } else if (consecutiveCount === 3) {
            totalScore +=
                openEnds === 2
                    ? PATTERN_SCORES.OPEN_THREE
                    : openEnds === 1
                      ? PATTERN_SCORES.THREE
                      : 0;
        } else if (consecutiveCount === 2) {
            totalScore +=
                openEnds === 2 ? PATTERN_SCORES.OPEN_TWO : openEnds === 1 ? PATTERN_SCORES.TWO : 0;
        } else if (consecutiveCount === 1) {
            totalScore += openEnds === 2 ? PATTERN_SCORES.ONE : 0;
        }
    }

    return totalScore;
}

// ─── Candidate Discovery ────────────────────────────────────────────────────────

/**
 * Collect all empty cells within `SEARCH_RADIUS` of an existing piece.
 * This dramatically prunes the search space compared to checking all 225 cells.
 */
function getCandidateMoves(board: BoardState): [number, number][] {
    const seen = new Set<string>();

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === '') continue;

            for (let dRow = -SEARCH_RADIUS; dRow <= SEARCH_RADIUS; dRow++) {
                for (let dCol = -SEARCH_RADIUS; dCol <= SEARCH_RADIUS; dCol++) {
                    const neighborRow = row + dRow;
                    const neighborCol = col + dCol;
                    if (
                        neighborRow >= 0 &&
                        neighborRow < BOARD_SIZE &&
                        neighborCol >= 0 &&
                        neighborCol < BOARD_SIZE &&
                        board[neighborRow][neighborCol] === ''
                    ) {
                        seen.add(`${neighborRow},${neighborCol}`);
                    }
                }
            }
        }
    }

    return Array.from(seen).map((key) => {
        const [r, c] = key.split(',').map(Number);
        return [r, c] as [number, number];
    });
}

// ─── Tactical Checks ────────────────────────────────────────────────────────────

/**
 * Check if placing `player` at (`row`, `col`) results in an instant win.
 * Temporarily mutates the board, then restores it.
 */
function isWinningMove(board: BoardState, row: number, col: number, player: Player): boolean {
    board[row][col] = player;
    const wins = checkWin(board, row, col, player);
    board[row][col] = '';
    return wins;
}

// ─── Public API ─────────────────────────────────────────────────────────────────

/**
 * Select the best move for the AI player using heuristic search.
 *
 * Priority: instant win → block opponent win → highest combined score.
 */
export function findBestMove(board: BoardState, aiPlayer: Player): [number, number] {
    const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';
    const candidates = getCandidateMoves(board);

    // Empty board — play center
    if (candidates.length === 0) {
        const center = Math.floor(BOARD_SIZE / 2);
        return [center, center];
    }

    // Pass 1: check for instant wins or must-blocks
    for (const [row, col] of candidates) {
        if (isWinningMove(board, row, col, aiPlayer)) return [row, col];
    }
    for (const [row, col] of candidates) {
        if (isWinningMove(board, row, col, humanPlayer)) return [row, col];
    }

    // Pass 2: score remaining candidates by combined attack + defense
    let bestScore = -Infinity;
    let bestMove: [number, number] = candidates[0];

    for (const [row, col] of candidates) {
        board[row][col] = aiPlayer;
        const attackScore = scorePosition(board, row, col, aiPlayer);
        board[row][col] = '';

        board[row][col] = humanPlayer;
        const defenseScore = scorePosition(board, row, col, humanPlayer);
        board[row][col] = '';

        const combinedScore = attackScore * 1.1 + defenseScore;
        if (combinedScore > bestScore) {
            bestScore = combinedScore;
            bestMove = [row, col];
        }
    }

    return bestMove;
}
