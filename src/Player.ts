type AIDiff = "Easy" | "Hard"

interface IPlayer {
	name: string,
	id?: string | number
	isAI: boolean,
	difficulty?: AIDiff 
}

export default class Player{
	private name: string
	private id: string | number
	private isAI: boolean
	private difficulty: AIDiff

	constructor(pInfo: IPlayer) {
		this.name = pInfo.name
		this.id = pInfo.id || 0
		this.isAI = pInfo.isAI
		if(pInfo.isAI) {
			this.difficulty = pInfo.difficulty || null
		}
	}

	
	get AIDifficulty() : AIDiff {
		return this.difficulty || null
	}
	
}

const me = new Player({name: 'Victor', isAI: true, difficulty: "Easy" })