/**
 * CanvasRenderer component for Tic-Tac-Toe board
 * Encapsulates all canvas drawing logic and user interaction
 */

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import Piece from './Piece'
import type { WinPath, Coord, pieceType } from '../engine/interfaces'
// import type { Board, Coord, WinPath } from '../engine/game'

export interface CanvasRendererProps {
	width?: number
	height?: number
	boardSize: number
	onCellClick?: (row: number, col: number, centerX: number, centerY: number) => void
	disabled?: boolean
	className?: string
	id?: string
}

export interface CanvasRendererHandle {
	drawBoard: () => void
	drawPiece: (row: number, col: number, piece: pieceType) => void
	drawPieceAtPixel: (centerX: number, centerY: number, piece: pieceType) => void
	drawWinPath: (path: WinPath) => void
	clearBoard: () => void
	getContext: () => CanvasRenderingContext2D | null
	getCellWidth: () => number
}

const CanvasRenderer = forwardRef<CanvasRendererHandle, CanvasRendererProps>(
	({ width = 500, height = 500, boardSize, onCellClick, disabled = false, className, id }, ref) => {
		const canvasRef = useRef<HTMLCanvasElement>(null)
		const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
		
		const cellWidth = Math.floor(width / boardSize)

		// Initialize canvas context
		useEffect(() => {
			if (canvasRef.current) {
				ctxRef.current = canvasRef.current.getContext('2d')
			}
		}, [])

		// Draw grid lines
		const drawBoard = useCallback(() => {
			const ctx = ctxRef.current
			const canvas = canvasRef.current
			if (!ctx || !canvas) return

			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.fillStyle = '#000'
			ctx.fillRect(0, 0, canvas.width, canvas.height)
			ctx.strokeStyle = '#fff'
			ctx.lineWidth = 1.3

			for (let i = 0; i <= boardSize; i++) {
				// Horizontal lines
				ctx.beginPath()
				ctx.moveTo(0, i * cellWidth)
				ctx.lineTo(canvas.width, i * cellWidth)
				ctx.stroke()

				// Vertical lines
				ctx.beginPath()
				ctx.moveTo(i * cellWidth, 0)
				ctx.lineTo(i * cellWidth, canvas.height)
				ctx.stroke()
			}
			ctx.save()
		}, [boardSize, cellWidth])

		// Draw a piece at cell coordinates
		const drawPiece = useCallback((row: number, col: number, type: pieceType) => {
			const ctx = ctxRef.current
			if (!ctx) return

			const centerX = col * cellWidth + cellWidth / 2
			const centerY = row * cellWidth + cellWidth / 2
			
			ctx.lineWidth = 1.3
			const piece = new Piece(ctx, type)
			piece.drawAt(centerX, centerY, cellWidth / 3)
		}, [cellWidth])

		// Draw a piece at pixel coordinates
		const drawPieceAtPixel = useCallback((centerX: number, centerY: number, type: pieceType) => {
			const ctx = ctxRef.current
			if (!ctx) return

			ctx.lineWidth = 1.3
			const piece = new Piece(ctx, type)
			piece.drawAt(centerX, centerY, cellWidth / 3)
		}, [cellWidth])

		// Draw the winning path
		const drawWinPath = useCallback((path: WinPath) => {
			const ctx = ctxRef.current
			if (!ctx || path.length < 2) return

			ctx.strokeStyle = '#2D47A0'
			ctx.lineWidth = 5
			ctx.lineCap = 'round'
			ctx.beginPath()

			// Determine path type and draw accordingly
			const isHorizontal = path[0][0] === path[1][0]
			const isVertical = path[0][1] === path[1][1]

			if (isHorizontal) {
				// Horizontal line
				const y = path[0][0] * cellWidth + cellWidth / 2
				ctx.moveTo(cellWidth / 2, y)
				ctx.lineTo(path.at(-1)![1] * cellWidth + cellWidth / 2, y)
			} else if (isVertical) {
				// Vertical line
				const x = path[0][1] * cellWidth + cellWidth / 2
				ctx.moveTo(x, cellWidth / 2)
				ctx.lineTo(x, path.at(-1)![0] * cellWidth + cellWidth / 2)
			} else {
				// Diagonal - check if anti-diagonal
				const isAntiDiagonal = path[0][1] > path[1][1]
				
				if (isAntiDiagonal) {
					// Anti-diagonal (top-right to bottom-left)
					path.forEach(([row, col]: Coord, idx: number) => {
						if (idx !== path.length - 1) {
							const x = col * cellWidth + cellWidth / 2
							const y = row * cellWidth + cellWidth / 2
							ctx.moveTo(x, y)
							ctx.lineTo(x - cellWidth, y + cellWidth)
						}
					})
				} else {
					// Main diagonal (top-left to bottom-right)
					path.forEach(([row, col]: Coord, idx: number) => {
						if (idx !== path.length - 1) {
							const x = col * cellWidth + cellWidth / 2
							const y = row * cellWidth + cellWidth / 2
							ctx.moveTo(x, y)
							ctx.lineTo(x + cellWidth, y + cellWidth)
						}
					})
				}
			}
			ctx.stroke()
		}, [cellWidth])

		// Clear the board
		const clearBoard = useCallback(() => {
			drawBoard()
		}, [drawBoard])

		// Handle click events
		const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
			if (disabled || !onCellClick) return

			const rect = canvasRef.current?.getBoundingClientRect()
			if (!rect) return

			const mouseX = e.clientX - rect.left
			const mouseY = e.clientY - rect.top

			const col = Math.floor(mouseX / cellWidth)
			const row = Math.floor(mouseY / cellWidth)

			const centerX = col * cellWidth + cellWidth / 2
			const centerY = row * cellWidth + cellWidth / 2

			onCellClick(row, col, centerX, centerY)
		}, [disabled, onCellClick, cellWidth])

		// Expose methods via ref
		useImperativeHandle(ref, () => ({
			drawBoard,
			drawPiece,
			drawPieceAtPixel,
			drawWinPath,
			clearBoard,
			getContext: () => ctxRef.current,
			getCellWidth: () => cellWidth
		}), [drawBoard, drawPiece, drawPieceAtPixel, drawWinPath, clearBoard, cellWidth])

		return (
			<canvas
				ref={canvasRef}
				width={width}
				height={height}
				onClick={handleClick}
				className={className}
				id={id}
			/>
		)
	}
)

CanvasRenderer.displayName = 'CanvasRenderer'

export default CanvasRenderer
