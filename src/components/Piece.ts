// Create a class piece that can be used to draw a nought or cross 
// on the canvas.
export enum pieceType {
	nought,
	cross
}

export default class Piece {
	private readonly ctx: CanvasRenderingContext2D
	private type: pieceType
	private readonly lineWidth = 3
	private readonly noughtColor = '#f00'
	private readonly crossColor = '#0f0'

	// The constructor takes a canvas context and a position.
	constructor(ctx: CanvasRenderingContext2D, type: pieceType) {
		this.ctx = ctx;
		this.type = type;
		this.ctx.lineWidth = this.lineWidth;
	}

	getType(): pieceType {
		return this.type;
	}

	drawAt(x: number, y: number, options?: {rad?: number, offset?: number}): void {

		if(this.type == pieceType.nought) {
			this.ctx.strokeStyle = this.noughtColor
			this.ctx.beginPath()
			this.ctx.arc(x, y, options.rad, 0, 2 * Math.PI)
			this.ctx.stroke()
		} else {
			this.ctx.strokeStyle = this.crossColor
			this.ctx.beginPath()
			this.ctx.moveTo(x - options.offset, y - options.offset)
			this.ctx.lineTo(x + options.offset, y + options.offset)
			this.ctx.stroke()

			this.ctx.beginPath()
			this.ctx.moveTo(x - options.offset, y + options.offset)
			this.ctx.lineTo(x + options.offset, y - options.offset)
			this.ctx.stroke()
		}
	}


	clear(x: number, y: number, width: number, height: number): void {
		this.ctx.clearRect(x, y, width, height)
	}
}