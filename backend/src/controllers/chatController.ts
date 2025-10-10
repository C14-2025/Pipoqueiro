import { Request, Response } from "express";
import { OpenAIService } from "../services/openaiService";


// Instância única (sem salvar histórico, apenas para chamadas temporárias)
const openAIService = new OpenAIService();

export const chatController = {
    /**
     * Envia uma mensagem para a IA com o contexto temporário do usuário.
     * Nenhuma informação é persistida — tudo é descartado após a resposta.
     */
    async sendMessage(req: Request, res: Response) {
        try {
            const { message, userContext } = req.body;

            if (!message || typeof message !== "string") {
                return res.status(400).json({ error: "Mensagem inválida ou ausente." });
            }

            // Chama o serviço da OpenAI com o contexto do usuário
            const aiResponse = await openAIService.generateResponse(message, userContext);

            return res.status(200).json({
                success: true,
                response: aiResponse,
            });
        } catch (error) {
            console.error("Erro ao processar mensagem no chatController:", error);
            return res.status(500).json({
                success: false,
                error: "Erro interno ao gerar resposta da IA.",
            });
        }
    },
};
