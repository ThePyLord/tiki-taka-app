import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
	BrowserRouter as Router,
	Route,
	NavLink,
	Routes
} from 'react-router-dom'
import Welcome from '../pages/Welcome'
import HomePage from '../pages/HomePage'

function App() {
	return (
		<div>
			<Router>
				<Routes>
					<Route path="/main_window" element={<HomePage />} />
					<Route path="/welcome" element={<Welcome />} />
					<Route path="/" element={<Welcome />} />
					<Route path='*' element={<HomePage />} />
				</Routes>
			</Router>
		</div>
	)
}
const root = createRoot(document.getElementById('root'))
root.render(<App />)