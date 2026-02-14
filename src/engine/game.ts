/**
 * Pure game engine functions for Tic-Tac-Toe
 * No side effects, no rendering, no network - just game logic
 */

import { Board, MoveResult, GameResult, Coord, pieceType } from './interfaces'



/**
 * Create a new empty board of the given size
 */
export function createBoard(size: number = 3): Board {
	const boardSize = size > 3 ? size : 3
	return Array.from({ length: boardSize }, (): (pieceType | null)[] => 
		Array.from({ length: boardSize }, (): pieceType | null => null)
	)
}

/**
 * Check if the board is completely filled
 */
export function isBoardFull(board: Board): boolean {
	return board.every(row => row.every(cell => cell !== null))
}

/**
 * Check if a move is valid (cell is empty and within bounds)
 */
export function isValidMove(board: Board, row: number, col: number): boolean {
	if (row < 0 || row >= board.length) return false
	if (col < 0 || col >= board[0].length) return false
	return board[row][col] === null
}

/**
 * Apply a move to the board (immutable - returns new board)
 */
export function applyMove(
	board: Board,
	row: number,
	col: number,
	piece: pieceType
): MoveResult {
	if (!isValidMove(board, row, col)) {
		return {
			board,
			success: false,
			nextTurn: piece
		}
	}

	const newBoard = board.map((r, i) =>
		r.map((c, j) => (i === row && j === col ? piece : c))
	)

	const nextTurn = piece === pieceType.nought ? pieceType.cross : pieceType.nought

	return {
		board: newBoard,
		success: true,
		nextTurn
	}
}

/**
 * Check for a win condition at the given position
 * Returns the win status and the winning path
 */
export function checkWin(board: Board, row: number, col: number): GameResult {
	const size = board.length
	const noWin: GameResult = { isWin: false, path: [] }

	// Check row
	const rowCells = board[row]
	if (rowCells.every(cell => cell !== null && cell === rowCells[0])) {
		return {
			isWin: true,
			path: rowCells.map((_, idx) => [row, idx] as Coord)
		}
	}

	// Check column
	const colCells = board.map(r => r[col])
	if (colCells.every(cell => cell !== null && cell === colCells[0])) {
		return {
			isWin: true,
			path: colCells.map((_, idx) => [idx, col] as Coord)
		}
	}

	// Check main diagonal (top-left to bottom-right)
	const diag = board.map((r, i) => r[i])
	if (diag.every(cell => cell !== null && cell === diag[0])) {
		return {
			isWin: true,
			path: diag.map((_, idx) => [idx, idx] as Coord)
		}
	}

	// Check anti-diagonal (top-right to bottom-left)
	const antiDiag = board.map((r, i) => r[size - 1 - i])
	if (antiDiag.every(cell => cell !== null && cell === antiDiag[0])) {
		return {
			isWin: true,
			path: antiDiag.map((_, idx) => [idx, size - 1 - idx] as Coord)
		}
	}

	return noWin
}

/**
 * Determine if the game has ended (win or draw)
 */
export function isGameOver(board: Board): { over: boolean; winner: pieceType | null; draw: boolean } {
	// Check all cells for a potential win
	for (let row = 0; row < board.length; row++) {
		for (let col = 0; col < board[row].length; col++) {
			if (board[row][col] !== null) {
				const { isWin } = checkWin(board, row, col)
				if (isWin) {
					return { over: true, winner: board[row][col], draw: false }
				}
			}
		}
	}

	// Check for draw
	if (isBoardFull(board)) {
		return { over: true, winner: null, draw: true }
	}

	return { over: false, winner: null, draw: false }
}

/**
 * Convert pixel coordinates to board cell coordinates
 */
export function pixelToCell(x: number, y: number, cellWidth: number): Coord {
	return [Math.floor(y / cellWidth), Math.floor(x / cellWidth)]
}

/**
 * Convert board cell coordinates to pixel center
 */
export function cellToPixelCenter(row: number, col: number, cellWidth: number): Coord {
	return [
		col * cellWidth + cellWidth / 2,
		row * cellWidth + cellWidth / 2
	]
}
