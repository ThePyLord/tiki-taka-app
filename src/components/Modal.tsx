import React, { useState, useEffect } from 'react'
import styles from '../styles/Modal.module.css'

interface ModalProps {
	onClose: () => void
	title: string
	children: React.ReactNode
}

export default function Modal({ onClose, title, children }: ModalProps) {
	useEffect(() => {
		console.log('Modal mounted')
	}, [])
	return (
		<div id={styles.overlay}>
			<div id='modal'>
				<div id='modal-header'>
					<h2>{title}</h2>
					<button onClick={onClose}>X</button>
				</div>
			</div>
		</div>
	)
}
