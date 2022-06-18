import React, { useState, useEffect, useRef } from 'react'
import '../styles/index.css'


export default function TitleBar() {
	const [title, setTitle] = useState('')
	const closeRef = useRef<HTMLSpanElement>(null)
	const minRef = useRef<HTMLSpanElement>(null)
	
	useEffect(() => {
		const close = closeRef.current
		const min = minRef.current
		const { Window } = window.api
		min.addEventListener('click', Window.minimize)
		close.addEventListener('click', Window.closeWin)
		Window.getWinTitle().then(setTitle)
	}, [])

	return (
		<nav>
			<div className="left-nav">
				<span className='navLink menu'>&#x2630;</span>
			</div>
			<h3 className='winTitle'>{title}</h3>
			<div className="right-nav">			
				<span className='navLink minimize' ref={minRef}>&minus;</span>
				<span className='navLink close' ref={closeRef}>&#10006;</span>
			</div>
		</nav>
	)
}
