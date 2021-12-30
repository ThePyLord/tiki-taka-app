import { api } from '../scripts/preload'

declare global {
	interface Window {api: typeof api}
}