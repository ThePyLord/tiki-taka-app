import Piece, { pieceType } from './Piece'
import { Stack } from '../../lib/Stack'
// import { SoundsOfTiki } from '../../lib/Music'

const pieceStack = new Stack<Piece>()

// Create a game object that contains all the game logic
export class Game {
	private canvas: HTMLCanvasElement
	private ctx: CanvasRenderingContext2D
	private readonly dims: number
	private winningPath: number[][]

	private clickTurn = 0
	private cellWidth: number
	private cellHeight: number
	private winner: pieceType | null = null
	static board: Piece[][] | null
	private col: number
	private row: number

	/**
	 * creates a new Game
	 * @param canvas The canvas to draw the board on
	 * @param ctx rendering context
	 * @param dims the dimensions of the board
	 */
	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, dims?: number) {
		this.canvas = canvas
		this.canvas.addEventListener('click', this.handlePlayerInput.bind(this))
		this.dims = dims || 3
		this.ctx = ctx
		this.cellWidth = Math.floor(this.canvas.width / this.dims)
		this.cellHeight = Math.floor(this.canvas.height / this.dims)

		ctx.fillStyle = '#000'
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		Game.board = new Array(this.dims)
		this.winningPath = new Array(Game.board.length)
		// Initialize the board and flags
		for (let i = 0; i < this.dims; i++) {
			Game.board[i] = new Array(this.dims)
			this.winningPath[i] = new Array(this.dims-1)
		}
	}

	private update(): void {
		// Get the top of the cell
		const cellTop = Math.floor(this.col * (this.cellHeight))
		const cellLeft = Math.floor(this.row * (this.cellWidth))
		
		// Draw a circle in the centre of the cell
		const centreX = cellTop + (this.cellWidth/2)
		const centreY = cellLeft + (this.cellWidth/2)
		if(this.col >= 0 && this.dims && this.row >= 0 && this.row < this.dims) {
			if(!Game.board[this.row][this.col]) {
				// Dynamically set the pieces by clickTurn(which technically is the pieceType of the piece)
				Game.board[this.row][this.col] = new Piece(this.ctx, this.clickTurn)
				if(this.clickTurn % 2 === 0) {
					Game.board[this.row][this.col].drawAt(centreX, centreY, {rad: this.cellWidth/3})
				} else {
					Game.board[this.row][this.col].drawAt(centreX, centreY, {offset: this.cellWidth/3})
				}
				this.clickTurn = (this.clickTurn + 1) % 2
			}
			if(this.checkWin(this.row, this.col)) {

				// print the winningPath array	
				// Draw the winning line			
				this.drawWinPath(this.winningPath)
				// Draw the winning message
				this.ctx.font = '20px Arial'
				this.ctx.textAlign = 'center'
				this.ctx.fillStyle = '#43d637'
				const winner = this.winner === Game.board[this.row][this.col].getType() ? 'Noughts' : 'Crosses'
				this.ctx.fillText(`${winner} wins!`, this.canvas.width/2, this.canvas.height/2)
				setTimeout(() => {
					this.clearBoard()
					console.log('Board cleared')
				}, 3000)
			}
		}
	}


	private drawWinPath(path: number[][]): void {
		this.ctx.strokeStyle = '#2D47A0'
		this.ctx.lineWidth = 3
		this.ctx.beginPath()
		path.forEach(([x, y]) => {
			console.log(`x: ${x* this.cellWidth}, y: ${y * this.cellHeight}`)
			this.ctx.moveTo((x * this.cellWidth), (y * this.cellHeight))
			// this.ctx.moveTo((x * this.cellWidth) + this.cellWidth/2, (y * this.cellHeight) + this.cellHeight/2)
			this.ctx.lineTo(((x + 1) * this.cellWidth), (y + 1) * this.cellHeight)
		})
		this.ctx.stroke()
	}


	/**
	 * Renders the game board on the canvas
	 */
	private render(): void {
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
		// this.ctx.save()
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
		Game.board = null
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
	}


	/**
	 * the method that checks if the game is won
	 * @returns true if the game is won
	 */
	private checkWin(row: number, col: number): boolean {
		let isWin = false
		let winAxis = '' // the winning axis(row, column or diagonal)
		// let numPieces = 0
		let noughts = 0
		let crosses = 0
		
		for (let i = 0; i < Game.board.length; i++) {			
			if(Game.board[i][row]) {
				const rowSet = new Set(Game.board[i].map(piece => piece.getType()))
				if(rowSet.size === 1) {
					winAxis = 'row'
					console.log('Game won on(row):', i, row)
					this.generateWinningPath(winAxis, row)
					this.winner = Game.board[i][row].getType()
					isWin = true
				}
			}


			if(Game.board[col][i]) {
				const colSet = new Set(Game.board[col].map(piece => piece.getType()))
				if(colSet.size === 1) {
					winAxis = 'col'
					this.generateWinningPath(winAxis, i)
					this.winner = Game.board[col][i].getType()
					isWin = true
				}
			}

			if(Game.board[i][i]) {
				if(Game.board[i][i].getType() === 0) {
					noughts++
				}
				else if(Game.board[i][i].getType() === 1) {
					crosses++
				}
				if(noughts === this.dims || crosses === this.dims) {
					winAxis = 'posdiag'
					crosses = 0, noughts = 0
					console.log('Game won on(posdiag):', i, i)
					this.generateWinningPath(winAxis, i)
					console.log(this.winningPath)
					this.winner = Game.board[i][i].getType()
					isWin = true
				}
			}
			else if(Game.board[i][Game.board.length - 1 - i]) {
				// Checking anti-diagonal
				if(Game.board[i][Game.board.length - 1 - i].getType() === 1) {
					crosses++
				}
				else if(Game.board[i][Game.board.length - 1 - i].getType() === 0) {
					noughts++
				}
				if(noughts === this.dims || crosses === this.dims)
				{
					winAxis = 'antidiag'
					console.log('Game won on(antidiag):', i, (Game.board.length - 1 - i))
					this.generateWinningPath(winAxis, Game.board.length - 1 - i)
					this.winner = Game.board[i][Game.board.length - 1 - i].getType()
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
		else if(winAxis === 'column') {
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
				this.winningPath[i] = [i, this.dims - 1 - i]
			}
		}
	}


	private clearBoard() {
		this.clickTurn = 0
		Game.board.forEach(vals => vals.forEach((p, idx, arr) => arr[idx] = null))
	}

	run(): void {
		const reqId = requestAnimationFrame(this.run.bind(this))
		this.render()
		this.update()
		if(this.winner !== null) {
			cancelAnimationFrame(reqId)
		}
	}

}