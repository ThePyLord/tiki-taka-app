/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import './styles/game.css';

console.log('👋 This message is being logged by "renderer.js", included via webpack');
import { Game } from './components/Game'
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
// window.api.createWin()


const appTheme = localStorage.getItem('theme')
const choices = document.querySelector('.choice').children as HTMLCollectionOf<HTMLElement>
for (let i = 0; i < choices.length; i++) {
	const element = choices[i];
	element.addEventListener('click', function()  {
		this.classList.toggle('clicked')
		if(this.classList.contains('clicked')) {
			this.style.color = 'rgb(84, 118, 192)'
			console.log(this.classList)
		}
		else {
			this.style.color = '#000'
		}
	})
}

document.querySelector('.btn').addEventListener('click', toggleTheme)

// Toggle theme
// TODO: #1 Persist theme between sessions
function toggleTheme() {

	document.body.classList.toggle('dark-mode')
	this.classList.toggle('active')
	if(this.classList.contains('active')) {
		this.style.color = '#fff'
	}
	else {
		this.style.color = '#000'
	}
	console.log(appTheme)
}


/** GAME INITIALIZATION */
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
const game = new Game(canvas, ctx)
game.run()
