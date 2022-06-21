import { randomUUID } from 'crypto'
import * as dotenv from 'dotenv'
import { Server } from 'ws'
import { GameState, IHash, MessagePayload, pieceType } from '../shared/interfaces/index'

dotenv.config()
const PORT = Number(process.env.OUT_PORT) || 5600
const MAX_CLIENTS_PER_CONN = 2
const server = new Server({ port: PORT, host: '0.0.0.0' })
const clientHash = {} as IHash
const games: GameState = {}
let payload: MessagePayload = {
	type: 'message',
	data: 'Too many clients connected'
}
const played: string[] = []
server.on('connection', (sock) => {
	const clientID = randomUUID()
	clientHash[clientID] = {
		id: clientID,
		sock
	}

	payload = {
		type: 'connect',
		data: clientID
	}
	sock.send(JSON.stringify(payload))
	sock.on('message', message => {
		let response = JSON.parse(message.toString()) as MessagePayload
		if(response.type == 'connect') {
			const data = JSON.parse(response.data)
			console.log('User connected:', data.userName)
			clientHash[data.userId].alias = data.userName
		}
		// Create a game
		if (response.type === 'create') {
			const gameId = randomUUID()
			const connId = response.data
			// console.log('The payload is:', response)
			// Initialize a new game
			games[gameId] = {
				id: gameId,
				board: createBoard(3),
				players: [],
				winner: null,
				playerTurn: null,
				coord: [null, null],
			}

			// Send the game state to the client
			response = {
				type: 'create',
				data: JSON.stringify(games[gameId])
			}
			// console.log('The game is:', games[gameId])
			clientHash[connId].sock.send(JSON.stringify(response))
		}

		// Join a game
		if (response.type === 'join') {
			// console.log('The payload is:', response)
			const [clientId, gameId] = response.data.split(',')
			if (games[gameId]) {
				const game = games[gameId]
				// console.log('game exists.')
				game.players.forEach(p => {
					if (p.clientId === clientId) {
						console.log('This client is already in the game')
					}
				})
				game.players.push({
					clientId,
					piece: game.players.length % 2 ? pieceType.cross : pieceType.nought,
					alias: clientHash[clientId].alias
				})

				if (game.players.length > MAX_CLIENTS_PER_CONN) return
				if (game.players.length == MAX_CLIENTS_PER_CONN) {
					game.playerTurn = game.players[0].piece
					console.log('Starting with: ', game.playerTurn, 'client is: ', clientId, 'piece is: ', game.players[0].piece)
					update()
				}
				response = {
					type: 'join',
					data: JSON.stringify(game)
				}
				console.log('sending payload to ', game.players)
				game.players.forEach(p => {
					clientHash[p.clientId].sock.send(JSON.stringify(response))
				})
			}
		}

		if (response.type == 'move') {
			const [clientId, gameId, x, y, centreX, centreY] = response.data.split(',')
			const game = games[gameId]
			// For some reason passing in the row as x and column as y
			// causes the board to transpose the coordinates
			const [row, col] = [parseInt(y), parseInt(x)]
			if (game) {
				played.push(clientId)

				const player = game.players.find(p => p.clientId === clientId)
				if (game.board[row][col] === null) {
					game.coord = [parseInt(centreX), parseInt(centreY)]
					if (played.at(-1) !== played.at(-2)) {
						// Refuse to play if the last two players played the same move
						game.board[row][col] = player.piece
						game.playerTurn = (game.playerTurn + 1) % 2
					}
					console.log(player.alias, 'played at', [row, col])
					// console.log(game.players.at(-1).alias, 'clicked', [row, col])
					// TODO: Use this to maintain the turn instead of the above
					if(game.playerTurn === player.piece) {
						// game.board[row][col] = player.piece
						// game.playerTurn = (player.piece - 1) % 2
					}
					// console.log(clientID, 'clicked', [row, col])
					const [isWin, path] = checkWin(row, col, game.board)
					if (isWin) {
						console.log('The game has been won:', checkWin(row, col, game.board))
						game.winner = game.players.find(p => p.clientId === clientId).clientId
						game.path = path.map(coords => coords.reverse())
						const payload = {
							type: 'win',
							data: JSON.stringify(game)
						}
						game.players.forEach(p => {
							clientHash[p.clientId].sock.send(JSON.stringify(payload))
						})

						// clear the board
						game.board = createBoard(3)
						game.winner = null
						game.playerTurn = null
						game.coord = [null, null]
						console.log('The game has been reset:', game.board)
					}
					else if (fullBoard(game.board) && !checkWin(row, col, game.board)) {
						console.log('The game has been drawn')
						game.board = createBoard(3)
						game.winner = null
						game.playerTurn = null
						game.coord = [null, null]
						console.log('The game has been reset:', game.board)
					}
				}
			}
		}
		if(response.type == 'leave') {
			const [clientId, gameId] = response.data.split(',')
			const game = games[gameId]
			if (game) {
				const player = game.players.find(p => p.clientId === clientId)
				if (player) {
					game.players = game.players.filter(p => p.clientId !== clientId)
					if (game.winner === clientId) {
						game.winner = null
					}
					// if (game.playerTurn === clientId) {
					// 	game.playerTurn = null
					// }
					if (game.players.length === 0) {
						delete games[gameId]
						console.log('The game has been deleted')
					}
					clientHash[clientId].sock.close(1000, `Player: ${player.alias} has left the game`)
					delete clientHash[clientId]
					console.log('Player left:', clientId)

				}
			}
		}
	})
	sock.on('close', (code, reason) => {
		// find the game the client is in
		// remove the client from the game
		// if the game is empty, delete the game
		// send the game state to the client
		console.log('Client disconnected:', code, reason.toString())
		console.log('Time:', new Date().toLocaleString())
	})

})

server.on('listening', () => {
	console.log('listening on port:', PORT)
})

function createBoard(size: number): number[][] {
	const board = size > 3 ? new Array(size) : new Array(3)
	for (let i = 0; i < board.length; i++) {
		board[i] = new Array(size).fill(null)
	}
	return board
}


function update() {
	for (const jeu of Object.keys(games)) {
		const game = games[jeu]
		const payload = {
			type: 'move',
			data: JSON.stringify(game)
		}

		game.players.forEach(({ clientId }) => {
			clientHash[clientId].sock.send(JSON.stringify(payload))
		})
	}
	setTimeout(update, 300)
}

function checkWin(x: number, y: number, board: number[][]): [boolean, number[][]] {
	let gameWon = false
	const cols = board.map(arr => arr[y])
	const rows = board[x].map(arr => arr)
	let winPath: number[][] = []
	if (cols.every(cell => cell == cols[0] && cell !== null)) {
		winPath = board.map((_, idx) => [idx, y])
		gameWon = true
	}

	if (rows.every(cell => cell == rows[0] && cell !== null)) {
		winPath = board.map((_, idx) => [x, idx])
		gameWon = true
	}

	const diag = board.map((row, i) => row[i])
	if (diag.every(cell => cell == diag[0] && cell !== null)) {
		winPath = board.map((_, idx) => [idx, idx])
		gameWon = true
	}
	const antidiag = board.map((row, i) => row[row.length - 1 - i])
	if (antidiag.every(cell => cell == antidiag[0] && cell !== null)) {
		winPath = board.map(arr => arr.reverse())
		gameWon = true
	}

	return [gameWon, winPath]
}


function fullBoard(board: number[][]) {
	let full = true
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board.length; j++) {
			if (board[i][j] === null) {
				full = false
			}
		}
	}
	return full
}

// Create a function that clear the board 