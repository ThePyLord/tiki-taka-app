import Piece, { pieceType } from './Piece'
import { SoundsOfTiki } from '../../lib/Music'
import wasted from '../../assets/audio/wasted.mp3'

let running = true
// Create a game object that contains all the game logic
export class Game {
	private readonly canvas: HTMLCanvasElement
	private readonly ctx: CanvasRenderingContext2D
	private readonly dims: number
	private winningPath: number[][]

	private clickTurn = 0
	private cellWidth: number
	private cellHeight: number
	private winner: pieceType | null = null
	static board: Piece[][] | null[][]
	private col: number; row: number
	private reqId: number
	/**
	 * creates a new Game
	 * @param canvas The canvas to draw the board on
	 * @param ctx rendering context
	 * @param dims the dimensions of the board
	 */
	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, dims?: number) {
		this.canvas = canvas
		// this.canvas.onclick = this.handlePlayerInput.bind(this.canvas)
		this.canvas.addEventListener('click', this.handlePlayerInput.bind(this))
		this.dims = dims > 3 ? dims : 3
		this.ctx = ctx
		this.cellWidth = Math.floor(this.canvas.width / this.dims)
		this.cellHeight = Math.floor(this.canvas.height / this.dims)

		this.ctx.fillStyle = '#000'

		ctx.fillRect(0, 0, canvas.width, canvas.height)
		Game.board = new Array(this.dims)
		this.winningPath = new Array(Game.board.length)
		// Initialize the board and flags
		for (let i = 0; i < this.dims; i++) {
			Game.board[i] = new Array(this.dims)
			this.winningPath[i] = new Array(this.dims-1)
		}
		console.log(Game.board)
	}

	/**
	 * Updates the game logic 
	 */
	private update(): void {
		// Get the top of the cell
		const cellTop = Math.floor(this.col * (this.cellHeight))
		const cellLeft = Math.floor(this.row * (this.cellWidth))
		// Draw a circle with a radius from the centre of the cell
		const centreX = cellTop + (this.cellWidth/2)
		const centreY = cellLeft + (this.cellWidth/2)
		if(this.col >= 0 && this.dims && this.row >= 0 && this.row < this.dims) {
			if(!Game.board[this.row][this.col]) {
				// Dynamically set the pieces by clickTurn(which technically is the pieceType of the piece)
				const type: pieceType = this.clickTurn + 1
				Game.board[this.row][this.col] = new Piece(this.ctx, type)
				if(type % 2 !== 0) {
					Game.board[this.row][this.col].drawAt(centreX, centreY, {rad: this.cellWidth/3})
				} else {
					Game.board[this.row][this.col].drawAt(centreX, centreY, {offset: this.cellWidth/3})
				}
				this.clickTurn = (this.clickTurn + 1) % 2
				setTimeout(() => {
					console.log('Board at click:', Game.board.map(row => row.map(cell => cell?.getType())))
					console.log('The clickTurn is:', this.clickTurn)
				}, 100)
			}
			if(this.checkWin(this.row, this.col)) {
				const sfx = new SoundsOfTiki(wasted)
				sfx.play()
				running = false
				// console.log(Game.board.map(row => row.map(cell => cell?.getType())))
				// Draw the winning message
				this.ctx.font = '20px Arial'
				this.ctx.textAlign = 'center'
				this.ctx.fillStyle = '#ffff00'
				
				this.drawWinPath(this.winningPath)
				const winner = this.winner === 1 ? 'Noughts' : 'Crosses'
				console.log('The winner:',winner, this.winningPath)
				this.ctx.fillText(`${winner} wins!`, this.canvas.width/2, this.canvas.height/2)
				setTimeout(() => {
					this.clearBoard()
					this.winner = null
					console.log('Supposedly cleared board:', Game.board, '\nThe winner is: ', this.winner)
					console.log('Piece still exists:', Game.board[this.row][this.col])
				}, 3000)
				// sfx.stop()
			}
			else if(this.isBoardFull() && !this.checkWin(this.row, this.col)) {
				this.ctx.font = '20px Arial'
				this.ctx.textAlign = 'center'
				this.ctx.fillStyle = '#599b92'
				this.ctx.fillText('Draw!', this.canvas.width/2, this.canvas.height/2)
				setTimeout(() => {
					this.clearBoard()
					console.log('Supposedly cleared board:', Game.board)
				}, 900)
				console.log('Game board:', Game.board)
			}
		}
	}

	/**
	 * draws a line along the "winning path"
	 * @param path The path that the line will be drawn along
	 */
	private drawWinPath(path: number[][]): void {
		this.ctx.strokeStyle = '#2D47A0'
		this.ctx.lineWidth = 5
		this.ctx.lineCap = 'round'

		// Check if the path is horizontal or vertical
		this.ctx.beginPath()
		// Horizontal
		if(path[0][1] === path[1][1]) {
			// Time complexity: O(1) 😈
			// WE'RE NOT THE SAME \\
			this.ctx.moveTo(
				(this.cellWidth/2),  
				(path[path.length - 1][1] * this.cellHeight) + (this.cellHeight/2)
				)
			this.ctx.lineTo(
				(path[path.length - 1][0] * this.cellWidth) + (this.cellWidth/2),
				(path[path.length - 1][1] * this.cellHeight) + (this.cellHeight/2)
				)
			}
			// Vertical
			else if(path[0][0] === path[1][0]) {
			// Time complexity: O(1) 😈
			this.ctx.moveTo(
				(path[0][0] * this.cellWidth) + this.cellWidth/2, // x
				(path[0][1] * this.cellHeight) + this.cellHeight/2 // y
			)
			this.ctx.lineTo(
				(path[path.length - 1][0] * this.cellWidth) + this.cellWidth/2, 
				(path[path.length - 1][1] * this.cellHeight) + this.cellHeight/2
			)
			// CHECKING NUMERICAL VALUES
			console.log('Line starts from:', (path[0][0] * this.cellWidth) + this.cellWidth/2, Math.floor(path[0][1] * this.cellHeight) * this.cellHeight/2)
			console.log('To:', Math.floor(path[path.length - 1][0] * this.cellWidth) + this.cellWidth/2, Math.floor(path[path.length - 1][1] * this.cellWidth) + this.cellWidth/2)
		}
		else {
			// Convoluted antidiagonal check
			// Basically checking if the last item in the path matches the reverse of the first
			// e.g [0, 2] == [2, 0](in reverse)
			if(path[path.length - 1]
				.map(item => item)
				.reverse()
				.every((val, idx) => val === path[0][idx]))
			{
				path.forEach(([x, y], idx) => {
					if(idx !== path.length - 1) {
						this.ctx.moveTo(x * this.cellWidth + (this.cellWidth/2), y * this.cellHeight + (this.cellHeight/2) )
						this.ctx.lineTo((x + 1) * this.cellWidth + (this.cellWidth/2), (y - 1) * this.cellHeight + (this.cellHeight/2))
					}
				})	
			}
			else {
				// posdiag
				path.forEach(([x, y], idx) => {
					if(idx !== path.length - 1) {
						this.ctx.moveTo(x * this.cellWidth + (this.cellWidth/2), y * this.cellHeight + (this.cellHeight/2))
						this.ctx.lineTo((x + 1) * this.cellWidth + (this.cellWidth/2), (y + 1) * this.cellHeight + (this.cellHeight/2))
					}
				})
			}
		}
		this.ctx.stroke()
	}
	

	/**
	 * Renders the game board on the canvas
	 */
	private render() {
		// Draw the board separation lines
		this.ctx.strokeStyle = '#fff'
		this.ctx.lineWidth = 1.3
		for (let i = 0; i < this.dims; i++) {
			this.ctx.beginPath()
			this.ctx.moveTo(0, i * this.cellHeight)
			this.ctx.lineTo(this.canvas.width, i * this.cellHeight)
			this.ctx.stroke()

			this.ctx.beginPath()
			this.ctx.moveTo(i * this.cellWidth, 0)
			this.ctx.lineTo(i * this.cellWidth, this.canvas.height)
			this.ctx.stroke()
		}
		// Save the current state of the canvas
	}
	
	// Check if the board is full
	private isBoardFull(): boolean {
		let isFull = true
		for (let i = 0; i < this.dims; i++) {
			for (let j = 0; j < this.dims; j++) {
				if (!Game.board[i][j]) {
					isFull = false
				}
			}
		}

		return isFull
	}
	
	private handlePlayerInput(e: MouseEvent) {
		// Get the mouse position
		const [mouseX, mouseY] = [e.offsetX, e.offsetY]

		// Get the column and row that the mouse is over
		const col = Math.floor(mouseX / (this.cellWidth))
		const row = Math.floor(mouseY / (this.cellHeight))

		this.col = col
		this.row = row
		console.log(`User clicked on: [${row}, ${col}]`)
	}

	/**
	 * the method that checks if the game is won
	 * @returns true if the game is won
	 */
	private checkWin(row: number, col: number) {
		let isWin = false
		let winAxis = '' // the winning axis(row, column or diagonal)
		
		for (let i = 0; i < Game.board.length; i++) {
			if(Game.board[i][row]) {
				const rowSet = new Set(Game.board[i].map(piece => piece?.getType()))
				if(rowSet.size === 1) {
					winAxis = 'row'
					console.log('Game won on(row):', i, row)
					this.generateWinningPath(winAxis, row)
					this.winner = Game.board[i][row].getType()
					isWin = true
				}
			}

			if(Game.board[col][i]) {
				const colSet = new Set(Game.board.map(piece => piece[col]?.getType()))
				if(colSet.size == 1) {
					winAxis = 'col'
					this.generateWinningPath(winAxis, i)
					console.log('Game won on(col): ', col, i)
					this.winner = Game.board[col][i].getType()
					console.log('The winningPath is: ', this.winningPath)
					isWin = true	
				}
			}

			if(Game.board[i][i]) {
				const posSet = new Set(Game.board.map((rows, idx, arr) => arr[idx][idx]?.getType()))
				if(posSet.size == 1) {
					winAxis = 'posdiag'
					console.log('Game won on(posdiag):', i, i)
					this.generateWinningPath(winAxis, i)
					this.winner = Game.board[i][i].getType()
					isWin = true
				}
			}
			if(Game.board[i][Game.board.length - 1 - i]) {
				// Checking anti-diagonal
				const antiSet = new Set(Game.board.map((_, idx, arr) => arr[idx][Game.board.length - 1 - idx]?.getType()))
				if(antiSet.size == 1) {
					winAxis = 'antidiag'
					console.log('Game won on(antidiag):', i, (Game.board.length - 1 - i))
					this.generateWinningPath(winAxis, Game.board.length - 1 - i)
					this.winner = Game.board[i][Game.board.length - 1 - i]?.getType()
					isWin = true
				}
			}
		}

		return isWin
	}

	/**
	 * Generates the winning path based on the winning axis
	 * @param winAxis the winning axis
	 * @param idx the index of the winning piece
	 */
	private generateWinningPath(winAxis: string, idx?: number) {
		if(winAxis === 'row') {
			for(let i = 0; i < this.dims; i++) {
				this.winningPath[i] = [i, idx]
			}
		}
		else if(winAxis === 'col') {
			for(let i = 0; i < this.dims; i++) {
				this.winningPath[i] = [idx, i]
			}
		}
		else if(winAxis === 'posdiag') {
			for(let i = 0; i < this.dims; i++) {
				this.winningPath[i] = [i, i]
			}
		}
		else if(winAxis === 'antidiag') {
			for(let i = 0; i < this.dims; i++) {
				this.winningPath[i] = [i, Game.board.length - 1 - i]
			}
		}
	}

	/**
	 * Clears the game board
	 * @todo: clear the board and redraw the board
	 * @todo: clear the board from the winningPath
	 */
	private clearBoard() {
		this.clickTurn = 0
		this.winningPath = []
		this.ctx.strokeStyle = '#fff'
		this.ctx.fillStyle = '#000'
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

		// const filled = Game.board.filter(row => row.filter(piece => piece !== null))
		for(let i = 0; i < this.dims; i++) {
			// for(let j = 0; j < this.dims; j++) {
			// Use the clear method of the piece to clear out the board
			// 	Game.board[i][j]?.clear(i, j, this.cellWidth, this.cellHeight)
			// }
			Game.board[i] = new Array(this.dims)
			this.ctx.beginPath()
			this.ctx.moveTo(0, i * this.cellHeight)
			this.ctx.lineTo(this.dims * this.cellWidth, i * this.cellHeight)
			this.ctx.stroke()
			
			this.ctx.beginPath()
			this.ctx.moveTo(i * this.cellWidth, 0)
			this.ctx.lineTo(i * this.cellWidth, this.dims * this.cellHeight)
			this.ctx.stroke()
		}
			
	}

	run(): void {
		// Likely the source of the reset issue
		this.render()
		if (!running) {
			cancelAnimationFrame(this.reqId)
			// Remove the event listener on the handlePlayerInput function to prevent multiple listeners
			// console.log('Temporarily paused execution on:', this.reqId)
			setTimeout(() => {
				this.reqId = requestAnimationFrame(this.run.bind(this))
				running = true
				console.log('Piece still exists:', Game.board[this.row][this.col])
			}, 5000)
		} else {
			this.render()
			this.reqId = requestAnimationFrame(this.run.bind(this))
			this.update()
		}
	
	}
}