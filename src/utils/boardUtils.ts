
interface opts {
	ctx: CanvasRenderingContext2D
	path: number[][]
	cellWidth: number
}
const drawWinPath = ({ ctx, path, cellWidth }: opts) => {
	ctx.strokeStyle = '#2D47A0'
	ctx.lineWidth = 5
	ctx.lineCap = 'round'

	// Check if the path is horizontal or vertical
	ctx.beginPath()
	// Horizontal
	console.log('horizontal', path)
	if (path[0][1] === path[1][1]) {
		// Time complexity: O(1) 😈
		ctx.moveTo(
			(cellWidth / 2),
			(path.at(-1)[1] * cellWidth) + (cellWidth / 2)
		)
		ctx.lineTo(
			(path.at(-1)[0] * cellWidth) + (cellWidth / 2),
			(path.at(-1)[1] * cellWidth) + (cellWidth / 2)
		)

	}
	// Vertical
	else if (path[0][0] === path[1][0]) {
		// Time complexity: O(1) 😈
		ctx.moveTo(
			(path[0][0] * cellWidth) + cellWidth / 2, // x
			(path[0][1] * cellWidth) + cellWidth / 2 // y
		)
		ctx.lineTo(
			(path.at(-1)[0] * cellWidth) + cellWidth / 2,
			(path.at(-1)[1] * cellWidth) + cellWidth / 2
		)
	}
	else {
		// Convoluted antidiagonal check
		// Basically checking if the last item in the path matches the reverse of the first
		// e.g [0, 2] == [2, 0](in reverse)
		if (path.at(-1)
			.map(item => item)
			.reverse()
			.every((val, idx) => val === path[0][idx])) {
			path.forEach(([x, y], idx) => {
				if (idx !== path.length - 1) {
					ctx.moveTo(x * cellWidth + (cellWidth / 2), y * cellWidth + (cellWidth / 2))
					ctx.lineTo((x + 1) * cellWidth + (cellWidth / 2), (y - 1) * cellWidth + (cellWidth / 2))
				}
			})
		}
		else {
			// posdiag
			path.forEach(([x, y], idx) => {
				if (idx !== path.length - 1) {
					ctx.moveTo(x * cellWidth + (cellWidth / 2), y * cellWidth + (cellWidth / 2))
					ctx.lineTo((x + 1) * cellWidth + (cellWidth / 2), (y + 1) * cellWidth + (cellWidth / 2))
				}
			})
		}
	}
	ctx.stroke()
}

const clearBoard = ({ctx, canvas, width}: {
	ctx: CanvasRenderingContext2D
	canvas: HTMLCanvasElement
	width: number
	size: number
}) => {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	// render(ctx, size, )
}


export { drawWinPath }