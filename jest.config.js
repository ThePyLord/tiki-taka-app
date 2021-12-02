/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // Exclude .spec.ts files from tests
  testRegex: '/tests/.*\\.test\\.ts$',
  // Exclude node_modules from tests
  testPathIgnorePatterns: ['/node_modules/']
};