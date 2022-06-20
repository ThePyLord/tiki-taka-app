import { DataPayload, MessagePayload } from "../shared/interfaces"
import { Game } from "../src/components/Game"

// const socket = new WebSocket('ws://localhost:5003')

// const payload: MessagePayload = {
// 	type: 'message',
// 	data: 'Hello from client'
// }
// socket.onopen = () => {
// 	socket.send(JSON.stringify(payload))
// }

// socket.onmessage = (msg) => {
// 	let response: MessagePayload = JSON.parse(msg.data)
// 	console.log(response.data)

// 	response = {
// 		type: 'message',
// 		data: 'Received message from server'
// 	}

// 	socket.send(JSON.stringify(response))
// 	if(response.type == 'join') {
// 		// TODO
// 	}
// }

interface ClientOpts {
	url: string
}

type event = MessagePayload['type']
class Client {
	socket: WebSocket;
	constructor({url}: ClientOpts) {
		this.socket = new WebSocket(url)
		this.socket.onopen = () => {
			console.log('Connected to server')
		}
	}

	on(event: event, cb: (data: any) => void) {
		this.socket.onmessage = (msg) => {
			let response: MessagePayload = JSON.parse(msg.data)
			// if(response typeof MessagePayload) {
				// cb(response)
			// }

		}	
	}

	private send(data: any) {
		this.socket.send(JSON.stringify(data))
	}

	close() {
		this.socket.close()
	}

	join(gameId: string) {
		this.send({
			type: 'join',
			data: gameId
		})
	}
}


export default Client