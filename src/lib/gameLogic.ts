/**
 * Core Caro (Gomoku) game logic — win detection and board utilities.
 */

/** Represents a cell occupant: Player X, Player O, or empty. */
export type Player = 'X' | 'O' | '';

/** 2D grid of cells — the game board. */
export type BoardState = Player[][];

/** The four axes along which 5-in-a-row can occur. */
const WIN_DIRECTIONS: [number, number][] = [
    [0, 1], // horizontal →
    [1, 0], // vertical ↓
    [1, 1], // diagonal ↘
    [1, -1], // diagonal ↙
];

/** Number of consecutive pieces required to win. */
const WIN_LENGTH = 5;

/**
 * Return an array of consecutive coordinates belonging to `player` along a single axis
 * through (`row`, `col`), checking both the forward and backward direction.
 */
function getConsecutiveLine(
    board: BoardState,
    row: number,
    col: number,
    rowDelta: number,
    colDelta: number,
    player: Player
): [number, number][] {
    const totalRows = board.length;
    const totalCols = board[0].length;
    const line: [number, number][] = [[row, col]];

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
        line.push([currentRow, currentCol]);
        currentRow += rowDelta;
        currentCol += colDelta;
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
        line.unshift([currentRow, currentCol]);
        currentRow -= rowDelta;
        currentCol -= colDelta;
    }

    return line;
}

/**
 * Determine whether placing `player` at (`row`, `col`) creates a winning line
 * of 5 or more consecutive pieces in any direction.
 * Returns the winning line of coordinates, or null if no win.
 */
export function checkWin(
    board: BoardState,
    row: number,
    col: number,
    player: Player
): [number, number][] | null {
    if (player === '') return null;

    for (const [rowDelta, colDelta] of WIN_DIRECTIONS) {
        const line = getConsecutiveLine(board, row, col, rowDelta, colDelta, player);
        if (line.length >= WIN_LENGTH) {
            return line;
        }
    }

    return null;
}

/**
 * Create a fresh empty board of the given size (default 15×15).
 */
export function createEmptyBoard(size: number = 15): BoardState {
    return Array.from({ length: size }, () => Array(size).fill(''));
}
