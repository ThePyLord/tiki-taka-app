import { Modal } from '../components/Modal'
import { DataPayload, MessagePayload, ModalEnum } from '../../shared/interfaces'
import { SoundsOfTiki } from '../../lib/Music'
import lBozo from '../../assets/audio/draw.mp3'
import wasted from '../../assets/audio/lesgooo.mp3'
import Piece, { pieceType } from '../components/Piece'

const sock = new WebSocket('ws://50.71.103.10:5600')
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')
const create = document.getElementById('create') as HTMLElement
const input = document.getElementById('game-id') as HTMLInputElement
const btnCreate = document.getElementById('create-game') as HTMLButtonElement
const btnJoin = document.getElementById('join-game') as HTMLButtonElement
let userId: string
let gameId: string
let boardSize: number
let cellHeight: number
let cellWidth: number
let cellTop: number
let cellLeft: number

ctx.fillStyle = '#000'
btnCreate.addEventListener('click', () => {
	const payload = {
		type: 'create',
		data: `${userId}`
	}
	sock.send(JSON.stringify(payload))
})

btnJoin.addEventListener('click', () => {
	// const modal = new Modal(ModalEnum.err, 'You must put in a game id')
	if(!gameId) {
		gameId = input.value.trim()
	}
	const payload = {
		type: 'join',
		data: `${userId},${gameId}`
	}
	sock.send(JSON.stringify(payload))
	setTimeout(() => {
		input.value = ''
		input.disabled = true
	}, 1000)
})

sock.onmessage = async ({data}) => {
	const response = JSON.parse(data) as MessagePayload
	// connect to the server
	if(response.type == 'connect') {
		userId = response.data
		console.log(`Connected to server with id: ${userId}`)
	}

	// create game
	if(response.type == 'create') {
		gameId = JSON.parse(response.data).id
		create.innerHTML = `Game ID: ${gameId}`
		// Copy the input to the clipboard
		window.api.setClipboard(gameId)
		// console log the clipboard text
		// console.log('Clipboard content from main process:', await window.api.getClipboard())
	}

	if(response.type == 'join') { 
		const game = JSON.parse(response.data)
		boardSize = game.board.length
		cellHeight = Math.floor(canvas.height / boardSize)
		cellWidth = Math.floor(canvas.width / boardSize)
		game.players.forEach(() => {
			canvas.addEventListener('click', handlePlayerInput)
			render(game.board.length)
		})
	}

	if(response.type == 'move') {
		const game = JSON.parse(response.data) as DataPayload
		const [centreX, centreY] = game.coord
		const [normX, normY] = normCoords(centreX, centreY)
		ctx.lineWidth = 1.3
		const piece = new Piece(ctx, game.board[normY][normX] as pieceType)


		// Attempting to draw a piece without using a loop
		// GREAT SUCCESS!
		if(game.board[normY][normX] == 1) {
			piece.drawAt(centreX, centreY, cellWidth / 3)
		}
		if(game.board[normY][normX] == 2) {
			piece.drawAt(centreX, centreY, cellWidth / 3)
		}
		
	}

	if(response.type == 'win') {
		const game = JSON.parse(response.data) as DataPayload
		const [centreX, centreY] = game.coord
		const [normX, normY] = normCoords(centreX, centreY)
		const clientId = game.players.find(player => player.clientId === userId).clientId
		if(game.winner === clientId) {
			const modal = new Modal(ModalEnum.info, `You won!`)
			setTimeout(() => modal.create(), 4000)
			const babyOnBaby = new SoundsOfTiki(wasted)
			babyOnBaby.play()
		}
		else {
			const modal = new Modal(ModalEnum.info, `You lost!`)
			const bozo = new SoundsOfTiki(lBozo)
			bozo.play()
			setTimeout(() => modal.create(), 4000)
		}
		const piece = new Piece(ctx, game.board[normY][normX] as pieceType)
		if(game.board[normY][normX] == 1) {
			piece.drawAt(centreX, centreY, cellWidth / 3)
		}
		if(game.board[normY][normX] == 2) {
			piece.drawAt(centreX, centreY, cellWidth / 3)
		}
		drawWinPath(game.path)
		canvas.removeEventListener('click', handlePlayerInput)
		setTimeout(() => {
			clearBoard()
			canvas.addEventListener('click', handlePlayerInput)
		}, 3000)
	}

}

sock.close = () => {
	console.log('disconnected')
}


function render(boardSize: number) {
	ctx.strokeStyle = '#fff'
	ctx.lineWidth = 1.3
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	
	for(let i = 0; i < boardSize; i++) {
		ctx.beginPath()
		ctx.moveTo(0, i * cellHeight)
		ctx.lineTo(canvas.width, i * cellHeight)
		ctx.stroke()
		
		ctx.beginPath()
		ctx.moveTo(i * cellWidth, 0)
		ctx.lineTo(i * cellWidth, canvas.height)
		ctx.stroke()
	}
	ctx.fillStyle = '#000'
	ctx.save()
}


const handlePlayerInput = (e: MouseEvent) => {
	const [mouseX, mouseY] = [e.offsetX, e.offsetY]
	const cellWidth = Math.floor(canvas.width / boardSize)
	const cellHeight = Math.floor(canvas.height / boardSize)
	const row = Math.floor(mouseX / cellWidth) // row is horizontal
	const col = Math.floor(mouseY / cellHeight) // col is vertical
	cellTop = col * cellHeight
	cellLeft = row * cellWidth

	const centreX = cellLeft + (cellHeight / 2)
	const centreY = cellTop + (cellWidth / 2)

	const payload = {
		type: 'move',
		data: `${userId},${gameId},${row},${col},${centreX},${centreY}`
	}
	sock.send(JSON.stringify(payload))
}

function normCoords(x: number, y: number) {
	// convert x and y to a normalised coordinate system
	const normX = Math.floor(x / cellWidth)
	const normY = Math.floor(y / cellHeight)
	return [normX, normY]
}


function clearBoard() {
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	render(boardSize)
}

function drawWinPath(path: number[][]) {
	console.log('The path is:', path)
	ctx.strokeStyle = '#2D47A0'
	ctx.lineWidth = 5
	ctx.lineCap = 'round'

	// Check if the path is horizontal or vertical
	ctx.beginPath()
	// Horizontal
	if (path[0][1] === path[1][1]) {
		// Time complexity: O(1) 😈
		// WE'RE NOT THE SAME \\
		ctx.moveTo(
			(cellWidth / 2),
			(path.at(-1)[1] * cellHeight) + (cellHeight / 2)
		)
		ctx.lineTo(
			(path.at(-1)[0] * cellWidth) + (cellWidth / 2),
			(path.at(-1)[1] * cellHeight) + (cellHeight / 2)
		)

	}
	// Vertical
	else if (path[0][0] === path[1][0]) {
		// Time complexity: O(1) 😈
		ctx.moveTo(
			(path[0][0] * cellWidth) + cellWidth / 2, // x
			(path[0][1] * cellHeight) + cellHeight / 2 // y
		)
		ctx.lineTo(
			(path.at(-1)[0] * cellWidth) + cellWidth / 2,
			(path.at(-1)[1] * cellHeight) + cellHeight / 2
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
					ctx.moveTo(x * cellWidth + (cellWidth / 2), y * cellHeight + (cellHeight / 2))
					ctx.lineTo((x + 1) * cellWidth + (cellWidth / 2), (y - 1) * cellHeight + (cellHeight / 2))
				}
			})
		}
		else {
			// posdiag
			path.forEach(([x, y], idx) => {
				if (idx !== path.length - 1) {
					ctx.moveTo(x * cellWidth + (cellWidth / 2), y * cellHeight + (cellHeight / 2))
					ctx.lineTo((x + 1) * cellWidth + (cellWidth / 2), (y + 1) * cellHeight + (cellHeight / 2))
				}
			})
		}
	}
	ctx.stroke()
}