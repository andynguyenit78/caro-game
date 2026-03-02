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
 * Scan the entire board and find all 4-in-a-row threats for both players.
 * A threat is a 5-cell window containing 4 pieces of one player and 1 empty space.
 * Returns a list of all coordinates involved in such threats.
 */
export function findAllWarnings(board: BoardState): [number, number][] {
    const totalRows = board.length;
    const totalCols = board[0].length;
    const warningCells: [number, number][] = [];

    // Check all directions
    for (const [rowDelta, colDelta] of WIN_DIRECTIONS) {
        for (let r = 0; r < totalRows; r++) {
            for (let c = 0; c < totalCols; c++) {
                // Determine the end of the 5-cell window
                const endR = r + rowDelta * (WIN_LENGTH - 1);
                const endC = c + colDelta * (WIN_LENGTH - 1);

                // If the window is within bounds
                if (endR >= 0 && endR < totalRows && endC >= 0 && endC < totalCols) {
                    let xCount = 0;
                    let oCount = 0;
                    let emptyCount = 0;
                    const pieces: [number, number][] = [];

                    for (let step = 0; step < WIN_LENGTH; step++) {
                        const currR = r + rowDelta * step;
                        const currC = c + colDelta * step;
                        const cell = board[currR][currC];

                        if (cell === 'X') {
                            xCount++;
                            pieces.push([currR, currC]);
                        } else if (cell === 'O') {
                            oCount++;
                            pieces.push([currR, currC]);
                        } else {
                            emptyCount++;
                        }
                    }

                    // If exactly 4 of one player and 1 empty space
                    if ((xCount === 4 || oCount === 4) && emptyCount === 1) {
                        for (const p of pieces) {
                            // Only add if not already in the list
                            if (!warningCells.some((wc) => wc[0] === p[0] && wc[1] === p[1])) {
                                warningCells.push(p);
                            }
                        }
                    }
                }
            }
        }
    }

    return warningCells;
}

/**
 * Create a fresh empty board of the given size (default 15×15).
 */
export function createEmptyBoard(size: number = 15): BoardState {
    return Array.from({ length: size }, () => Array(size).fill(''));
}
