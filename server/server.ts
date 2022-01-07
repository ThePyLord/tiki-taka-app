import * as dotenv from 'dotenv'
import ws, { Server } from 'ws'
import { Client, IHash, MessagePayload } from './interfaces'
import { Game } from '../src/components/Game'
import { randomUUID } from 'crypto'

dotenv.config()
const PORT = Number(process.env.PORT) || 5000

const MAX_CLIENTS_PER_CONN = 2

const server = new Server({port: PORT})
const clients: Client[] = []
const clientHash: IHash = {}
const games = new Map<string, Game>()

const clientTable = new Map<string, Client>()
let clientId = 0

server.on('connection', (sock) => {
	console.log('New connection')


	// let theHash = hash('hello')
	const clientID = randomUUID()
	clientHash[clientID] = {
		client: sock,
	}
	
	clientTable.set(clientID, {client: sock})

	if(clients.length >= MAX_CLIENTS_PER_CONN) {
		sock.send('Too many clients')
		sock.close()
		return
	}

	const responsePayLoad: MessagePayload = {
		type: 'message',
		data: 'Welcome to the server, here\'s the news of today, ' + news[Math.floor(Math.random() * news.length)]
	}
	const client: Client = {client: sock, id: clientId}
	clients.push(client)
	clientId++
	
	sock.send(JSON.stringify(responsePayLoad))
	sock.on('message', message => {
		let payload = JSON.parse(message.toString()) as MessagePayload
		
		clients.forEach(({client, id}) => {
			payload = {
				type: payload.type,
				data: 'Message from ' + id + ': ' + payload.data
			}
			if(sock !== client) {
				client.send(JSON.stringify(payload))
			}
		})


		// Join a game
		if(payload.type === 'join') {
			const game = games.get(payload.data)
			if(game) {
				game.addPlayer(client)
			}
		}
	})

	sock.on('close', () => {
		console.log('Client disconnected')

		clients.filter(client => client.client !== sock)
		clientTable.delete(clientID)
		delete clientHash[clientID]
	})

})

server.on('listening', () => {
	console.log('listening on port:', PORT)
})
// Random text to send as test messages
const news = [
	"Borussia Dortmund wins German championship",
	"Tornado warning for the Bay Area",
	"More rain for the weekend",
	"Android tablets take over the world",
	"iPad2 sold out",
	"Nation's rappers down to last two samples"
]



// function hash(key:string) {
// 	let hashCode = 0
// 	for(let i = 0; i < key.length; i++) {
// 		hashCode = (hashCode << 5) + hashCode + key.charCodeAt(i)
// 	}
// 	return hashCode % TABLE_SIZE
// }
