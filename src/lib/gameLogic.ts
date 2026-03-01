export type Player = 'X' | 'O' | '';
export type BoardState = Player[][];

// Check for 5 in a row in all directions
export function checkWin(board: BoardState, row: number, col: number, player: Player): boolean {
    if (player === '') return false;

    const directions = [
        [0, 1],   // horizontal
        [1, 0],   // vertical
        [1, 1],   // diagonal right
        [1, -1]   // diagonal left
    ];

    const rows = board.length;
    const cols = board[0].length;

    for (let [dx, dy] of directions) {
        let count = 1;

        // Check forward
        let r = row + dx;
        let c = col + dy;
        while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === player) {
            count++;
            r += dx;
            c += dy;
        }

        // Check backward
        r = row - dx;
        c = col - dy;
        while (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === player) {
            count++;
            r -= dx;
            c -= dy;
        }

        // Caro rule: 5 in a row wins
        if (count >= 5) {
            return true;
        }
    }

    return false;
}

export function createEmptyBoard(size: number = 15): BoardState {
    return Array.from({ length: size }, () => Array(size).fill(''));
}
