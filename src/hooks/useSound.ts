/**
 * Sound manager hook for centralized audio handling
 * Prevents recreating audio objects and manages lifecycle
 */

import { useCallback, useEffect, useRef } from 'react'

export interface SoundConfig {
	[key: string]: string // Sound name -> audio file path
}

export interface UseSoundReturn {
	play: (name: string) => void
	stop: (name: string) => void
	stopAll: () => void
	setVolume: (name: string, volume: number) => void
	setGlobalVolume: (volume: number) => void
	isPlaying: (name: string) => boolean
}

interface AudioInstance {
	audio: HTMLAudioElement
	playing: boolean
}

export function useSound(config: SoundConfig): UseSoundReturn {
	const audioMapRef = useRef<Map<string, AudioInstance>>(new Map())
	const globalVolumeRef = useRef(1.0)

	// Initialize audio instances
	useEffect(() => {
		const audioMap = audioMapRef.current

		// Create audio instances for each configured sound
		Object.entries(config).forEach(([name, src]) => {
			if (!audioMap.has(name)) {
				const audio = new Audio(src)
				audio.preload = 'auto'
				audio.volume = globalVolumeRef.current
				
				audio.addEventListener('ended', () => {
					const instance = audioMap.get(name)
					if (instance) {
						instance.playing = false
					}
				})

				audioMap.set(name, { audio, playing: false })
			}
		})

		// Cleanup on unmount
		return () => {
			audioMap.forEach(({ audio }) => {
				audio.pause()
				audio.src = ''
			})
			audioMap.clear()
		}
	}, [config])

	const play = useCallback((name: string) => {
		const instance = audioMapRef.current.get(name)
		if (instance) {
			// Reset to start if already playing
			instance.audio.currentTime = 0
			instance.audio.play()
				.then(() => {
					instance.playing = true
				})
				.catch(err => {
					console.warn(`Failed to play sound "${name}":`, err)
				})
		} else {
			console.warn(`Sound "${name}" not found in config`)
		}
	}, [])

	const stop = useCallback((name: string) => {
		const instance = audioMapRef.current.get(name)
		if (instance) {
			instance.audio.pause()
			instance.audio.currentTime = 0
			instance.playing = false
		}
	}, [])

	const stopAll = useCallback(() => {
		audioMapRef.current.forEach(({ audio }, name) => {
			audio.pause()
			audio.currentTime = 0
			const instance = audioMapRef.current.get(name)
			if (instance) {
				instance.playing = false
			}
		})
	}, [])

	const setVolume = useCallback((name: string, volume: number) => {
		const instance = audioMapRef.current.get(name)
		if (instance) {
			instance.audio.volume = Math.max(0, Math.min(1, volume))
		}
	}, [])

	const setGlobalVolume = useCallback((volume: number) => {
		const normalizedVolume = Math.max(0, Math.min(1, volume))
		globalVolumeRef.current = normalizedVolume
		
		audioMapRef.current.forEach(({ audio }) => {
			audio.volume = normalizedVolume
		})
	}, [])

	const isPlaying = useCallback((name: string): boolean => {
		const instance = audioMapRef.current.get(name)
		return instance?.playing ?? false
	}, [])

	return {
		play,
		stop,
		stopAll,
		setVolume,
		setGlobalVolume,
		isPlaying
	}
}

export default useSound
