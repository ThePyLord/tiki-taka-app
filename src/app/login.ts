import '../styles/login.css'

const minimize = document.getElementById('minimize')
const close = document.getElementById('close')

minimize.addEventListener('click', () => {
	window.api.minimize()
})

close.addEventListener('click', () => {window.api.closeWin()})