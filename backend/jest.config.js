module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Diretórios de busca
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  
  // Padrões de arquivos de teste
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.spec.ts'
  ],
  
  // Transformações
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // Extensões de arquivo
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Configurações de timeout
  testTimeout: 30000,
  
  // Arquivos de setup
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  
  // Configurações para evitar handles abertos
  forceExit: true,
  detectOpenHandles: true,
  
  // Configurações do ts-jest para melhor compatibilidade
  globals: {
    'ts-jest': {
      useESM: false,
      isolatedModules: true,
      tsconfig: {
        module: 'commonjs',
        target: 'es2020',
        lib: ['es2020'],
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: false, // Desabilita strict para evitar problemas de tipagem nos testes
        noImplicitAny: false,
        strictNullChecks: false
      }
    }
  },
  
  // Mapeamento de módulos (se necessário)
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Arquivos a serem ignorados
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Configurações de cobertura
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  
  // Relatórios de cobertura
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Configurações para melhor output
  verbose: true,
  silent: false,
  
  // Limpar mocks automaticamente
  clearMocks: true,
  restoreMocks: true,
  
  // Configurações específicas para Jest com TypeScript
  preset: 'ts-jest/presets/default',
  
  // Configuração para resolver problemas de ESM
  extensionsToTreatAsEsm: [],
  
  // Configurações para resolver problemas com axios e outros módulos
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)'
  ]
};