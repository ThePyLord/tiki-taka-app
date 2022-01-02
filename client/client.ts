import dgram from 'dgram'

class Client {
	private client: dgram.Socket
	private port: number
	constructor(port: number) {
		this.client = dgram.createSocket('udp4')
		this.client.on('error', err => {
			console.error(`Error creating client: ${err.message}`)
		})
		this.port = port
	}

}


const mine = new Client(8080)
