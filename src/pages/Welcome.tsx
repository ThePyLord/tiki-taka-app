import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SoundsOfTiki } from '../../lib/Music'
import { DataPayload, MessagePayload, pieceType } from '../../shared/interfaces'
import Button from '../components/Button'
import Piece from '../components/Piece'
import Modal from '../components/Modal'
import { ThemeContext } from '../components/Theme'
import { isElectron } from '../utils/electronCheck'
import { /* drawWinPath, */ fullBoard } from '../utils/boardUtils'
import kumalala from '../../assets/audio/lesgooo.mp3'
import lBozo from '../../assets/audio/wasted.mp3'
import styles from '../styles/game.module.css'

const WIDTH = 166

export default function Welcome() {
	const [userId, setUserId] = useState('')
	const [username, setUsername] = useState('')
	const [gameId, setGameId] = useState('')
	const [boardSize, setBoardSize] = useState(0)
	const [cellWidth, setCellWidth] = useState(0)
	const [sounds, setSounds] = useState({
		kumalala: new SoundsOfTiki(kumalala),
		lBozo: new SoundsOfTiki(lBozo),
	})
	const [turn, setTurn] = useState(false)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const ctx = useRef<CanvasRenderingContext2D>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const sockRef = useRef<WebSocket>(null)
	const { theme, toggleTheme } = useContext(ThemeContext)

	const onCreate = () => {
		const payload = {
			type: 'create',
			data: `${userId}`
		}
		console.log('Sending payload: ', payload)
		sockRef.current.send(JSON.stringify(payload))
	}

	const onJoin = () => {
		if (!gameId)
			setGameId(inputRef?.current.value.trim())

		const inputVal = inputRef?.current.value.trim()
		const payload = {
			type: 'join',
			data: `${userId},${inputVal || gameId}`
		}
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
	function drawWinPath(path: number[][]) {
		console.log('The path is:', path)
		ctx.current.strokeStyle = '#2D47A0'
		ctx.current.lineWidth = 5
		ctx.current.lineCap = 'round'
	
		// Check if the path is horizontal or vertical
		ctx.current.beginPath()
		// Horizontal
		if (path[0][1] === path[1][1]) {
			// Time complexity: O(1) 😈
			// WE'RE NOT THE SAME \\
			ctx.current.moveTo(
				(cellWidth / 2),
				(path.at(-1)[1] * cellWidth) + (cellWidth / 2)
			)
			ctx.current.lineTo(
				(path.at(-1)[0] * cellWidth) + (cellWidth / 2),
				(path.at(-1)[1] * cellWidth) + (cellWidth / 2)
			)
	
		}
		// Vertical
		else if (path[0][0] === path[1][0]) {
			// Time complexity: O(1) 😈
			ctx.current.moveTo(
				(path[0][0] * cellWidth) + cellWidth / 2, // x
				(path[0][1] * cellWidth) + cellWidth / 2 // y
			)
			ctx.current.lineTo(
				(path.at(-1)[0] * cellWidth) + cellWidth / 2,
				(path.at(-1)[1] * cellWidth) + cellWidth / 2
			)
		}
		else {
			// Convoluted antidiagonal check
			// Basically checking if the last item in the path matches the reverse of the first
			// e.g [0, 2] == [2, 0](in reverse)
			if (path.at(-1)
				.map(item => item)
				.reverse()
				.every((val, idx) => val === path[0][idx])) {
				path.forEach(([x, y], idx) => {
					if (idx !== path.length - 1) {
						ctx.current.moveTo(x * cellWidth + (cellWidth / 2), y * cellWidth + (cellWidth / 2))
						ctx.current.lineTo((x + 1) * cellWidth + (cellWidth / 2), (y - 1) * cellWidth + (cellWidth / 2))
					}
				})
			}
			else {
				// posdiag
				path.forEach(([x, y], idx) => {
					if (idx !== path.length - 1) {
						ctx.current.moveTo(x * cellWidth + (cellWidth / 2), y * cellWidth + (cellWidth / 2))
						ctx.current.lineTo((x + 1) * cellWidth + (cellWidth / 2), (y + 1) * cellWidth + (cellWidth / 2))
					}
				})
			}
		}
		ctx.current.stroke()
	}
	
	const onMessage = useCallback((ev: MessageEvent) => {
		const { data, type }: MessagePayload = JSON.parse(ev.data)
		if (type === 'connect') {
			setUserId(data)
			const userName = sessionStorage.getItem('name')
			setUsername(userName)
			const payload = {
				type: 'connect',
				data: {
					userId: data,
					userName: userName
				}
			}
			sockRef.current.send(JSON.stringify(payload, (key, val) => val))
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
			console.log('The game id: ', gameId)
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
			const player = game.players.find(p => p.clientId == userId)
			setTurn(game.playerTurn === player.piece)
			if (game.coord) {
				const [centreX, centreY] = game.coord
				const [normX, normY] = normCoords(centreX, centreY)
				ctx.current.lineWidth = 1.3
				const piece = new Piece(ctx.current, game.board[normY][normX] as pieceType)
				piece.drawAt(centreX, centreY, WIDTH / 3)
			}
			// Check if the board is filled 
			if (fullBoard(game.board)) {
				canvasRef.current.removeEventListener('click', handleInput)
				setTimeout(() => {
					clearBoard()
					canvasRef.current.addEventListener('click', handleInput)
				}, 3000)
			}
		}

		if (type === 'win') {
			const game = JSON.parse(data) as DataPayload
			const [centreX, centreY] = game.coord
			const [normX, normY] = normCoords(centreX, centreY)
			const piece = new Piece(ctx.current, game.board[normY][normX] as pieceType)
			const clientId = game.players.find(p => p.clientId == userId).clientId
			if (game.winner === clientId) {
				const kumala = new SoundsOfTiki(kumalala)
				kumala.play()
			}
			else {
				const savesta = new SoundsOfTiki(lBozo)
				savesta.play()
			}
			piece.drawAt(centreX, centreY, cellWidth / 3)
			drawWinPath(game.path)
			canvasRef.current.removeEventListener('click', handleInput)
			setTimeout(() => {
				clearBoard()
				console.log('adding click after win');
				canvasRef.current.addEventListener('click', handleInput)
			}, 3000)
			Object.values(sounds).forEach(snd => snd.stop())
		}

	}, [userId, gameId, cellWidth, boardSize])

	const render = (ctx: CanvasRenderingContext2D, boardSize: number, cellSize: number) => {
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

	const clearBoard = () => {
		ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
		render(ctx.current, boardSize, cellWidth)
	}

	const handleInput = (e: MouseEvent) => {
		const [mouseX, mouseY] = [e.offsetX, e.offsetY]
		const row = Math.floor(mouseX / WIDTH)
		const col = Math.floor(mouseY / WIDTH)
		const cellTop = col * WIDTH
		const cellLeft = row * WIDTH

		const centreX = cellLeft + WIDTH / 2
		const centreY = cellTop + WIDTH / 2
		// new data payload to be used in upcoming version
		const data = {
			userId: userId,
			gameId: gameId,
			coord: [centreX, centreY],
			cellCoord: [row, col]
		}
		const payload: MessagePayload = {
			type: 'move',
			data: `${userId},${gameId},${row},${col},${centreX},${centreY}`
		}
		sockRef.current.send(JSON.stringify(payload))
	}

	useEffect(() => {
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
	
	// useEffect(() => {
	// 	// destroy the sounds when the component is unmounted
	// 	return () => {
	// 		Object.values(sounds).forEach(s => s.destroy())
	// 	}
	// }, [sounds])
	function normCoords(x: number, y: number): [number, number] {
		const normX = Math.floor(x / cellWidth)
		const normY = Math.floor(y / cellWidth)
		return [normX, normY]
	}

	return (
		<div className={`${styles.container} ${styles[`${theme}`]}`} >
			<section className={styles.top}>
				<div className={styles.back}>
					<Link onClick={onLeave} to="/main_window" className={styles.leave}>
						<span className={styles.chevron}></span>
						<p className={styles.backText}>Back Home</p>
					</Link>
				</div>
				<h1 className={styles.mainTitle}>TIC TAC TOE</h1>
			</section>
			<main id={styles.main}>
				<aside id={styles.info}>
					<h2 className={styles.instructions}>Instructions</h2>
					<p>
						This is a game of Tic Tac Toe. You will be playing against the computer.
						The first player to get three in a linear fashion wins(horizontally, vertically, or diagonally).
					</p>
					<p>
						To make a move, click on an empty square.
					</p>
					<h3>Connected as {username}</h3>
					<h4 className={turn ? styles.turn : styles.inactive}>{turn ? `It's your turn` : `Wait for the other player to make a move`}</h4>
					<button className={styles.btn} onClick={toggleTheme}>Toggle Theme | {theme === 'light' ? '☀️' : '🌑'}</button>
					<Button onClick={onCreate} text='Create Game' />
					<div id={styles.create}>Game ID: {gameId}</div>
					<input type="text" name="game-id" id="game-id" ref={inputRef} />
					<Button onClick={onJoin} text='Join Game' />
				</aside>
				<canvas id={styles.canvas} width="500" height="500" ref={canvasRef} ></canvas>
			</main>
		</div>
	)
}    
