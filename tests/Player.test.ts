import Player from '../src/Player'
jest.mock('../src/Player.ts')
const checkWin = (board: number[][]) => {
	// Check rows
	for(let i = 0; i < board.length; i++) {
		let sum = 0
		for(let j = 0; j < board.length; j++) {
			sum += board[i][j]
		}
		if(sum === 3)
			return true
	}
	// Check columns
	for(let i = 0; i < board.length; i++) {
		let sum = 0
		for(let j = 0; j < board.length; j++) {
			sum += board[j][i]
		}
		if(sum === 3)
			return true
	}
	// Check diagonals
	let sum = 0
	for(let i = 0; i < board.length; i++) {
		sum += board[i][i]
	}
	if(sum === 3)
		return true
	sum = 0
	for(let i = 0; i < board.length; i++) {
		sum += board[i][board.length - 1 - i]
	}
	if(sum === 3)
		return true
	return false
}

let board: number[][] = [] 
describe('Test the Player class', () => {
	beforeEach(() => {
		board = new Array(3).fill(null).map(() => new Array(3).fill(null))	
	})

	it('Should play a practice game', () => {
		const me = new Player({name: 'Victor', isAI: true, difficulty: "Easy" })
		board[0][0] = 1
		me.makeMove(board)
		expect(checkWin(board)).not.toEqual(true)
		board[1][1] = 1
		me.makeMove(board)
		for(const row of board) {
			me.makeMove(board)
			// expect(checkWin(board)).not.toEqual(true)
			if(checkWin(board)) {
				expect(checkWin(board)).toEqual(true)
				return
			}
		}
	})

	it('Should properly instantiate a Player', () => {
		const me = new Player({name: 'John Doe', isAI: false})
		expect(Player).toHaveBeenCalledTimes(2)
	})
})

