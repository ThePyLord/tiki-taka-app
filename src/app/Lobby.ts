import { IHash, Lobby } from '../../shared/interfaces'

export class LobbyService implements Lobby {
	id: string
	name: string
	players: IHash
	constructor(id: string, name: string) {
		this.id = id
		this.name = name
		this.players = {}
	}
}