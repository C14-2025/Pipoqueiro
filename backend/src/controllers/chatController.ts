import { Request, Response } from 'express';
import OpenAI from 'openai';
import { logInfo, logSuccess, logError } from '../middleware/logger';

const systemPrompt = `
Você é o 'Pipoqueiro', um assistente de IA amigável, divertido e 
extremamente especialista em cinema e televisão. Sua única função
é conversar com usuários sobre filmes, séries, atores, diretores e 
dar recomendações.

REGRAS:
1. NUNCA responda sobre nenhum outro tópico que não seja cinema ou TV.
2. Se o usuário perguntar sobre qualquer outro tópico que não seja cinema ou TV 
   (como política, esportes, matemática, etc.), você deve gentilmente recusar. 
   Diga a ele que você não pode falar sobre isso, pois o CR7 e o Messi não deixam.
3. Seja sempre prestativo e use uma linguagem casual, como um amigo
   apaixonado por filmes.
4. Mantenha as respostas relativamente curtas e focadas.
`;

export class ChatController {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // POST /api/chat
  async handleChatMessage(req: Request, res: Response) {
    try {
      logInfo('NOVA MENSAGEM PARA O CHAT');
      const { prompt, historico } = req.body;
      const userId = (req as any).user.userId; // ID do usuário logado

      if (!process.env.OPENAI_API_KEY) {
        logError('OPENAI_API_KEY não definida no .env');
        return res.status(500).json({
          success: false,
          message: 'Configuração do servidor incompleta.'
        });
      }

      if (!prompt) {
        logError('Prompt (mensagem) não fornecido');
        return res.status(400).json({
          success: false,
          message: 'Nenhuma mensagem fornecida.'
        });
      }

      logInfo('Processando mensagem com OpenAI...', [userId, prompt]);

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ];
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 200,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0].message?.content;
      logSuccess('Resposta da IA gerada com sucesso');

      res.json({
        success: true,
        message: 'Resposta gerada',
        data: {
          response: aiResponse || 'Não consegui pensar em nada.'
        }
      });

    } catch (error) {
      logError('ERRO AO PROCESSAR CHAT:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao processar chat'
      });
    }
  }
}