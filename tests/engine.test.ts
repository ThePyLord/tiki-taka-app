/**
 * Unit tests for the game engine
 * Tests pure game logic functions in isolation
 */

import { Board, pieceType } from '../src/engine/interfaces'
import {
	createBoard,
	isBoardFull,
	isValidMove,
	applyMove,
	checkWin,
	isGameOver,
	pixelToCell,
	cellToPixelCenter,
} from '../src/engine/game'

describe('Game Engine', () => {
	describe('createBoard', () => {
		it('should create a 3x3 board by default', () => {
			const board = createBoard()
			expect(board.length).toBe(3)
			expect(board[0].length).toBe(3)
			expect(board.every(row => row.every(cell => cell === null))).toBe(true)
		})

		it('should create a board of specified size', () => {
			const board = createBoard(5)
			expect(board.length).toBe(5)
			expect(board[0].length).toBe(5)
		})

		it('should default to 3 if size is less than 3', () => {
			const board = createBoard(2)
			expect(board.length).toBe(3)
		})
	})

	describe('isBoardFull', () => {
		it('should return false for empty board', () => {
			const board = createBoard()
			expect(isBoardFull(board)).toBe(false)
		})

		it('should return false for partially filled board', () => {
			const board: Board = [
				[pieceType.nought, null, null],
				[null, pieceType.cross, null],
				[null, null, null]
			]
			expect(isBoardFull(board)).toBe(false)
		})

		it('should return true for full board', () => {
			const board: Board = [
				[pieceType.nought, pieceType.cross, pieceType.nought],
				[pieceType.cross, pieceType.nought, pieceType.cross],
				[pieceType.cross, pieceType.nought, pieceType.cross]
			]
			expect(isBoardFull(board)).toBe(true)
		})
	})

	describe('isValidMove', () => {
		it('should return true for empty cell', () => {
			const board = createBoard()
			expect(isValidMove(board, 0, 0)).toBe(true)
		})

		it('should return false for occupied cell', () => {
			const board: Board = [
				[pieceType.nought, null, null],
				[null, null, null],
				[null, null, null]
			]
			expect(isValidMove(board, 0, 0)).toBe(false)
		})

		it('should return false for out of bounds', () => {
			const board = createBoard()
			expect(isValidMove(board, -1, 0)).toBe(false)
			expect(isValidMove(board, 0, -1)).toBe(false)
			expect(isValidMove(board, 3, 0)).toBe(false)
			expect(isValidMove(board, 0, 3)).toBe(false)
		})
	})

	describe('applyMove', () => {
		it('should apply a valid move and return new board', () => {
			const board = createBoard()
			const result = applyMove(board, 0, 0, pieceType.nought)
			
			expect(result.success).toBe(true)
			expect(result.board[0][0]).toBe(pieceType.nought)
			expect(result.nextTurn).toBe(pieceType.cross)
		})

		it('should not modify original board (immutability)', () => {
			const board = createBoard()
			applyMove(board, 0, 0, pieceType.nought)
			
			expect(board[0][0]).toBe(null)
		})

		it('should fail for invalid move', () => {
			const board: Board = [
				[pieceType.nought, null, null],
				[null, null, null],
				[null, null, null]
			]
			const result = applyMove(board, 0, 0, pieceType.cross)
			
			expect(result.success).toBe(false)
			expect(result.board).toBe(board)
		})

		it('should alternate turns correctly', () => {
			const result1 = applyMove(createBoard(), 0, 0, pieceType.nought)
			expect(result1.nextTurn).toBe(pieceType.cross)

			const result2 = applyMove(result1.board, 0, 1, pieceType.cross)
			expect(result2.nextTurn).toBe(pieceType.nought)
		})
	})

	describe('checkWin', () => {
		it('should detect horizontal win', () => {
			const board: Board = [
				[pieceType.nought, pieceType.nought, pieceType.nought],
				[null, pieceType.cross, null],
				[pieceType.cross, null, pieceType.cross]
			]
			const result = checkWin(board, 0, 0)
			
			expect(result.isWin).toBe(true)
			expect(result.path).toEqual([[0, 0], [0, 1], [0, 2]])
		})

		it('should detect vertical win', () => {
			const board: Board = [
				[pieceType.cross, pieceType.nought, null],
				[pieceType.cross, pieceType.nought, null],
				[pieceType.cross, null, null]
			]
			const result = checkWin(board, 1, 0)
			
			expect(result.isWin).toBe(true)
			expect(result.path).toEqual([[0, 0], [1, 0], [2, 0]])
		})

		it('should detect main diagonal win', () => {
			const board: Board = [
				[pieceType.nought, pieceType.cross, null],
				[null, pieceType.nought, pieceType.cross],
				[null, null, pieceType.nought]
			]
			const result = checkWin(board, 1, 1)
			
			expect(result.isWin).toBe(true)
			expect(result.path).toEqual([[0, 0], [1, 1], [2, 2]])
		})

		it('should detect anti-diagonal win', () => {
			const board: Board = [
				[null, null, pieceType.cross],
				[null, pieceType.cross, null],
				[pieceType.cross, null, null]
			]
			const result = checkWin(board, 1, 1)
			
			expect(result.isWin).toBe(true)
			expect(result.path).toEqual([[0, 2], [1, 1], [2, 0]])
		})

		it('should return no win when there is none', () => {
			const board: Board = [
				[pieceType.nought, pieceType.cross, pieceType.nought],
				[pieceType.cross, pieceType.nought, null],
				[null, null, pieceType.cross]
			]
			const result = checkWin(board, 0, 0)
			
			expect(result.isWin).toBe(false)
			expect(result.path).toEqual([])
		})
	})

	describe('isGameOver', () => {
		it('should detect win', () => {
			const board: Board = [
				[pieceType.nought, pieceType.nought, pieceType.nought],
				[null, pieceType.cross, null],
				[pieceType.cross, null, pieceType.cross]
			]
			const result = isGameOver(board)
			
			expect(result.over).toBe(true)
			expect(result.winner).toBe(pieceType.nought)
			expect(result.draw).toBe(false)
		})

		it('should detect draw', () => {
			const board: Board = [
				[pieceType.nought, pieceType.cross, pieceType.nought],
				[pieceType.cross, pieceType.cross, pieceType.nought],
				[pieceType.nought, pieceType.nought, pieceType.cross]
			]
			const result = isGameOver(board)
			
			expect(result.over).toBe(true)
			expect(result.winner).toBe(null)
			expect(result.draw).toBe(true)
		})

		it('should detect game in progress', () => {
			const board: Board = [
				[pieceType.nought, null, null],
				[null, pieceType.cross, null],
				[null, null, null]
			]
			const result = isGameOver(board)
			
			expect(result.over).toBe(false)
			expect(result.winner).toBe(null)
			expect(result.draw).toBe(false)
		})
	})

	describe('coordinate conversion', () => {
		it('should convert pixel to cell coordinates', () => {
			const cellWidth = 100
			expect(pixelToCell(50, 50, cellWidth)).toEqual([0, 0])
			expect(pixelToCell(150, 50, cellWidth)).toEqual([0, 1])
			expect(pixelToCell(250, 250, cellWidth)).toEqual([2, 2])
		})

		it('should convert cell to pixel center', () => {
			const cellWidth = 100
			expect(cellToPixelCenter(0, 0, cellWidth)).toEqual([50, 50])
			expect(cellToPixelCenter(1, 2, cellWidth)).toEqual([250, 150])
		})
	})
})
