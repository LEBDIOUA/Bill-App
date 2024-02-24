// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['./setup-jest.js'],
    setupFilesAfterEnv: ['./setupTests.js'],
  };