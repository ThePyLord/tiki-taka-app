import React from 'react'
import styles from '../styles/TextInput.module.css'

interface TextInputProps {
	onInput: (val: string) => void
	value: string
	title: string
	placeholder?: string
	disabled?: boolean
}

export default function TextInput({ title, value, onInput }: TextInputProps) {
	return (
		<div className={styles.body}>
			<div className={styles.field}>
				<input type='text' name="" id={styles.input} placeholder=' ' value={value} onChange={e => onInput(e.target.value)}  />
				<label className={styles.label}>{title}</label>
			</div>
		</div>
	)
}
