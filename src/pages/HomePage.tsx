import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import TextInput from '../components/TextInput'
import styles from '../styles/homepage.module.css'

export default function HomePage() {
	const [name, setName] = useState('')
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Tiki Taka App</h1>
			<TextInput title='Your username' onInput={(val) => {
				setName(val)
				sessionStorage.setItem('name', val)
			}} value={name} />
			<Link to="/welcome" className={styles.link}>Start Multiplayer</Link>
		</div>
	)
}
