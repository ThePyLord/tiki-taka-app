// TO GET **CUSTOM** AUDIO TO WORK
// 1. Create a type declaration for the audio file
// 2. Import the audio file(s). The ES6 way
// 3. Use the fetch API to get the audio file

export class SoundsOfTiki {
	private audioCtx: AudioContext;
	private audioBuffer: AudioBuffer;
	private audioSource: AudioBufferSourceNode;
	private osc: OscillatorNode

	constructor(private sound: any) {
		this.audioCtx = new AudioContext()
		// this.audioBuffer = this.audioCtx.createBuffer(1, 30, 22050)
		// for this to work audioSource has to be an AudioNode
		this.audioSource = this.audioCtx.createBufferSource()

		this.osc = this.audioCtx.createOscillator()
		// set type: sine, square, sawtooth, triangle
		this.osc.type = 'triangle'
		this.osc.frequency.value = 350
		this.osc.frequency.exponentialRampToValueAtTime(600, this.audioCtx.currentTime +1)
		const gain = this.audioCtx.createGain()
		// gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.9)
		gain.gain.linearRampToValueAtTime(.5, this.audioCtx.currentTime + 0.9)
		// Load the sound from this url: `https://freesound.org/data/previews/91/91924_634166-lq.mp3`
		fetch(sound)
			.then(response => response.arrayBuffer())
			.then(arrayBuffer => this.audioCtx.decodeAudioData(arrayBuffer))
			.then(audioBuffer => {
				this.audioBuffer = audioBuffer
				this.audioSource.buffer = this.audioBuffer
			})
			.catch(console.error)

		this.audioSource.buffer = this.audioBuffer
		this.audioSource.connect(gain).connect(this.audioCtx.destination)
	}

	public play(): void {
		this.audioSource.start()
	}

	public stop(): void {
		this.audioSource.stop(this.audioCtx.currentTime + 1)
	}
	
	public export(): void {
		const arrayBuffer = this.audioBuffer
		const arr = new Float32Array()
		arrayBuffer.copyFromChannel(arr, 0)
	}

}