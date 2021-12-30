import { Game } from '../src/components/Game'

describe('Testing different components of the game', () => {
	let game: Game
	beforeAll(() => {
		const gameCanvas = document.getElementById('canvas') as HTMLCanvasElement
		const ctx = gameCanvas.getContext('2d')
		game = new Game(gameCanvas, ctx)
	})
	it('Should ensure the board is clear', () =>{
		Game.board.every(val => val.every(p => p === null || p === undefined))	
	})
})
