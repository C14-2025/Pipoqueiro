# 🎯 PASSO A PASSO - INTEGRAÇÃO TMDb API

**PRÉ-REQUISITO:** Backend básico deve estar funcionando primeiro!

---

## **PASSO 1: Criar conta TMDb (15 min)**

```bash
# 1. Ir em https://www.themoviedb.org/
# 2. Criar conta gratuita
# 3. Ir em Settings > API
# 4. Copiar "API Key (v3 auth)"
# 5. Guardar a chave para usar depois
```

---

## **PASSO 2: Instalar dependência no backend (2 min)**

```bash
cd backend/
npm install axios
```

---

## **PASSO 3: Criar service TMDb (20 min)**

**Criar `src/services/tmdbService.ts`:**

```typescript
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'SUA_CHAVE_AQUI';
const BASE_URL = 'https://api.themoviedb.org/3';

export class TMDbService {
  private api = axios.create({
    baseURL: BASE_URL,
    params: {
      api_key: TMDB_API_KEY,
      language: 'pt-BR'
    }
  });

  // Filmes populares
  async getPopularMovies(page = 1) {
    try {
      const response = await this.api.get('/movie/popular', { params: { page } });
      return response.data.results;
    } catch (error) {
      throw new Error('Erro ao buscar filmes populares');
    }
  }

  // Buscar filmes
  async searchMovies(query: string, page = 1) {
    try {
      const response = await this.api.get('/search/movie', {
        params: { query, page }
      });
      return response.data.results;
    } catch (error) {
      throw new Error('Erro ao buscar filmes');
    }
  }

  // Detalhes do filme
  async getMovieDetails(tmdbId: number) {
    try {
      const response = await this.api.get(`/movie/${tmdbId}`);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao buscar detalhes');
    }
  }

  // Formatar URL do poster
  formatPosterURL(path: string | null) {
    if (!path) return 'https://via.placeholder.com/500x750/374151/9CA3AF?text=Sem+Poster';
    return `https://image.tmdb.org/t/p/w500${path}`;
  }
}
```

---

## **PASSO 4: Criar controller de filmes (25 min)**

**Criar `src/controllers/movieController.ts`:**

```typescript
import { Request, Response } from 'express';
import { TMDbService } from '../services/tmdbService';
import pool from '../config/database';

export class MovieController {
  private tmdbService = new TMDbService();

  // GET /api/movies/popular
  async getPopular(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const tmdbMovies = await this.tmdbService.getPopularMovies(page);
      
      // Para cada filme, buscar nossas estatísticas
      const moviesWithStats = await Promise.all(
        tmdbMovies.map(async (movie: any) => {
          const [stats] = await pool.execute(
            `SELECT 
              COUNT(*) as total_reviews,
              AVG(nota) as nota_media,
              COUNT(CASE WHEN nota >= 4 THEN 1 END) as reviews_positivas
             FROM avaliacoes WHERE tmdb_id = ?`,
            [movie.id]
          );

          return {
            ...movie,
            poster_url: this.tmdbService.formatPosterURL(movie.poster_path),
            nossa_stats: (stats as any[])[0]
          };
        })
      );

      res.json({
        success: true,
        message: 'Filmes populares obtidos com sucesso',
        data: moviesWithStats
      });

    } catch (error) {
      console.error('Erro ao obter filmes populares:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar filmes populares'
      });
    }
  }

  // GET /api/movies/search
  async search(req: Request, res: Response) {
    try {
      const { query, page = 1 } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro de busca é obrigatório'
        });
      }

      const tmdbMovies = await this.tmdbService.searchMovies(query as string, parseInt(page as string));
      
      const moviesWithStats = await Promise.all(
        tmdbMovies.map(async (movie: any) => {
          const [stats] = await pool.execute(
            `SELECT 
              COUNT(*) as total_reviews,
              AVG(nota) as nota_media
             FROM avaliacoes WHERE tmdb_id = ?`,
            [movie.id]
          );

          return {
            ...movie,
            poster_url: this.tmdbService.formatPosterURL(movie.poster_path),
            nossa_stats: (stats as any[])[0]
          };
        })
      );

      res.json({
        success: true,
        message: 'Busca realizada com sucesso',
        data: moviesWithStats
      });

    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar filmes'
      });
    }
  }

  // GET /api/movies/:tmdbId
  async getDetails(req: Request, res: Response) {
    try {
      const { tmdbId } = req.params;
      
      const movieDetails = await this.tmdbService.getMovieDetails(parseInt(tmdbId));
      
      // Buscar reviews do filme
      const [reviews] = await pool.execute(
        `SELECT a.*, u.nome, u.foto_perfil 
         FROM avaliacoes a 
         JOIN usuarios u ON a.usuario_id = u.id 
         WHERE a.tmdb_id = ? 
         ORDER BY a.created_at DESC`,
        [tmdbId]
      );

      // Buscar estatísticas
      const [stats] = await pool.execute(
        `SELECT 
          COUNT(*) as total_reviews,
          AVG(nota) as nota_media,
          COUNT(CASE WHEN nota >= 4 THEN 1 END) as reviews_positivas,
          COUNT(CASE WHEN spoiler = TRUE THEN 1 END) as reviews_com_spoiler
         FROM avaliacoes WHERE tmdb_id = ?`,
        [tmdbId]
      );

      res.json({
        success: true,
        message: 'Detalhes do filme obtidos com sucesso',
        data: {
          ...movieDetails,
          poster_url: this.tmdbService.formatPosterURL(movieDetails.poster_path),
          backdrop_url: movieDetails.backdrop_path ? 
            `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}` : null,
          reviews: reviews,
          stats: (stats as any[])[0]
        }
      });

    } catch (error) {
      console.error('Erro ao obter detalhes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar detalhes do filme'
      });
    }
  }
}
```

---

## **PASSO 5: Criar rotas de filmes (10 min)**

**Criar `src/routes/movies.ts`:**

```typescript
import { Router } from 'express';
import { MovieController } from '../controllers/movieController';

const router = Router();
const movieController = new MovieController();

// Filmes populares
router.get('/popular', movieController.getPopular.bind(movieController));

// Buscar filmes
router.get('/search', movieController.search.bind(movieController));

// Detalhes do filme
router.get('/:tmdbId', movieController.getDetails.bind(movieController));

export default router;
```

---

## **PASSO 6: Adicionar rotas no app.ts (5 min)**

**Editar `src/app.ts`, adicionar:**

```typescript
import movieRoutes from './routes/movies';

// ... outras rotas ...
app.use('/api/movies', movieRoutes);
```

---

## **PASSO 7: Atualizar .env (2 min)**

**Adicionar sua chave TMDb no `.env`:**

```env
TMDB_API_KEY=sua_chave_tmdb_real_aqui
```

---

## **PASSO 8: Testar endpoints (10 min)**

```bash
# Filmes populares
GET http://localhost:3000/api/movies/popular

# Buscar filme
GET http://localhost:3000/api/movies/search?query=vingadores

# Detalhes específicos
GET http://localhost:3000/api/movies/550
```

---

## ✅ **CHECKLIST FINAL:**

- [ ] Conta TMDb criada e API key obtida
- [ ] Axios instalado
- [ ] Service TMDb funcionando
- [ ] 3 endpoints de filmes respondendo
- [ ] Dados TMDb + nossas stats combinados
- [ ] URLs de poster formatadas corretamente
- [ ] Busca por nome funcionando
- [ ] Detalhes de filme específico funcionando
- [ ] Tratamento de erros implementado
- [ ] Commit feito e enviado

**Total: ~1.5-2 horas de trabalho ⏰**

**Agora o backend está completo: reviews locais + catálogo TMDb! 🎬🚀**