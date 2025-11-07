import mysql, { Pool, RowDataPacket } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });


let pool: Pool | null = null;

/**
 * Conecta ao banco de dados usando variáveis de ambiente
 */
export function connectDB(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });

    console.log("✅ Pool de conexões MySQL configurado");
  }
  return pool;
}

/**
 * Executa query genérica tipada
 */
export async function query<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  if (!pool) connectDB();
  const [rows] = await pool!.query<T[]>(sql, params);
  return rows;
}

/**
 * Fecha todas as conexões (usado em teardown de testes)
 */
export async function closeDB(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("🔌 Conexão fechada");
  }
}

/**
 * Executa transações manualmente
 */
export async function runTransaction(
  callback: (conn: mysql.PoolConnection) => Promise<void>
): Promise<void> {
  if (!pool) connectDB();
  const connection = await pool!.getConnection();
  try {
    await connection.beginTransaction();
    await callback(connection);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
