import { pieceType } from "./components/Piece";
// import { Game } from "./components/Game";

type AIDiff = "Easy" | "Hard";

interface IPlayer {
	name: string;
	isAI: boolean;
	difficulty?: AIDiff;
}

export default class Player {
	private name: string
	private isAI: boolean
	private difficulty: AIDiff

	constructor(pInfo: IPlayer) {
		this.name = pInfo.name;
		this.isAI = pInfo.isAI;
		if (pInfo.isAI && pInfo.difficulty) {
			this.difficulty = pInfo.difficulty
		} else if (pInfo.isAI && !pInfo.difficulty) {
			this.difficulty = "Easy";
		}
	}

	get AIDifficulty(): AIDiff {
		return this.difficulty || null;
	}

	makeMove(board: number[][]): number[] {
		// Get free spots on the board and decide a move
		const spots = [];
		for (let i = 0; i < board.length; i++) {
			for (let j = 0; j < board.length; j++) {
				if (board[i][j] === null) spots.push([i, j]);
			}
		}
		// MINIMAX IMPLEMENTATION
		if(this.isAI) {
			let bestScore = -Infinity
			let bestMove = null
			for (let i = 0; i < board.length; i++) {
				for(let j = 0; j < board[i].length; j++) {
					if(!board[i][j]) {
						// For now, the AI's piece is going to be the nought
						board[i][j] = pieceType.nought
						const score = this.minimax(board, 0, false)
						board[i][j] = null // Cancel the move that was just done
						if(score > bestScore) {
							bestScore = score
							bestMove = {i, j}
						}
					}
				}
			}
			board[bestMove.i][bestMove.j] = pieceType.nought
		}
		const rand = Math.floor(Math.random() * spots.length)
		if(spots.length > 0) {
			return spots[rand]
		}
		return null;
	}

	minimax(board: number[][], depth: number, isMaximizing: boolean): number {
		const winner = checkWin(board)
		if (winner !== null) { 
			return winner.lastPlayer
		}
		if(isMaximizing) {
			let bestScore = -Infinity
			for (let i = 0; i < board.length; i++) {
				for(let j = 0; j < board[i].length; j++) {
					if(!board[i][j]) {
						// For now, the AI's piece is going to be the nought
						board[i][j] = pieceType.nought
						const score = this.minimax(board, depth + 1, false)
						board[i][j] = null // Cancel the move that was just done
						bestScore = Math.max(score, bestScore)
					}
				}
			}
			return bestScore
		}
		else {
			let bestScore = Infinity
			for (let i = 0; i < board.length; i++) {
				for(let j = 0; j < board[i].length; j++) {
					if(!board[i][j]) {
						// For now, the AI's piece is going to be the nought
						board[i][j] = pieceType.cross
						const score = this.minimax(board, depth + 1, true)
						board[i][j] = null // Cancel the move that was just done
						bestScore = Math.min(score, bestScore)
					}
				}
			}
			return bestScore
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	score(_board: number[][]): number {
		throw new Error("Method not implemented.");
	}
}

const player1 = new Player({
	name: "Player 1",
	isAI: false,
});

const player2 = new Player({
	name: "Player 2",
	isAI: true,
	difficulty: "Easy",
});

// NOT WORKING PROPERLY
const checkWin = (board: number[][]) => {
	const res = {axis: '', lastPlayer: -1 }
	// Check rows
	const rows = board.every((row) => row.every((cell) => cell === row[0]))
	if (rows){ 
		res.axis = 'row'
		// res.lastPlayer = board.map((row) => row
		// set res.lastPlayer to the last player that wins the row
		res.lastPlayer = board.filter((row) => row.every((cell) => cell === row[0]))[0][0]
		return res
	}
	
	// Check columns
	const cols = board.every((col, idx) => col[idx] === col[0])
	if(cols) {
		res.axis = 'col'
		res.lastPlayer = board.filter((col, idx) => col[idx] === col[0])[0][0]
		return res
	}

	// Check diagonals
	let diag = board.every((_, idx) => board[idx][idx] === board[0][0])
	
	if (diag) {
		res.axis = 'diag'
		res.lastPlayer = board.filter((_, idx) => board[idx][idx] === board[0][0])[0][0]
		return res
	}
	diag = board.every((_, idx) => board[idx][board.length - 1 - idx] === board[0][board.length - 1])
	if (diag){
		res.axis = 'diag'
		res.lastPlayer = board.filter((_, idx) => board[idx][board.length - 1 - idx] === board[0][board.length - 1])[0][0]
		return res
	}
	if(board.every((row) => row.every((cell) => cell !== null))) {
		res.axis = 'draw'
		return res
	}
	return null
}