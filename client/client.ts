import { MessagePayload } from "../server/interfaces"
import { Game } from "../src/components/Game"

const socket = new WebSocket('ws://localhost:5003')

const payload: MessagePayload = {
	type: 'message',
	data: 'Hello from client'
}
socket.onopen = () => {
	socket.send(JSON.stringify(payload))
}

socket.onmessage = (msg) => {
	let response: MessagePayload = JSON.parse(msg.data)
	console.log(response.data)

	response = {
		type: 'message',
		data: 'Received message from server'
	}

	socket.send(JSON.stringify(response))
	if(response.type == 'join') {
		// TODO
	}
}
