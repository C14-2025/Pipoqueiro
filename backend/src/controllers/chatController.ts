import { Request, Response } from 'express';
import { OpenAIService } from '../services/openaiService';
import { logError } from '../middleware/logger';

export class ChatController {
  private openAIService = new OpenAIService();

  async sendMessage(req: Request, res: Response) {
    try {
      const { message, userContext } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Mensagem inválida ou ausente'
        });
      }

      const aiResponse = await this.openAIService.generateResponse(message, userContext);

      res.json({
        success: true,
        message: 'Resposta gerada com sucesso',
        data: { response: aiResponse }
      });
    } catch (error) {
      logError('Erro ao processar mensagem no chat:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
