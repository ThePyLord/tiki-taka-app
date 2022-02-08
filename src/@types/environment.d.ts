declare global {
	namespace NodeJS {
		interface processEnv {
			PORT: number
		}
	}
}