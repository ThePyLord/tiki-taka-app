import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'


export default function HomePage() {
	useEffect(() => {
		console.log('loaded homepage.')
	}, [])
	return (
		<div className='container'>
			<h1 className='title'>Home Page</h1>
			<Link to="/welcome">Welcome Page</Link>
		</div>
	)
}
