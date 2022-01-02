import Player from '../src/Player'
jest.mock('../src/Player.ts')

it('Should properly instantiate a Player', () => {
	const me = new Player({name: 'John Doe', id: 13, isAI: false})
	expect(Player).toHaveBeenCalledTimes(1)
})