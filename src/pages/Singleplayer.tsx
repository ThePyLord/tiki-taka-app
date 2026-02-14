/**
 * Singleplayer page - Play against AI
 * 
 * Uses:
 * - Game engine for logic
 * - AI engine for computer moves
 * - CanvasRenderer for display
 * - useSound for audio feedback
 */

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import CanvasRenderer, { CanvasRendererHandle } from '../components/CanvasRenderer'
import { ThemeContext } from '../components/Theme'
import { useSound, SoundConfig } from '../hooks/useSound'
import { 
	createBoard, 
	applyMove, 
	checkWin, 
	isBoardFull
} from '../engine/game'
import { getAIMove, Difficulty } from '../engine/ai'
import styles from '../styles/game.module.css'

// Audio assets
import winSound from '../../assets/audio/lesgooo.mp3'
import loseSound from '../../assets/audio/wasted.mp3'
import drawSound from '../../assets/audio/fahh.mp3'
import { Board, pieceType } from '../engine/interfaces'

const SOUND_CONFIG: SoundConfig = {
	win: winSound,
	lose: loseSound,
	draw: drawSound
}

const CANVAS_SIZE = 500
const BOARD_SIZE = 3

type GameStatus = 'playing' | 'won' | 'lost' | 'draw' | 'idle'

interface GameState {
	board: Board
	currentTurn: pieceType
	playerPiece: pieceType
	aiPiece: pieceType
	status: GameStatus
	difficulty: Difficulty
	winPath: [number, number][] | null
}

export default function Singleplayer() {
	const [gameState, setGameState] = useState<GameState>({
		board: createBoard(BOARD_SIZE),
		currentTurn: pieceType.nought, // O goes first
		playerPiece: pieceType.nought,
		aiPiece: pieceType.cross,
		status: 'idle',
		difficulty: 'hard',
		winPath: null
	})

	const canvasRef = useRef<CanvasRendererHandle>(null)
	const { theme, toggleTheme } = useContext(ThemeContext)
	const { play: playSound } = useSound(SOUND_CONFIG)

	// Start a new game
	const startGame = useCallback((difficulty: Difficulty = gameState.difficulty) => {
		const newBoard = createBoard(BOARD_SIZE)
		setGameState(prev => ({
			...prev,
			board: newBoard,
			currentTurn: pieceType.nought,
			status: 'playing',
			difficulty,
			winPath: null
		}))
		
		setTimeout(() => {
			canvasRef.current?.clearBoard()
		}, 0)
	}, [gameState.difficulty])

	// Handle player move
	const handleCellClick = useCallback((row: number, col: number) => {
		if (gameState.status !== 'playing') return
		if (gameState.currentTurn !== gameState.playerPiece) return

		const result = applyMove(gameState.board, row, col, gameState.playerPiece)
		if (!result.success) return

		// Draw the piece
		canvasRef.current?.drawPiece(row, col, gameState.playerPiece)

		// Check for win
		const winResult = checkWin(result.board, row, col)
		if (winResult.isWin) {
			playSound('win')
			setGameState(prev => ({
				...prev,
				board: result.board,
				status: 'won',
				winPath: winResult.path
			}))
			canvasRef.current?.drawWinPath(winResult.path)
			return
		}

		// Check for draw
		if (isBoardFull(result.board)) {
			playSound('draw')
			setGameState(prev => ({
				...prev,
				board: result.board,
				status: 'draw'
			}))
			return
		}

		// Update state and let AI move
		setGameState(prev => ({
			...prev,
			board: result.board,
			currentTurn: result.nextTurn
		}))
	}, [gameState, playSound])

	// AI makes a move
	useEffect(() => {
		if (gameState.status !== 'playing') return
		if (gameState.currentTurn !== gameState.aiPiece) return

		const timeoutId = setTimeout(() => {
			const aiMove = getAIMove(gameState.board, gameState.aiPiece, gameState.difficulty)
			
			if (!aiMove) return

			const result = applyMove(gameState.board, aiMove.row, aiMove.col, gameState.aiPiece)
			if (!result.success) return

			// Draw the AI's piece
			canvasRef.current?.drawPiece(aiMove.row, aiMove.col, gameState.aiPiece)

			// Check for win
			const winResult = checkWin(result.board, aiMove.row, aiMove.col)
			if (winResult.isWin) {
				playSound('lose')
				setGameState(prev => ({
					...prev,
					board: result.board,
					status: 'lost',
					winPath: winResult.path
				}))
				canvasRef.current?.drawWinPath(winResult.path)
				return
			}

			// Check for draw
			if (isBoardFull(result.board)) {
				playSound('draw')
				setGameState(prev => ({
					...prev,
					board: result.board,
					status: 'draw'
				}))
				return
			}

			// Update state
			setGameState(prev => ({
				...prev,
				board: result.board,
				currentTurn: result.nextTurn
			}))
		}, 500) // Small delay to make it feel natural

		return () => clearTimeout(timeoutId)
	}, [gameState.currentTurn, gameState.status, gameState.board, gameState.aiPiece, gameState.difficulty, playSound])

	// Draw initial board when game starts
	useEffect(() => {
		if (gameState.status === 'playing') {
			canvasRef.current?.drawBoard()
		}
	}, [gameState.status])

	const getStatusMessage = () => {
		switch (gameState.status) {
			case 'idle':
				return 'Select difficulty to start'
			case 'playing':
				return gameState.currentTurn === gameState.playerPiece 
					? "Your turn" 
					: "AI is thinking..."
			case 'won':
				return '🎉 You won!'
			case 'lost':
				return '😢 You lost!'
			case 'draw':
				return "🤝 It's a draw!"
		default:
				return ''
		}
	}

	return (
		<div className={`${styles.container} ${styles[theme]}`}>
			<section className={styles.top}>
				<div className={styles.back}>
					<Link to="/main_window" className={styles.leave}>
						<span className={styles.chevron}></span>
						<p className={styles.backText}>Back Home</p>
					</Link>
				</div>
				<h1 className={styles.mainTitle}>SINGLEPLAYER</h1>
			</section>

			<main id={styles.main}>
				<aside id={styles.info}>
					<h2 className={styles.instructions}>Play vs AI</h2>
					<p>
						Challenge the computer in a game of Tic Tac Toe.
						Select your difficulty and try to beat the AI!
					</p>

					<h4 className={gameState.currentTurn === gameState.playerPiece ? styles.turn : styles.inactive}>
						{getStatusMessage()}
					</h4>

					<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
						<h3>Difficulty</h3>
						<Button 
							onClick={() => startGame('easy')} 
							text="😊 Easy" 
						/>
						<Button 
							onClick={() => startGame('medium')} 
							text="🤔 Medium" 
						/>
						<Button 
							onClick={() => startGame('hard')} 
							text="🤖 Hard (Unbeatable)" 
						/>
					</div>

					{gameState.status !== 'idle' && gameState.status !== 'playing' && (
						<Button 
							onClick={() => startGame()} 
							text="🔄 Play Again" 
						/>
					)}

					<button className={styles.btn} onClick={toggleTheme} style={{ marginTop: '1rem' }}>
						Toggle Theme | {theme === 'light' ? '☀️' : '🌑'}
					</button>

					<p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
						You are: <strong style={{ color: '#f00' }}>O (Red)</strong>
						<br />
						AI is: <strong style={{ color: '#0f0' }}>X (Green)</strong>
					</p>
				</aside>

				<CanvasRenderer
					ref={canvasRef}
					width={CANVAS_SIZE}
					height={CANVAS_SIZE}
					boardSize={BOARD_SIZE}
					onCellClick={handleCellClick}
					disabled={gameState.status !== 'playing' || gameState.currentTurn !== gameState.playerPiece}
					id={styles.canvas}
				/>
			</main>
		</div>
	)
}
