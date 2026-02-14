export enum pieceType {
	nought = 1,
	cross = 2
}

export type Board = (pieceType | null)[][]
export type Coord = [number, number]
export type WinPath = Coord[]

export interface GameResult {
	isWin: boolean
	path: WinPath
}

export interface MoveResult {
	board: Board
	success: boolean
	nextTurn: pieceType
}
