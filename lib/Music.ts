export class SFX {
	private static audioCtx: AudioContext;
	private static audioBuffer: AudioBuffer;
	private static audioSource: AudioBufferSourceNode;

	public play(buffer: AudioBuffer): void {
		SFX.audioCtx = new AudioContext();
		SFX.audioBuffer = buffer;
		SFX.audioSource = SFX.audioCtx.createBufferSource();
		SFX.audioSource.buffer = SFX.audioBuffer;
		SFX.audioSource.connect(SFX.audioCtx.destination);
		SFX.audioSource.start();
	}

	public stop(): void {
		SFX.audioSource.stop();
	}
}

export class SoundsOfTiki {
	private audioCtx: AudioContext;
	private audioBuffer: AudioBuffer;
	private audioSource: AudioBufferSourceNode;

	/**
	 *
	 */
	constructor() {
		this.audioCtx = new AudioContext()
		// this.audioBuffer = this.audioCtx.createBuffer(1, 30, 22050)
		this.audioSource = this.audioCtx.createBufferSource()
		// this.audioSource.buffere 
		// Load the sound from this url: `https://freesound.org/data/previews/91/91924_634166-lq.mp3`
		fetch('./audio/cha-ching.mp3')
			.then(response => response.arrayBuffer())
			.then(arrayBuffer => this.audioCtx.decodeAudioData(arrayBuffer))
			.then(audioBuffer => {
				this.audioBuffer = audioBuffer
			})
			.catch(error => console.error(error))

		this.audioSource.buffer = this.audioBuffer
		this.audioSource.connect(this.audioCtx.destination)
	}

	public play(): void {
		this.audioSource.start()
	}

	public stop(): void {
		this.audioSource.stop()
	}
}