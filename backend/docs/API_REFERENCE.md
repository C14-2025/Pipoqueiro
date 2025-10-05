# 🎬 API Pipoqueiro - Referência Completa

**Base URL:** `http://localhost:3000/api`

---

## 🔓 **ENDPOINTS PÚBLICOS**

### **Status da API**
```http
GET /health
```
**Response:**
```json
{
  "success": true,
  "message": "API Pipoqueiro funcionando!",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### **Teste do Banco**
```http
GET /test-db
```
**Response:**
```json
{
  "success": true,
  "message": "Banco conectado!",
  "usuarios": [{ "total": 4 }]
}
```

---

## 👤 **USUÁRIOS**

### **Registrar Usuário**
```http
POST /users/registrar
Content-Type: application/json
```
**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "bio": "Amo filmes!", // opcional
  "generos_favoritos": ["ação", "terror"], // opcional
  "data_nascimento": "1990-01-01" // opcional
}
```
**Response:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "nome": "João Silva",
      "email": "joao@email.com",
      "bio": "Amo filmes!",
      "generos_favoritos": ["ação", "terror"]
    }
  }
}
```

### **Login**
```http
POST /users/login
Content-Type: application/json
```
**Body:**
```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "nome": "João Silva",
      "email": "joao@email.com",
      "bio": "Amo filmes!",
      "generos_favoritos": ["ação", "terror"]
    }
  }
}
```

### **🔒 Obter Perfil (Requer Auth)**
```http
GET /users/perfil
Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "message": "Perfil obtido com sucesso",
  "data": {
    "id": 5,
    "nome": "João Silva",
    "email": "joao@email.com",
    "bio": "Amo filmes!",
    "generos_favoritos": ["ação", "terror"],
    "data_nascimento": "1990-01-01",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### **🔒 Atualizar Perfil (Requer Auth)**
```http
PUT /users/perfil
Authorization: Bearer {token}
Content-Type: application/json
```
**Body:**
```json
{
  "nome": "João Santos", // opcional
  "bio": "Nova bio", // opcional
  "generos_favoritos": ["ação", "comédia"] // opcional
}
```

### **🔒 Estatísticas do Usuário (Requer Auth)**
```http
GET /users/estatisticas
Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": {
      "total_reviews": 15,
      "nota_media": 4.2,
      "reviews_positivas": 12
    },
    "watchlist": {
      "filmes_na_lista": 8
    }
  }
}
```

---

## 🎬 **REVIEWS**

### **🔒 Criar Review (Requer Auth)**
```http
POST /reviews
Authorization: Bearer {token}
Content-Type: application/json
```
**Body:**
```json
{
  "tmdb_id": 550,
  "nota": 5,
  "titulo_review": "Filme incrível!",
  "comentario": "Uma obra prima do cinema...",
  "spoiler": false
}
```

### **Obter Reviews de um Filme**
```http
GET /reviews/filme/{tmdb_id}
```
**Query Params:**
- `spoiler=true|false` - Incluir reviews com spoiler (default: false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "tmdb_id": 550,
      "nota": 5,
      "titulo_review": "Obra-prima!",
      "comentario": "Filme incrível...",
      "spoiler": false,
      "curtidas": 12,
      "created_at": "2025-01-01T00:00:00.000Z",
      "nome": "João Silva",
      "foto_perfil": "https://avatar.com/joao.jpg"
    }
  ]
}
```

### **🔒 Minhas Reviews (Requer Auth)**
```http
GET /reviews/minhas
Authorization: Bearer {token}
```

### **🔒 Atualizar Review (Requer Auth)**
```http
PUT /reviews/{id}
Authorization: Bearer {token}
Content-Type: application/json
```
**Body:**
```json
{
  "nota": 4,
  "titulo_review": "Título atualizado",
  "comentario": "Comentário atualizado"
}
```

### **🔒 Excluir Review (Requer Auth)**
```http
DELETE /reviews/{id}
Authorization: Bearer {token}
```

### **Curtir Review**
```http
POST /reviews/{id}/curtir
```

---

## 📋 **LISTA "QUERO VER" (WATCHLIST)**

### **🔒 Obter Lista "Quero Ver" (Requer Auth)**
```http
GET /watchlist
Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "message": "Lista quero ver obtida com sucesso",
  "data": [
    {
      "id": 1,
      "tmdb_id": 550,
      "prioridade": "alta",
      "data_adicao": "2025-01-01T00:00:00.000Z",
      "onde_assistir": "Netflix",
      "notificar_lancamento": true,
      "title": "Clube da Luta",
      "poster_url": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "overview": "Um funcionário...",
      "release_date": "1999-10-15",
      "runtime": 139
    }
  ]
}
```

### **🔒 Adicionar à Lista "Quero Ver" (Requer Auth)**
```http
POST /watchlist
Authorization: Bearer {token}
Content-Type: application/json
```
**Body:**
```json
{
  "tmdb_id": 550,
  "prioridade": "alta", // opcional: baixa|media|alta (default: media)
  "onde_assistir": "Netflix", // opcional
  "notificar_lancamento": true // opcional (default: true)
}
```

### **🔒 Atualizar Item da Lista (Requer Auth)**
```http
PUT /watchlist/{tmdb_id}
Authorization: Bearer {token}
Content-Type: application/json
```
**Body:**
```json
{
  "prioridade": "baixa",
  "onde_assistir": "Amazon Prime",
  "notificar_lancamento": false
}
```

### **🔒 Remover da Lista "Quero Ver" (Requer Auth)**
```http
DELETE /watchlist/{tmdb_id}
Authorization: Bearer {token}
```

---

## ⭐ **FAVORITOS**

### **🔒 Obter Filmes Favoritos (Requer Auth)**
```http
GET /favorites
Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "message": "Filmes favoritos obtidos com sucesso",
  "data": [
    {
      "id": 1,
      "tmdb_id": 550,
      "created_at": "2025-01-01T00:00:00.000Z",
      "comentario_favorito": "Meu filme favorito de todos os tempos!",
      "title": "Clube da Luta",
      "poster_url": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "backdrop_url": "https://image.tmdb.org/t/p/w1280/...",
      "overview": "Um funcionário...",
      "release_date": "1999-10-15",
      "runtime": 139
    }
  ]
}
```

### **🔒 Adicionar aos Favoritos (Requer Auth)**
```http
POST /favorites
Authorization: Bearer {token}
Content-Type: application/json
```
**Body:**
```json
{
  "tmdb_id": 550,
  "comentario_favorito": "Filme incrível!" // opcional
}
```

### **🔒 Atualizar Comentário do Favorito (Requer Auth)**
```http
PUT /favorites/{tmdb_id}
Authorization: Bearer {token}
Content-Type: application/json
```
**Body:**
```json
{
  "comentario_favorito": "Novo comentário sobre este favorito"
}
```

### **🔒 Remover dos Favoritos (Requer Auth)**
```http
DELETE /favorites/{tmdb_id}
Authorization: Bearer {token}
```

### **🔒 Verificar se é Favorito (Requer Auth)**
```http
GET /favorites/check/{tmdb_id}
Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "is_favorite": true
  }
}
```

---

## 🎬 **FILMES (TMDB)**

### **Filmes Populares**
```http
GET /movies/popular?page=1
```
**Query Params:**
- `page` - Número da página (default: 1)

### **🏆 Ranking da Comunidade Pipoqueiro**
```http
GET /movies/ranking?limit=50&min_reviews=3
```
**Query Params:**
- `limit` - Número de filmes no ranking (default: 50)
- `min_reviews` - Mínimo de avaliações necessárias (default: 3)

**Response:**
```json
{
  "success": true,
  "message": "Filmes populares obtidos com sucesso",
  "data": [
    {
      "id": 550,
      "title": "Clube da Luta",
      "overview": "Um funcionário...",
      "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "poster_url": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "release_date": "1999-10-15",
      "vote_average": 8.4,
      "nossa_stats": {
        "total_reviews": 5,
        "nota_media": 4.6,
        "reviews_positivas": 4
      }
    }
  ]
}
```

**Response Ranking:**
```json
{
  "success": true,
  "message": "Top 50 filmes da comunidade Pipoqueiro",
  "data": [
    {
      "rank": 1,
      "tmdb_id": 550,
      "title": "Clube da Luta",
      "overview": "Um funcionário...",
      "poster_url": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "backdrop_url": "https://image.tmdb.org/t/p/w1280/...",
      "release_date": "1999-10-15",
      "runtime": 139,
      "vote_average": 8.4,
      "nossa_stats": {
        "total_avaliacoes": 25,
        "nota_media": "4.8",
        "avaliacoes_positivas": 23,
        "percentual_positivo": 92
      }
    }
  ],
  "meta": {
    "total_filmes": 50,
    "min_reviews_required": 3,
    "ordenacao": "nota_media DESC, total_avaliacoes DESC"
  }
}
```

### **Buscar Filmes**
```http
GET /movies/search?query={termo}&page=1
```
**Query Params:**
- `query` - Termo de busca (obrigatório)
- `page` - Número da página (default: 1)

### **Detalhes do Filme**
```http
GET /movies/{tmdb_id}
```
**Response:**
```json
{
  "success": true,
  "message": "Detalhes do filme obtidos com sucesso",
  "data": {
    "id": 550,
    "title": "Clube da Luta",
    "overview": "Um funcionário...",
    "poster_url": "https://image.tmdb.org/t/p/w500/...",
    "backdrop_url": "https://image.tmdb.org/t/p/w1280/...",
    "release_date": "1999-10-15",
    "runtime": 139,
    "genres": [{"id": 18, "name": "Drama"}],
    "vote_average": 8.4,
    "reviews": [
      {
        "id": 1,
        "nota": 5,
        "titulo_review": "Obra-prima!",
        "comentario": "Filme incrível...",
        "nome": "João Silva",
        "foto_perfil": "https://..."
      }
    ],
    "stats": {
      "total_reviews": 5,
      "nota_media": 4.6,
      "reviews_positivas": 4,
      "reviews_com_spoiler": 1
    }
  }
}
```

---

## 🗑️ **EXCLUSÃO DE CONTA**

### **🔒 Excluir Conta (Requer Auth)**
```http
DELETE /users/conta
Authorization: Bearer {token}
```
**Response:**
```json
{
  "success": true,
  "message": "Conta excluída com sucesso"
}
```
**⚠️ ATENÇÃO:** Esta ação remove TODOS os dados do usuário (reviews, watchlist, favoritos).

---

## 🔐 **AUTENTICAÇÃO**

### **Como usar o token:**
1. **Fazer login** ou **registrar** para obter o token
2. **Incluir** em todas as requisições protegidas:
```http
Authorization: Bearer {seu_token_aqui}
```

### **Tratamento de erros de auth:**
```json
{
  "success": false,
  "message": "Token não fornecido" // ou "Token inválido"
}
```

---

## ❌ **CÓDIGOS DE ERRO**

| Código | Significado |
|--------|------------|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `400` | Dados inválidos |
| `401` | Não autorizado (token inválido) |
| `404` | Não encontrado |
| `500` | Erro do servidor |

---

## 🧪 **TESTANDO A API**

### **Ferramentas recomendadas:**
- **Postman** 
- **Insomnia**
- **Thunder Client** (VS Code)
- **curl**

### **Fluxo básico:**
1. `POST /users/registrar` - Criar conta
2. Salvar o `token` retornado  
3. Usar o token nas requisições protegidas
4. `POST /reviews` - Criar reviews
5. `GET /reviews/filme/550` - Ver reviews

---

## 🎯 **EXEMPLOS PRÁTICOS**

### **Registrar e criar review:**
```bash
# 1. Registrar
curl -X POST http://localhost:3000/api/users/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test User","email":"test@test.com","senha":"123456"}'

# 2. Usar o token retornado para criar review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"tmdb_id":550,"nota":5,"titulo_review":"Incrível!"}'
```

### **Ver reviews de um filme:**
```bash
curl http://localhost:3000/api/reviews/filme/550
```

### **Ver ranking da comunidade:**
```bash
# Top 50 filmes da comunidade
curl http://localhost:3000/api/movies/ranking

# Top 20 filmes com pelo menos 5 avaliações
curl "http://localhost:3000/api/movies/ranking?limit=20&min_reviews=5"
```

---

**📝 Criado para o time frontend - Happy coding! 🚀**