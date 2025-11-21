module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  transformIgnorePatterns: [
    '/node_modules/(?!(msw|whatwg-fetch))/',
  ],

  // Relatórios de resultados dos testes (não cobertura)
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Relatório de Testes - Frontend Pipoqueiro',
      outputPath: 'test-report.html',
      includeFailureMsg: true,
      includeConsoleLog: true,
      dateFormat: 'dd/mm/yyyy HH:MM:ss',
      sort: 'status',
      executionTimeWarningThreshold: 5,
    }],
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      suiteName: 'Frontend Tests',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true,
    }],
  ],
};
