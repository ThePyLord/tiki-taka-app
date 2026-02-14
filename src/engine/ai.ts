/**
 * AI Engine for Tic-Tac-Toe
 * Implements minimax algorithm with optional difficulty levels
 */

// import { pieceType } from '../components/Piece'

import { checkWin, isBoardFull, isValidMove, applyMove } from './game'
import { pieceType, Board } from './interfaces'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface AIMove {
	row: number
	col: number
}

// Score values for minimax
const SCORES = {
	win: 10,
	lose: -10,
	draw: 0
}

function secureRandom() {
	// Create a 32-bit unsigned integer array
	const array = new Uint32Array(1);
	// Fill with cryptographically secure random numbers
	if (typeof window === 'undefined' || !window.crypto) {
		throw new Error('Web Crypto API is not available');
	}
	window.crypto.getRandomValues(array);
	// Divide by 2^32 (4294967296) to get a 0-1 float
	return array[0] / 4294967296;
}

console.log(secureRandom()); // Example: 0.54823...


/**
 * Get the best move for the AI player
 */
export function getAIMove(
	board: Board,
	aiPiece: pieceType,
	difficulty: Difficulty = 'hard'
): AIMove | null {
	const emptySpots = getEmptySpots(board)
	
	if (emptySpots.length === 0) {
		return null
	}

	switch (difficulty) {
		case 'easy':
			return getRandomMove(emptySpots)
		case 'medium':
			// 50% chance of optimal move, 50% random
			return secureRandom() < 0.5 
				? getBestMove(board, aiPiece) 
				: getRandomMove(emptySpots)
		case 'hard':
		default:
			return getBestMove(board, aiPiece)
	}
}

/**
 * Get all empty spots on the board
 */
export function getEmptySpots(board: Board): AIMove[] {
	const spots: AIMove[] = []
	
	for (let row = 0; row < board.length; row++) {
		for (let col = 0; col < board[row].length; col++) {
			if (board[row][col] === null) {
				spots.push({ row, col })
			}
		}
	}
	
	return spots
}

/**
 * Get a random move from available spots
 */
export function getRandomMove(spots: AIMove[]): AIMove {
	const rnd_val = crypto.getRandomValues(new Uint32Array(1))[0]
	const idx = rnd_val % spots.length
	console.log(`Random value created using Web Crypto API: ${rnd_val}, index selected: ${idx}`)
	// const idx = Math.floor(Math.random() * spots.length)
	return spots[idx]
}

/**
 * Get the optimal move using minimax
 */
export function getBestMove(board: Board, aiPiece: pieceType): AIMove | null {
	const emptySpots = getEmptySpots(board)
	if (emptySpots.length === 0) return null

	let bestScore = -Infinity
	let bestMove: AIMove | null = null

	for (const spot of emptySpots) {
		const { board: newBoard } = applyMove(board, spot.row, spot.col, aiPiece)
		const score = minimax(newBoard, 0, false, aiPiece)
		if (score > bestScore) {
			bestScore = score
			bestMove = spot
		}
	}

	return bestMove
}

/**
 * Minimax algorithm with explicit turn and no alpha-beta pruning
 */
function minimax(
	board: Board,
	depth: number,
	isAITurn: boolean,
	aiPiece: pieceType
): number {
	const humanPiece =
		aiPiece === pieceType.nought ? pieceType.cross : pieceType.nought

	const terminalScore = evaluateTerminal(board, aiPiece, humanPiece, depth)
	if (terminalScore !== null) {
		return terminalScore
	}

	if (isAITurn) {
		let maxScore = -Infinity
		for (const spot of getEmptySpots(board)) {
			const { board: newBoard } = applyMove(board, spot.row, spot.col, aiPiece)
			const score = minimax(newBoard, depth + 1, false, aiPiece)
			maxScore = Math.max(maxScore, score)
		}
		return maxScore
	} else {
		let minScore = Infinity
		for (const spot of getEmptySpots(board)) {
			const { board: newBoard } = applyMove(board, spot.row, spot.col, humanPiece)
			const score = minimax(newBoard, depth + 1, true, aiPiece)
			minScore = Math.min(minScore, score)
		}
		return minScore
	}
}

/**
 * Evaluate terminal board states for win/lose/draw
 */
function evaluateTerminal(
	board: Board,
	aiPiece: pieceType,
	humanPiece: pieceType,
	depth: number
): number | null {
	if (hasWinner(board, aiPiece)) {
		return SCORES.win - depth
	}
	if (hasWinner(board, humanPiece)) {
		return SCORES.lose + depth
	}
	if (isBoardFull(board)) {
		return SCORES.draw
	}
	return null
}

/**
 * Check if a piece has won on the board
 */
function hasWinner(board: Board, piece: pieceType): boolean {
	const size = board.length

	for (let i = 0; i < size; i++) {
		if (
			board[i].every(cell => cell === piece) ||
			board.every(row => row[i] === piece)
		) {
			return true
		}
	}

	if (
		board.every((row, i) => row[i] === piece) ||
		board.every((row, i) => row[size - 1 - i] === piece)
	) {
		return true
	}

	return false
}
