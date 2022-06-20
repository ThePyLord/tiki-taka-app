import React, { createContext, useEffect, useState } from 'react'

interface contextProps {
	theme: string
	toggleTheme: () => void
}

const ThemeContext = createContext<contextProps>({
	theme: 'dark',
	toggleTheme: () => null,
})

function Theme({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
	useEffect(() => {
		const changeTheme = () => localStorage.setItem('theme', theme)
		changeTheme()

	}, [theme])

	const toggleTheme = () => {
		setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
	}

	return (
		<ThemeContext.Provider value={{
			theme,
			toggleTheme,
		}}>
			{children}
		</ThemeContext.Provider>
	)
}
export { ThemeContext, Theme }
