import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from '../styles/homepage.module.css'

export default function HomePage() {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Tiki Taka App</h1>
			<Link to="/welcome" className={styles.link}>Start Multiplayer</Link>
		</div>
	)
}
