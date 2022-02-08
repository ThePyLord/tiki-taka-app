/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // Exclude .spec.ts files from tests
  testRegex: '/tests/.*\\.(test|spec)\\.ts$',
  // Exclude node_modules from tests
  testPathIgnorePatterns: ['/node_modules/'],
  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Stub out the mp3 file loader
  moduleNameMapper: {
    assets: ['<rootDir>/assets/audio/lesgooo.mp3'],
  },
};