module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  roots: ['<rootDir>/src', '<rootDir>/__tests__'],

  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.spec.ts'
  ],

  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        target: 'es2020',
        esModuleInterop: true,
        skipLibCheck: true
      }
    }]
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  testTimeout: 30000,

  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],

  forceExit: true,
  detectOpenHandles: true,

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Relatórios de resultados dos testes
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Relatório de Testes - Backend Pipoqueiro',
      outputPath: 'test-report.html',
      includeFailureMsg: true,
      includeConsoleLog: false,
      dateFormat: 'dd/mm/yyyy HH:MM:ss',
      sort: 'status',
      executionTimeWarningThreshold: 5,
    }],
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      suiteName: 'Backend Tests',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true,
    }],
  ],

  verbose: true,

  clearMocks: true,
  restoreMocks: true,

  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)'
  ]
};