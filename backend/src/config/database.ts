import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';
import { logSuccess, logError, logInfo } from '../middleware/logger';

dotenv.config();

interface DatabaseConfig extends PoolOptions {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  charset: string;
  timezone: string;
}

const validateEnvVars = (): void => {
  const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    logError(`Variáveis de ambiente faltando: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

const createDatabaseConfig = (): DatabaseConfig => {
  validateEnvVars();

  return {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    charset: 'utf8mb4',
    timezone: '+00:00',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
};

const config = createDatabaseConfig();
const pool: Pool = mysql.createPool(config);

export const connectDB = async (): Promise<void> => {
  try {
    logInfo('🔌 Conectando ao banco de dados MySQL...');
    const connection = await pool.getConnection();

    logSuccess('✅ Conectado ao MySQL', {
      host: config.host,
      database: config.database,
      user: config.user
    });

    connection.release();
  } catch (error) {
    logError('❌ Erro ao conectar com o banco de dados:', error);
    throw error;
  }
};

export default pool;