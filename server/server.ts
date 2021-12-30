// Create a UDP style server
import dgram from 'dgram'
import assert from 'assert'

// I believe the server will have to be multicasting to the client(s)
// The client will have to be listening for the server's messages
// The server will have to be listening for the client's messages
const news = [
	"Borussia Dortmund wins German championship",
	"Tornado warning for the Bay Area",
	"More rain for the weekend",
	"Android tablets take over the world",
	"iPad2 sold out",
	"Nation's rappers down to last two samples"
 ]

class Server {
	private readonly server: dgram.Socket
	private clients: dgram.Socket[] = []

	/**
	 * Creates the server
	 * 
	 */
	constructor() {
		this.server = dgram.createSocket('udp4')
		this.server.on('error', (err) => {
			console.error(`server error:\n${err.stack}`)
			this.server.close()
		})
	}

	public addClient(client: dgram.Socket) {
		this.clients.push(client)
	}

	public start(port: number) {
		const outgoingMsg = Buffer.from(news[Math.floor(Math.random() * news.length)])
		this.server.on('message', (msg, rinfo) => {

			console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`)
			this.server.send(outgoingMsg, rinfo.port, rinfo.address, (err) => {
				if (err) throw err
				console.log(`server sent: ${outgoingMsg}`)
			})
		})

		this.server.on('listening', () => {
			const address = this.server.address()
			console.log(`server listening on ${address.address}:${address.port}`)
		})

		this.server.bind(port)
	}
}

new Server().start(9000)
