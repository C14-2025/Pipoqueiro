module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: [
    '**/__tests__/**/*.test.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  forceExit: true,
  detectOpenHandles: true
};