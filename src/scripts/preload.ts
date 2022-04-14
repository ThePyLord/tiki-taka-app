import { ipcRenderer, contextBridge } from 'electron'


export const api = {
	createWin: (): void => {
		ipcRenderer.invoke('user-init')
	},
	getClipboard: (): Promise<string> => {
		return ipcRenderer.invoke('user-get-clipboard')
	},
	setClipboard: (text: string)	: void => {
		ipcRenderer.invoke('user-set-clipboard', text)
	},
	minimize: (): void => {
		ipcRenderer.send('app/minimize')
	},
	closeWin: (): void => {
		ipcRenderer.send('app/close')
	}
}

contextBridge.exposeInMainWorld('api', api)