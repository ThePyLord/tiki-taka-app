import { ipcRenderer, contextBridge } from 'electron'


export const api = {
	createWin: (): void => {
		ipcRenderer.invoke('user-init')
	},
	sayHello: (): void => {
		console.log('Hello')
	},
	minimize: (): void => {
		ipcRenderer.send('app/minimize')
	},
	closeWin: (): void => {
		ipcRenderer.send('app/close')
	}
}

contextBridge.exposeInMainWorld('api', api)