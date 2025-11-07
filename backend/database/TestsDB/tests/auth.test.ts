import jwt from "jsonwebtoken";
import { authMiddleware } from "../src/auth";

describe("🔒 Testes do Auth Middleware", () => {
  const JWT_SECRET = process.env.JWT_SECRET || "testsecret";

  // Função para criar mock de res
  function createMockRes() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  }

  it("testAuthMiddlewareValido", () => {
    const token = jwt.sign({ id: 1, nome: "Alice" }, JWT_SECRET, { expiresIn: "1h" });

    const req: any = {
      headers: { authorization: `Bearer ${token}` },
    };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(1);
  });

  it("testAuthMiddlewareInvalido", () => {
    const req: any = {
      headers: { authorization: "Bearer token_invalido" },
    };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("testAuthMiddlewareSemToken", () => {
    const req: any = { headers: {} };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token não fornecido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("testAuthMiddlewareExpired", async () => {
    const token = jwt.sign({ id: 2, nome: "Bob" }, JWT_SECRET, { expiresIn: "1ms" });

    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    const next = jest.fn();

    // Aguarda expiração do token
    await new Promise((resolve) => setTimeout(resolve, 10));

    authMiddleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("testAuthMiddlewareFormat", () => {
    const token = jwt.sign({ id: 3, nome: "Charlie" }, JWT_SECRET, { expiresIn: "1h" });

    const req: any = {
      headers: { authorization: `${token}` }, // sem "Bearer "
    };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token não fornecido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("testAuthMiddlewareUser", () => {
    const token = jwt.sign({ id: 99, nome: "Tester" }, JWT_SECRET, { expiresIn: "1h" });

    const req: any = {
      headers: { authorization: `Bearer ${token}` },
    };
    const res = createMockRes();
    const next = jest.fn();

    authMiddleware(req, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(expect.objectContaining({ id: 99, nome: "Tester" }));
  });
});
