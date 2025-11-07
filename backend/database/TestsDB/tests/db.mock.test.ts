import * as db from "../src/db";

jest.mock("../src/db", () => {
    return {
        __esModule: true,
        // mockamos apenas a função query
        query: jest.fn(),
    };
});

describe("🧪 Testes unitários de DB com mock", () => {
    it("retorna usuários simulados", async () => {
        (db.query as jest.Mock).mockResolvedValueOnce([{ id: 1, nome: "Alice" }]);

        const result = await db.query("SELECT * FROM usuarios WHERE id = ?", [1]);

        expect(result).toEqual([{ id: 1, nome: "Alice" }]);
        expect(db.query).toHaveBeenCalledWith(
            "SELECT * FROM usuarios WHERE id = ?",
            [1]
        );
    });

    it("simula erro de SQL", async () => {
        (db.query as jest.Mock).mockRejectedValueOnce(new Error("Erro SQL"));

        await expect(db.query("SELECT * FROM tabela_inexistente")).rejects.toThrow(
            "Erro SQL"
        );
    });
});