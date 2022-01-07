import ws from "ws"

export interface Client {
	client: ws
	id?: number
}


type payloadType = 'message' | 'join' | 'leave'

export interface MessagePayload {
	readonly type: payloadType
	data: string
}

export interface IHash {
	[key: string | number]: Client
}