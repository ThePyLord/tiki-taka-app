import Piece, { pieceType } from './Piece'
import { Stack } from '../../lib/Stack'
// import { SoundsOfTiki } from '../../lib/Music'

const pieceStack = new Stack<Piece>(9)

// Create a game object that contains all the game logic
export class Game {
	private canvas: HTMLCanvasElement
	private ctx: CanvasRenderingContext2D
	private readonly dims = 3
	private winningPath: number[][]

	private clickTurn = 0
	private cellWidth: number
	private cellHeight: number
	private winner: pieceType | null = null
	private clickDisabled = true
	static board: Piece[][] | null
	static flags: boolean[][]
	private gameOver = false

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
		this.canvas = canvas
		// this.canvas.addEventListener('click', this.handlePlayerInput.bind(this))
		this.canvas.addEventListener('click', (e) => {
			this.handlePlayerInput(e, true)
		})

		this.ctx = ctx
		this.cellWidth = Math.floor(this.canvas.width / this.dims)
		this.cellHeight = Math.floor(this.canvas.height / this.dims)

		ctx.fillStyle = '#000'
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		Game.board = new Array(this.dims)
		Game.flags = new Array(this.dims)
		this.winningPath = new Array(Game.board.length)
		// Initialize the board and flags
		for (let i = 0; i < this.dims; i++) {
			Game.board[i] = new Array(this.dims)
			Game.flags[i] = new Array(this.dims)
			this.winningPath[i] = new Array(this.dims)
			for (let j = 0; j < this.dims; j++) {
				Game.flags[i][j] = false
			}
		}
	}

	private update(): void {
		// Update all the game objects
		if(this.checkWin()) {
			this.canvas.removeEventListener('click', (e) => {
				this.handlePlayerInput(e, false)
			})

			// print the winningPath array	
			console.log(this.winningPath)		
			// Draw the winning line			
			this.ctx.strokeStyle = '#2D47A0'
			this.ctx.beginPath()
			this.ctx.moveTo(this.cellWidth/2, this.cellHeight/2)
			this.ctx.lineTo(this.canvas.width-(this.cellWidth/2), this.canvas.height - (this.cellHeight/2))
			this.ctx.stroke()
		
			// Draw the winning message
			this.ctx.font = '20px Arial'
			this.ctx.textAlign = 'center'
			this.ctx.fillStyle = '#43d637'
			const winner = this.winner === pieceType.nought ? 'Noughts' : 'Crosses'
			this.ctx.fillText(`${winner} wins!`, this.canvas.width/2, this.canvas.height/2)
			setTimeout(() => {
				this.clearBoard()
				this.clickDisabled = true
			}, 3000)
		}
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
	
	private handlePlayerInput(e: MouseEvent, gameState?: boolean) {
		// Get the mouse position
		const [mouseX, mouseY] = [e.offsetX, e.offsetY]

		// Get the column and row that the mouse is over
		const col = Math.floor(mouseX / (this.cellWidth))
		const row = Math.floor(mouseY / (this.cellHeight))

		// Get the top of the cell
		const cellTop = Math.floor(col * (this.cellHeight))
		const cellLeft = Math.floor(row * (this.cellWidth))

		// Draw a circle in the centre of the cell
		const centreX = cellTop + (this.cellWidth/2)
		const centreY = cellLeft + (this.cellWidth/2)

		if(gameState) {
			// If the mouse is over a valid cell
			if (col >= 0 && col < this.dims && row >= 0 && row < this.dims) {
				// If the cell is empty
				const gamePiece = new Piece(this.ctx, pieceType.nought)
				const crossPiece = new Piece(this.ctx, pieceType.cross)
				if (!Game.board[row][col]) {
					// Place the piece on the board				
					if(this.clickTurn % 2 === 0) {
						Game.board[row][col] = gamePiece
						Game.flags[row][col] = true
						Game.board[row][col].drawAt(centreX, centreY, {rad: this.cellWidth/3})
						pieceStack.push(Game.board[row][col])
					}
					else {
						Game.board[row][col] = crossPiece
						Game.flags[row][col] = true
						Game.board[row][col].drawAt(centreX, centreY, {offset: this.cellWidth/3})
						pieceStack.push(Game.board[row][col])
					}
					this.clickTurn = (this.clickTurn + 1) % 2
				}
			}
			
		}				
	}


	/**
	 * the method that checks if the game is won
	 * @returns true if the game is won
	 */
	private checkWin(): boolean {
		let isWin = false
		let numCrossPieces = 0
		let numNoughtPieces = 0

	

		for (let i = 0; i < Game.board.length; i++) {
			for (let j = 0; j < Game.board[i].length; j++) {
				if (Game.board[i][j]) {

					if (i === j && Game.board[i][j].getType() === pieceType.nought) {
						numNoughtPieces++
						this.winningPath[i] = [i, j]
					}
					else if (i === j && Game.board[i][j].getType() === pieceType.cross) {
						numCrossPieces++
					}
					else if(Game.board[i][j].getType() === pieceType.nought) {
						numNoughtPieces++
						// ensure that the winning path is not adding a different piece
						// to the winning path
						if(this.winningPath[i][0] !== i || this.winningPath[i][1] !== j) {
							this.winningPath[i] = null
						}
						this.winningPath[i] = [i, j]
					}
					else if(Game.board[i][j].getType() === pieceType.cross) {
						numCrossPieces++
						this.winningPath[i] = [i, j]

					}


				}
			}
		}

		const passWin = this.winningPath.every(val => Game.board[val[0]][val[1]].getType() === pieceType.nought)
		if (numNoughtPieces === 3) {
			this.winner = pieceType.nought
			console.log(`PassWin is: ${passWin}`)
			isWin = true
		}
		else if (numCrossPieces === 3) {
			this.winner = pieceType.cross
			isWin = true
			this.gameOver = true
		}
		return isWin
	}

	/**
	 * This method checks rows for a win
	 * @param row the row to check
	 * @param p the piece to be checked
	 * @returns true if the piece is in the winning path
	 */
	private checkRow(row: number, p: Piece) {
		let horizontal = false
		const valInMat = p.getType()
		/* for (let i = 0; i < Game.board.length; ++i) {
			for(let j = 0; j < Game.board[i].length; ++j) {
				if(Game.board[i][j].getType() === valInMat)
					horizontal = true
			}
		} */
		for(let i = 0; i < Game.board.length; ++i) {
			if(Game.board[row][i].getType() === valInMat)
				horizontal = true
		}

		return horizontal
	}

	/**
	 * This method checks columns for a win
	 * @param p the piece to be checked
	 * @returns true if this piece is in the winning path
	 */
	private checkCol(col: number, p: Piece) {
		let vertical = false
		const valInMat = p.getType()
		let cols: Piece[] = []

		for(let i = 0; i < Game.board.length; ++i) {
			cols = Game.board.map(c => c[i])
		}

		for(let i = 0; i < Game.board.length; ++i) {
			if(Game.board[i][col].getType() === valInMat)
				vertical = true
		}
		
		vertical = cols.every(p => p.getType() === valInMat)
		return vertical
	}

	private checkDiagonal(p: Piece) {
		let isDiagonal = false
		const valInMat = p.getType()
		for (let i = 0; i < Game.board.length; ++i) {
			for(let j = 0; j < Game.board[i].length; ++j) {
				// Checking top right -> bottom right diagonal 
				if(i == j && valInMat === Game.board[i][j].getType()) {
					this.winningPath[i] = [i, j]
					isDiagonal = true
				}
				// Checking top left -> bottom right diagonal
				else if(i + j === Game.board.length - 1 && valInMat === Game.board[i][j].getType()) {
					this.winningPath[i] = [i, j]
					isDiagonal = true
				}
			}
		}
		return isDiagonal
	}

	private clearBoard() {
		this.clickTurn = 0
		for (let i = 0; i < this.dims; i++) {
			for (let j = 0; j < this.dims; j++) {
				Game.board[i][j] = null
				Game.flags[i][j] = false
				
				this.ctx.clearRect(i * this.cellWidth, j * this.cellHeight, this.cellWidth, this.cellHeight)
				this.ctx.fillStyle = '#000'
				this.ctx.fillRect(i * this.cellWidth, j * this.cellHeight, this.cellWidth, this.cellHeight)
				this.ctx.strokeStyle = '#fff'
				this.ctx.lineWidth = 1.3

				this.ctx.beginPath()
				this.ctx.moveTo(0, i * this.cellHeight)
				this.ctx.lineTo(this.canvas.width, i * this.cellHeight)
				this.ctx.stroke()

				this.ctx.beginPath()
				this.ctx.moveTo(i * this.cellWidth, 0)
				this.ctx.lineTo(i * this.cellWidth, this.canvas.height)
				this.ctx.stroke()

			}
		}

		console.log('board cleared.')
	}

	run(): void {
		requestAnimationFrame(this.run.bind(this))
		this.render()		
		this.update()
	}

}