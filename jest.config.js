module.exports = {
  testEnvironment: 'node',
  verbose: true,
  setupFilesAfterEnv: ['./test/jest.setup.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/templates/**/*.js' // Exclude template files from coverage
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/templates/'
  ],
  coverageThreshold: {
    global: {
      branches: 55,
      lines: 80,
      statements: 80
    }
  }
}
