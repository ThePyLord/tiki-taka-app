import { ModalEnum } from '../../shared/interfaces'

class Modal {
	private modal: HTMLDivElement
	static readonly container = document.getElementById('main')
	private msg: string
	private type: ModalEnum
	/**
	 *
	 */
	constructor(type: ModalEnum, message: string) {
		this.msg = message
		this.type = type
		this.modal = document.createElement('div')
		console.log('The message is:', this.msg)
	}
	
	
	set modalMessage(message: string) {
		this.msg = message
	}
	
	create(): void {
		const overlay = document.createElement('div')
		const header = document.createElement('h2')
		const modalContent = document.createElement('div')
		const text = document.createElement('p')
		const bopCat = document.createElement('img')
		const closeBtn = document.createElement('button')
		closeBtn.textContent = 'Close'
		closeBtn.id = 'close-btn'
		closeBtn.addEventListener('click', this.modalHandler)
		
		if(this.type === ModalEnum.info) {
			modalContent.classList.add('info')
			header.textContent = 'Info'
		}
		else if(this.type === ModalEnum.err) {
			modalContent.classList.add('err')
		}
		bopCat.src = 'https://c.tenor.com/SY_Rb9FZFb4AAAAd/cat-jam-stonks.gif'
		this.modal.classList.add('modal')
		text.className = 'text'
		text.innerHTML = this.msg
		overlay.classList.add('overlay')
		modalContent.classList.add('modal-content')
		
		modalContent.appendChild(header)
		modalContent.appendChild(text)
		modalContent.appendChild(bopCat)
		modalContent.appendChild(closeBtn)
		this.modal.appendChild(modalContent)
		this.modal.appendChild(overlay)
		Modal.container.appendChild(this.modal)
	}

	private modalHandler = () => {
		const state = this.modal.style.display
		if(state === 'none') {
			this.modal.style.display = 'block'
		}
		else {
			this.modal.style.display = 'none'
		}
	}

	

}

export { Modal }