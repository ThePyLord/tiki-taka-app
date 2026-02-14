// import { Board, AIMove, applyMove, getEmptySpots, isBoardFull } from '../src/engine/interfaces'

import { pieceType, Board } from '../src/engine/interfaces'

import { AIMove, getEmptySpots, getRandomMove } from '../src/engine/ai'
import { applyMove, isBoardFull } from '../src/engine/game'


describe('AI Module', () => {
	describe('getEmptySpots', () => {
		it('should return all empty spots on an empty board', () => {
			const board: Board = [
				[null, null, null],
				[null, null, null],
				[null, null, null]
			]
			const emptySpots = getEmptySpots(board)
			expect(emptySpots.length).toBe(9)
		})

		it('should return correct empty spots on a partially filled board', () => {
			const board: Board = [
				[pieceType.nought, null, pieceType.cross],
				[null, pieceType.nought, null],
				[pieceType.cross, null, null]
			]
			const emptySpots = getEmptySpots(board)
			expect(emptySpots).toEqual([
				{ row: 0, col: 1 },
				{ row: 1, col: 0 },
				{ row: 1, col: 2 },
				{ row: 2, col: 1 },
				{ row: 2, col: 2 }
			])
		})

		it('should return an empty array for a full board', () => {
			const board: Board = [
				[pieceType.nought, pieceType.cross, pieceType.nought],
				[pieceType.cross, pieceType.nought, pieceType.cross],
				[pieceType.cross, pieceType.nought, pieceType.cross]
			]
			const emptySpots = getEmptySpots(board)
			expect(emptySpots.length).toBe(0)
		})
	})

	describe('easy AI move', () => {
		it('should return a random valid move', () => {
			const board: Board = [
				[pieceType.nought, pieceType.cross, null],
				[null, pieceType.nought, pieceType.cross],
				[pieceType.cross, null, null]
			]
			const emptySpots = getEmptySpots(board)
			const aiMove: AIMove | null = getRandomMove(emptySpots)
			expect(aiMove).not.toBeNull()
			if (aiMove) {
				expect(board[aiMove.row][aiMove.col]).toBeNull()
			}
		})
	})
})