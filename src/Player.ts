import Piece, { pieceType } from "./components/Piece"

type AIDiff = "Easy" | "Hard"

interface IPlayer {
	name: string,
	id?: string | number
	isAI: boolean,
	difficulty?: AIDiff 
}

export default class Player{
	private name: string
	private id: string | number
	private isAI: boolean
	private difficulty: AIDiff

	constructor(pInfo: IPlayer) {
		this.name = pInfo.name
		this.id = pInfo.id || 0
		this.isAI = pInfo.isAI
		if(pInfo.isAI && pInfo.difficulty) {
			this.difficulty = pInfo.difficulty
		}
		else if(pInfo.isAI && !pInfo.difficulty) {
			this.difficulty = "Easy"
		}
	}

	
	get AIDifficulty() : AIDiff {
		return this.difficulty || null
	}
	
	makeMove(board: number[][]): number[] {
		// Get free spots on the board and decide a move
		const spots = []
		for(let i = 0; i < board.length; i++) {
			for(let j = 0; j < board.length; j++) {
				if(board[i][j] === null)
					spots.push([i, j])
			}
		}
		const rand = Math.floor(Math.random() * spots.length)
		board[spots[rand][0]][spots[rand][1]] = Math.random() > 0.5 ? pieceType.nought : pieceType.cross
		return spots[rand]
	}
}

