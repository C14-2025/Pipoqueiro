import OpenAI from "openai";

export class OpenAIService {
    private client: OpenAI;

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY não encontrada no arquivo .env");
        }

        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    /**
     * Gera uma resposta personalizada com base no contexto cinematográfico do usuário.
     * Nenhum histórico é salvo — tudo é temporário por sessão.
     */
    async generateResponse(userMessage: string, userContext?: UserContext): Promise<string> {
        const prompt = this.buildPrompt(userMessage, userContext);

        const completion = await this.client.chat.completions.create({
            model: "gpt-5",
            messages: [
                {
                    role: "system",
                    content: `Você é uma IA especialista em cinema. 
          Você entende o gosto cinematográfico do usuário com base em filmes favoritos, notas e gêneros preferidos. 
          Todas as respostas devem ser personalizadas, sem salvar histórico.`,
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.8,
            max_tokens: 400,
        });

        return completion.choices[0].message?.content || "Não foi possível gerar uma resposta.";
    }

    /**
     * Monta o contexto e formata o prompt a ser enviado para o modelo.
     */
    private buildPrompt(message: string, context?: UserContext): string {
        let contextText = "";

        if (context) {
            contextText += `🎬 Filmes favoritos: ${context.favoriteMovies?.join(", ") || "Não informado"}\n`;
            contextText += `⭐ Gêneros favoritos: ${context.favoriteGenres?.join(", ") || "Não informado"}\n`;
            contextText += `🗒️ Últimas reviews: ${context.reviews?.map(r => `${r.movie} (${r.rating}/10) - "${r.comment}"`).join("; ") ||
                "Nenhuma review registrada"
                }\n`;
            contextText += `📺 Watchlist: ${context.watchlist?.join(", ") || "Não informado"}\n\n`;
        }

        return `${contextText}Usuário diz: "${message}"\nResponda de forma natural e personalizada.`;
    }
}

// Tipagem opcional do contexto do usuário
export interface UserContext {
    favoriteMovies?: string[];
    favoriteGenres?: string[];
    reviews?: { movie: string; rating: number; comment: string }[];
    watchlist?: string[];
}
