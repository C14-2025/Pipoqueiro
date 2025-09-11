// Setup para testes de integração reais
import pool from '../src/config/database';
import { afterEach, afterAll } from '@jest/globals';


// Configurar ambiente de teste
process.env.NODE_ENV = 'test';

// Função para limpar dados de teste após cada teste
afterEach(async () => {
  try {
    // Limpar apenas dados de teste (emails que contêm 'test.com')
    await pool.execute('DELETE FROM avaliacoes WHERE usuario_id IN (SELECT id FROM usuarios WHERE email LIKE "%test.com%")');
    await pool.execute('DELETE FROM usuarios WHERE email LIKE "%test.com%"');
  } catch (error) {
    // Ignorar erros de limpeza - dados podem não existir
  }
});

// Fechar conexões após todos os testes
afterAll(async () => {
  try {
    await pool.end();
  } catch (error) {
    // Ignorar erros de fechamento
  }
});