import { ipcRenderer, contextBridge } from 'electron'

const Window = {
	minimize: (): void => {
		ipcRenderer.send('app/minimize')
	},
	closeWin: (): void => {
		ipcRenderer.send('app/close')
	},
	// create a method getWinTitle that gets the title of the current window
	getWinTitle: (): Promise<string> => {
		return ipcRenderer.invoke('app/getWinTitle')
	}
}

export const api = {
	createWin: (): void => {
		ipcRenderer.invoke('user-init')
	},
	getClipboard: (): Promise<string> => {
		return ipcRenderer.invoke('user-get-clipboard')
	},
	setClipboard: (text: string): void => {
		ipcRenderer.invoke('user-set-clipboard', text)
	},
	Window
}

contextBridge.exposeInMainWorld('api', api)