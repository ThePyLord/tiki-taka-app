import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DataPayload, MessagePayload, pieceType } from '../../shared/interfaces'
import Button from '../components/Button'
import Piece from '../components/Piece'
import styles from '../styles/game.module.css'
import { isElectron } from '../utils/electronCheck'

const ThemeContext = React.createContext('dark')

const WIDTH = 166

export default function Welcome() {
	const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
	const [userId, setUserId] = useState('')
	const [gameId, setGameId] = useState('')
	const [boardSize, setBoardSize] = useState(0)
	const [cellWidth, setCellWidth] = useState(0)
	const canvasRef = useRef<HTMLCanvasElement>(null)/* .current */
	const ctx = useRef<CanvasRenderingContext2D>(null)/* .current */
	const inputRef = useRef<HTMLInputElement>(null)/* .current */
	const sockRef = useRef<WebSocket>(null)/* .current */

	const onCreate = () => {
		const payload = {
			type: 'create',
			data: `${userId}`
		}
		console.log('Sending payload: ', payload)
		sockRef.current.send(JSON.stringify(payload))
	}

	const onJoin = () => {
		console.log('in onJoin, the game id is: ', gameId)
		if (!gameId)
			setGameId(inputRef?.current.value.trim())
		const payload = {
			type: 'join',
			data: `${userId},${gameId}`
		}
		console.log('Sending payload: ', payload)
		sockRef.current.send(JSON.stringify(payload))
		setTimeout(() => {
			inputRef.current.value = ''
		}, 1000)
	}

	const onLeave = () => {
		const payload = {
			type: 'leave',
			data: `${userId},${gameId}`
		}
		console.log('Sending payload: ', payload)
		sockRef.current.send(JSON.stringify(payload))
	}

	const onMessage = useCallback((ev: MessageEvent) => {
		const { data, type }: MessagePayload = JSON.parse(ev.data)
		if (type === 'connect') {
			setUserId(data)
			console.log(`User ID: ${userId}`)
		}

		if (type === 'create') {
			const { id } = JSON.parse(data) as DataPayload
			setGameId(id)
			if (isElectron)
				window.api.setClipboard(id)
			else {
				navigator.clipboard.writeText(id)
				// print what was copied to the console
				navigator.clipboard.readText().then(console.log)
			}
		}

		if (type === 'join') {
			const game = JSON.parse(data) as DataPayload
			console.log('board size:', game.board.length)
			console.log('The game id: ', gameId);
			const boardLen = game.board.length
			const cWidth = Math.floor(canvasRef.current.width / boardLen)
			setBoardSize(game.board.length)
			setCellWidth(Math.floor(canvasRef.current.width / boardLen))
			game.players.forEach(() => {
				canvasRef.current.addEventListener('click', handleInput)
				render(ctx.current, boardLen, cWidth)
			})
		}

		if (type === 'move') {
			const game = JSON.parse(data) as DataPayload
			const [centreX, centreY] = game.coord
			const [normX, normY] = normCoords(centreX, centreY)
			ctx.current.lineWidth = 1.3
			const piece = new Piece(ctx.current, game.board[normY][normX] as pieceType)
			piece.drawAt(centreX, centreY, WIDTH / 3)
		}
		console.log('New message event listener added')
	}, [userId, gameId, cellWidth, boardSize])

	const render = (ctx: CanvasRenderingContext2D, boardSize: number, cellSize: number) => {
		console.log('Render called, cell width: ', cellWidth, 'boardSize:', boardSize)
		ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
		ctx.strokeStyle = '#fff'
		ctx.lineWidth = 1.3
		ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)

		for (let i = 0; i < boardSize; i++) {
			ctx.beginPath()
			ctx.moveTo(0, i * cellSize)
			ctx.lineTo(canvasRef.current.width, i * cellSize)
			ctx.stroke()

			ctx.beginPath()
			ctx.moveTo(i * cellSize, 0)
			ctx.lineTo(i * cellSize, canvasRef.current.height)
			ctx.stroke()
		}
		ctx.fillStyle = '#000'
		ctx.save()
	}

	const handleInput = (e: MouseEvent) => {
		const [mouseX, mouseY] = [e.offsetX, e.offsetY]
		const row = Math.floor(mouseY / WIDTH)
		const col = Math.floor(mouseX / WIDTH)
		const cellTop = row * WIDTH
		const cellLeft = col * WIDTH

		const centreX = cellLeft + WIDTH / 2
		const centreY = cellTop + WIDTH / 2
		console.log('gameId in handleInput', gameId)
		const payload: MessagePayload = {
			type: 'move',
			data: `${userId},${gameId},${row},${col},${centreX},${centreY}`
		}
		sockRef.current.send(JSON.stringify(payload))
	}

	useEffect(() => {
		console.log('The user id changed:', userId)
	}, [userId])

	useEffect(() => {
		if (theme === 'dark') {
			document.body.classList.add('dark-mode')
		} else {
			document.body.classList.remove('dark-mode')
		}
		if (canvasRef.current)
			ctx.current = canvasRef.current.getContext('2d')


		sockRef.current = new WebSocket('ws://50.71.103.10:5600')
		sockRef.current.onopen = () => console.log('Connected to server')
	}, [])

	useEffect(() => {
		sockRef.current.addEventListener('message', onMessage)
		return () => {
			sockRef.current.removeEventListener('message', onMessage)
		}
	}, [onMessage])

	function normCoords(x: number, y: number): [number, number] {
		const normX = Math.floor(x / cellWidth)
		const normY = Math.floor(y / cellWidth)
		return [normX, normY]
	}

	return (
		<div id={styles.container}>
			<section className={styles.top}>
				<div className={styles.back}>
					<Link onClick={onLeave} to="/main_window" className={styles.leave}>
						<span className={styles.chevron}></span>
						{/* Back to Home */}
						<p className={styles.backText}>Back Home</p>
					</Link>
				</div>
				<h1 className={styles.mainTitle}>TIC TAC TOE</h1>
			</section>
			<main id={styles.main}>
				<aside id="info">
					<h2 className="instructions">Instructions</h2>
					<p>
						This is a game of Tic Tac Toe. You will be playing against the computer.
						The first player to get three in a linear fashion wins(horizontally, vertically, or diagonally).
					</p>
					<p>
						To make a move, click on an empty square.
					</p>
					<div className={styles.btn}>Toggle Theme</div>
					<Button onClick={onCreate} text='Create Game' />
					<div id="create">Game ID: {gameId}</div>
					<input type="text" name="game-id" id="game-id" ref={inputRef} />
					<Button onClick={onJoin} text='Join Game' />
				</aside>
				<canvas id="canvas" width="500" height="500" ref={canvasRef} ></canvas>
			</main>
		</div>
	)
}    
