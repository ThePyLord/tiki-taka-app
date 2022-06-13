import { pieceType } from '../../src/components/Piece'
import ws from "ws"

type payloadType = 'connect' | 'join' | 'leave' | 'create' | 'message' | 'move' | 'win'
export { pieceType }
export enum ModalEnum {
	err,
	info
}

export interface MessagePayload {
	readonly type: payloadType
	data: string 
}

export interface GameData extends MessagePayload {
	state: GameState
}

export interface IHash {
	[key: string]: {
		id: string
		sock: ws
	}
}

export interface GameState {
	[key: string]: DataPayload
}

export interface DataPayload {
	id: string
	board: number[][]
	winner: string
	players: { piece: pieceType, clientId: string }[]
	playerTurn: pieceType
	coord: [number, number]
	path?: number[][]
}

// Might be useful for the future
// where there'll be a lot of games
export interface Lobby {
	id: string
	name: string
	players: IHash
}