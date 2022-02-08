import ws from "ws"

export interface Client {
	client: ws
	id: number
}

export interface Message {
	data: string
	from: number
}
