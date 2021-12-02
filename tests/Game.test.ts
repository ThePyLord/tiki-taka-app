import { Game } from '../src/components/Game'

// Dummy test
test('should equal two', () => {
	expect(1 + 1).toBe(2)
})

describe('Game suite', () => {
	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D
	let game: Game

	beforeEach(() => {
		document.body.innerHTML += '\
		<canvas id="canvas" width="500" height="500"></canvas>\
		<p>Hello World</p>\
		'
		canvas = document.getElementById('canvas') as HTMLCanvasElement
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D
		
	})


	test('should create a game', () => {
		game = new Game(canvas, ctx)
		expect(game).toBeDefined()
	})

	test('should render game board', () => {
		game = new Game(canvas, ctx)
		// const run = 
		expect(game.run()).toHaveBeenCalled()
	})
	
		
})
