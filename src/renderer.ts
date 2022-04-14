import './styles/game.css'
// import './styles/main.scss' // Sass doesn't work yet
console.log('👋 This message is being logged by "renderer.js", included via webpack')
// import { Game } from './components/Game'
import './app/main'
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
// window.api.createWin()


const choices = document.querySelector('.choice').children as HTMLCollectionOf<HTMLElement>
for (let i = 0; i < choices.length; i++) {
	const element = choices[i];
	element.addEventListener('click', function()  {
		this.classList.toggle('clicked')
		if(this.classList.contains('clicked')) {
			this.style.color = 'rgb(84, 118, 192)'
		}
		else {
			this.style.color = '#000'
		}
	})
}
const btn = document.querySelector('.btn') as HTMLElement
window.onload = () => {
	const appTheme = localStorage.getItem('theme')
	if(appTheme === 'dark') {
		document.body.classList.add('dark-mode')
	}
	else if(appTheme === 'light') {
		document.body.classList.remove('dark-mode')
		btn.classList.remove('active') 
		btn.style.color = '#000'
	}
}

btn.addEventListener('click', toggleTheme)

// Toggle theme
function toggleTheme() {
	document.body.classList.toggle('dark-mode')
	this.classList.toggle('active')
	if(this.classList.contains('active')) {
		this.style.color = '#fff'
		localStorage.setItem('theme', 'dark')
	}
	else {
		this.style.color = '#000'
		localStorage.setItem('theme', 'light')
	}
}


/** GAME INITIALIZATION */
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')
// const game = new Game(canvas, ctx)

// game.start()