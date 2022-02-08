import ws from "ws"

export interface Client {
	client: ws
	id?: number
}


type payloadType = 'message' | 'join' | 'leave' | 'create'

export interface MessagePayload {
	readonly type: payloadType
	data: string
}

export interface IHash {
	[key: string ]: Client
}

export interface Lobby {
	id: string
	name: string
	players: IHash
}