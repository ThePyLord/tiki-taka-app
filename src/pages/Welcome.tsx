import React, { useEffect, useState, useRef, useCallback } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Piece from '../components/Piece'
import { DataPayload, MessagePayload, pieceType } from '../../shared/interfaces'
import '../styles/game.css'

const ThemeContext = React.createContext('dark')

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

	const sock = new WebSocket('ws://50.71.103.10:5600')

	const onMessage = useCallback((ev: MessageEvent) => {
		const ctx = canvasRef.current.getContext('2d')
		const { data, type }: MessagePayload = JSON.parse(ev.data)
		if (type === 'connect') {
			setUserId(data)
			console.log(`User ID: ${data}`)
		}

		if (type === 'create') {
			const { id } = JSON.parse(data) as DataPayload
			console.log('Game ID:', id)
			const gameId = id
			setGameId(gameId)
			window.api.setClipboard(id)
			console.log(`Game ID: ${gameId}`)
		}

		if (type === 'join') {
			console.log('type', type);
			const game = JSON.parse(data) as DataPayload
			console.log('board size:', game.board.length)
			setBoardSize(game.board.length)
			setCellWidth(Math.floor(canvasRef.current.width / boardSize))
			game.players.forEach(() => {
				canvasRef.current.addEventListener('click', handleInput)
				render(ctx, boardSize)
			})
		}

		if (type === 'move') {
			const game = JSON.parse(data) as DataPayload
			const [centreX, centreY] = game.coord
			const [normX, normY] = normCoords(centreX, centreY)
			ctx.lineWidth = 1.3
			const piece = new Piece(ctx, game.board[normY][normX] as pieceType)
			piece.drawAt(centreX, centreY, cellWidth / 3)
		}
		console.log('New message event listener added')
	}, [])

	const render = (ctx: CanvasRenderingContext2D, boardSize: number) => {
		ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
		ctx.strokeStyle = '#fff'
		ctx.lineWidth = 1.3
		ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)

		for (let i = 0; i < boardSize; i++) {
			ctx.beginPath()
			ctx.moveTo(0, i * cellWidth)
			ctx.lineTo(canvasRef.current.width, i * cellWidth)
			ctx.stroke()

			ctx.beginPath()
			ctx.moveTo(i * cellWidth, 0)
			ctx.lineTo(i * cellWidth, canvasRef.current.height)
			ctx.stroke()
		}
		ctx.fillStyle = '#000'
		ctx.save()
	}

	// function render(ctx: CanvasRenderingContext2D, boardSize: number) {
	// }

	const handleInput = (e: MouseEvent) => {
		const [mouseX, mouseY] = [e.offsetX, e.offsetY]
		const row = Math.floor(mouseY / cellWidth)
		const col = Math.floor(mouseX / cellWidth)
		const cellTop = row * cellWidth
		const cellLeft = col * cellWidth

		const centreX = cellLeft + cellWidth / 2
		const centreY = cellTop + cellWidth / 2

		const payload: MessagePayload = {
			type: 'move',
			data: `${userId}, ${gameId}, ${row}, ${col}, ${centreX}, ${centreY}`
		}
		sock.send(JSON.stringify(payload))
	}

	useEffect(() => {
		if (theme === 'dark') {
			document.body.classList.add('dark-mode')
		} else {
			document.body.classList.remove('dark-mode')
		}
		// const ctx = canvasRef.current.getContext('2d')
		if (canvasRef.current) {
			ctx.current = canvasRef.current.getContext('2d')
			ctx.current.fillStyle = '#000'
		}
		console.log('The canvas fillstyle is:', ctx.current.fillStyle)
	}, [])

	useEffect(() => {
		sock.addEventListener('message', onMessage)

		// return () => {
		// 	sock.removeEventListener('message', onMessage)
		// }
	}, [onMessage])

	function normCoords(x: number, y: number): [number, number] {
		const normX = Math.floor(x / cellWidth)
		const normY = Math.floor(y / cellWidth)
		return [normX, normY]
	}

	return (
		<div className='container'  >
			<h1 style={{ padding: 0 }}>TIC TAC TOE</h1>
			<main id="main">
				<aside id="info">
					<h2 className="instructions">Instructions</h2>
					<p>
						This is a game of Tic Tac Toe. You will be playing against the computer.
						The first player to get three in a linear fashion wins(horizontally, vertically, or diagonally).
					</p>
					<p>
						To make a move, click on an empty square.
					</p>
					<div className="btn">Toggle Theme</div>
					<button
						onClick={() => {
							const payload = {
								type: 'create',
								data: `${userId}`
							}
							console.log('Sending payload: ', payload)
							sock.send(JSON.stringify(payload))
						}}
					>
						Create Game
					</button>
					<div id="create">Game ID: {gameId}</div>
					<input type="text" name="game-id" id="game-id" ref={inputRef} />
					<button
						id="join-game"
						onClick={() => {
							if (!gameId)
								setGameId(inputRef?.current.value.trim())
							const payload = {
								type: 'join',
								data: `${userId}, ${gameId}`
							}
							console.log('Sending payload: ', payload)
							sock.send(JSON.stringify(payload))
							setTimeout(() => {
								inputRef.current.value = ''
							}, 10000)
						}}
					>
						Join Game
					</button>
				</aside>
				<canvas id="canvas" width="500" height="500" ref={canvasRef} ></canvas>
			</main>
			<div className="back">
				<Link to="/main_window">Back to Home</Link>
			</div>
		</div>
	)
}    
