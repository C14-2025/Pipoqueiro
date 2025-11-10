import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users';
import reviewRoutes from './routes/reviews';
import movieRoutes from './routes/movies';
import watchlistRoutes from './routes/watchlist';
import favoritesRoutes from './routes/favorites';
import { requestLogger } from './middleware/logger';
import chatRoutes from './routes/chat';
import { supabase } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Pipoqueiro funcionando!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (error) throw error;

    res.json({ message: 'Conexão com Supabase bem-sucedida!', data: data });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao conectar no Supabase', details: error.message });
  }
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📡 Supabase check: http://localhost:${PORT}/api/test-db`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;