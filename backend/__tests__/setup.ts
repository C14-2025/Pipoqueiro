// Setup para testes com mock do banco de dados
import { jest } from '@jest/globals';

// Configurar ambiente de teste
process.env.NODE_ENV = 'test';

// Mock do pool de conexões MySQL
const mockPool = {
  execute: jest.fn(),
  getConnection: jest.fn(),
  end: jest.fn(),
};

// Mock do módulo mysql2/promise
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => mockPool),
  default: {
    createPool: jest.fn(() => mockPool),
  },
}));

// Mock do módulo de database
jest.mock('../src/config/database', () => ({
  pool: mockPool,
  connectDB: jest.fn().mockResolvedValue(undefined),
  default: mockPool,
}));

// Configurar mocks padrão para operações de banco
beforeEach(() => {
  // Mock para getConnection
  mockPool.getConnection.mockResolvedValue({
    release: jest.fn(),
  });

  // Mock padrão para execute (retorna array vazio)
  mockPool.execute.mockResolvedValue([[], []]);
});

afterEach(() => {
  jest.clearAllMocks();
});