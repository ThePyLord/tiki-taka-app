import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DataPayload, MessagePayload, pieceType } from '../../shared/interfaces'
import Button from '../components/Button'
import Piece from '../components/Piece'
import { ThemeContext } from '../components/Theme'
import styles from '../styles/game.module.css'
import { isElectron } from '../utils/electronCheck'

const WIDTH = 166
export default function Welcome() {
	const [userId, setUserId] = useState('')
	const [gameId, setGameId] = useState('')
	const [boardSize, setBoardSize] = useState(0)
	const [cellWidth, setCellWidth] = useState(0)
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
		console.log(`(IN JOIN) The game's id is: ${gameId}`)
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
			if (game.coord) {
				const [centreX, centreY] = game.coord
				const [normX, normY] = normCoords(centreX, centreY)
				ctx.current.lineWidth = 1.3
				const piece = new Piece(ctx.current, game.board[normY][normX] as pieceType)
				piece.drawAt(centreX, centreY, WIDTH / 3)
			}
		}

	}, [userId, gameId, cellWidth, boardSize])

	const render = (ctx: CanvasRenderingContext2D, boardSize: number, cellSize: number) => {
		console.log('Render called, cell width:', cellWidth, 'boardSize:', boardSize)
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
	}/* , [onMessage] */)

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
					<button className={styles.btn} onClick={toggleTheme}>Toggle Theme | {theme === 'light' ? '☀️' : '🌙'}</button>
					<Button onClick={onCreate} text='Create Game' />
					<div id="create">Game ID: {gameId}</div>
					<input type="text" name="game-id" id="game-id" ref={inputRef} />
					<Button onClick={onJoin} text='Join Game' />
				</aside>
				<canvas id={styles.canvas} width="500" height="500" ref={canvasRef} ></canvas>
			</main>
		</div>
	)
}    
