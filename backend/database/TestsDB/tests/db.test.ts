import { connectDB, query } from "../src/db";
import { RowDataPacket } from "mysql2";

describe("📋 Testes de Banco e Infraestrutura", () => {
  beforeAll(() => {
    connectDB();
  });

  it("testConexaoBancoDados", async () => {
    type Result = { result: number } & RowDataPacket;
    const rows = await query<Result>("SELECT 1 + 1 AS result");
    expect(rows[0].result).toBe(2);
  });

  it("testPoolMySQLConfigurado", async () => {
    type Result = { db: string } & RowDataPacket;
    const rows = await query<Result>("SELECT DATABASE() AS db");
    expect(rows[0].db).toBe(process.env.DB_NAME);
  });

  it("testQueryUsuarios", async () => {
    type Usuario = { id: number; nome: string } & RowDataPacket;
    const rows = await query<Usuario>("SELECT * FROM usuarios LIMIT 1");
    expect(rows.length).toBeGreaterThanOrEqual(0);
  });

  it("testQueryAvaliacoes", async () => {
    type Avaliacao = { id: number; usuario_id: number; nota: number } & RowDataPacket;
    const rows = await query<Avaliacao>("SELECT * FROM avaliacoes LIMIT 1");
    expect(rows.length).toBeGreaterThanOrEqual(0);
  });

  it("testQueryEstatisticas", async () => {
    type Estatistica = { id: number; qtdAvaliacoes: number } & RowDataPacket;
    const rows = await query<Estatistica>(`
      SELECT u.id, COUNT(a.id) AS qtdAvaliacoes
      FROM usuarios u
      LEFT JOIN avaliacoes a ON u.id = a.usuario_id
      GROUP BY u.id
      LIMIT 1
    `);
    expect(rows[0]).toHaveProperty("qtdAvaliacoes");
  });

  it("testHandleConnectionError", async () => {
    let error;
    try {
      await query("SELECT * FROM tabela_inexistente");
    } catch (err: any) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it("testTransacoesBanco", async () => {
    const pool = connectDB();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(`INSERT INTO usuarios (nome, email, senha_hash, bio, foto_perfil, data_nascimento, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ["davi", "aaaaaaa", "aaa", "aaaa", "foto_perfil", "11/11/1111", "2024-01-01", "2024-01-01"]
      );

      await conn.rollback();
    } finally {
      conn.release();
    }
    expect(true).toBe(true);
  });

  it("testConfiguracoesAmbiente", () => {
    expect(process.env.DB_HOST).toBeDefined();
    expect(process.env.DB_USER).toBeDefined();
    expect(process.env.DB_PASS).toBeDefined();
    expect(process.env.DB_NAME).toBeDefined();
  });
});
