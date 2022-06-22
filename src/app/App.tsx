import React from 'react'
import { createRoot } from 'react-dom/client'
import {
	BrowserRouter as Router,
	Route,
	Routes,
} from 'react-router-dom'
import Welcome from '../pages/Welcome'
import HomePage from '../pages/HomePage'
import TitleBar from '../components/TitleBar'
import styles from '../styles/window.module.css'
import { isElectron } from '../utils/electronCheck'
import { Theme } from '../components/Theme'



function App() {
	return (
		<div className={styles.main}>
			{isElectron && <TitleBar />}
			<Router>
				<Routes>
					<Route path="/main_window" element={<HomePage />} />
					<Route path="/welcome" element={<Welcome />} />
					<Route path='*' element={<HomePage />} />
				</Routes>
			</Router>
		</div>
	)
}
const root = createRoot(document.getElementById('root'))
root.render(
	<>
		<Theme>
			<App />
		</Theme>
	</>
)