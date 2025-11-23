# Setup do Banco de Dados Supabase - Pipoqueiro

**Guia completo para configurar o Supabase (PostgreSQL) do projeto Pipoqueiro**

---

## 🎯 **Tecnologia Utilizada**

O projeto **Pipoqueiro** utiliza **Supabase** como backend, que fornece:
- **PostgreSQL** (banco de dados relacional)
- **API REST automática**
- **Autenticação** (não utilizada - usamos JWT próprio)
- **Realtime** (não utilizado no momento)
- **Storage** (não utilizado no momento)

**Por que Supabase?**
- ✅ PostgreSQL gerenciado (sem necessidade de configurar servidor)
- ✅ SDK JavaScript nativo
- ✅ Suporte a JSON nativo (campos `favoritos` e `lista_quero_ver`)
- ✅ Functions PostgreSQL (RPCs)
- ✅ Interface web amigável

---

## 🚀 **Opção 1: Criar Projeto no Supabase (Recomendado)**

### 1. Criar Conta no Supabase
1. Acessar: https://supabase.com
2. Criar conta gratuita
3. Criar novo projeto
4. **Anotar:**
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Executar Scripts SQL no Supabase

**No painel do Supabase:**
1. Ir em **SQL Editor** (menu lateral)
2. Clicar em **New Query**
3. Executar EM ORDEM:

#### **Passo 1: Criar Tabelas**
```sql
-- Copiar e colar todo o conteúdo de:
-- backend/supabaseQueries/createTables.sql
```

#### **Passo 2: Criar Functions PostgreSQL**
```sql
-- Copiar e colar todo o conteúdo de:
-- backend/supabaseQueries/functions.sql
```

### 3. Configurar Backend

Criar arquivo `.env` na pasta `backend/`:

```env
# 🗄️ SUPABASE (POSTGRESQL)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 🔐 JWT CONFIGURAÇÃO
JWT_SECRET=seu_jwt_secret_aqui_muito_seguro_123
JWT_EXPIRES_IN=7d

# 🌐 CORS (para conectar com frontend)
CORS_ORIGIN=http://localhost:3000

# 🎬 TMDB API (opcional - para buscar filmes)
TMDB_API_KEY=sua_chave_tmdb_aqui

# 🚀 SERVIDOR
PORT=3000
NODE_ENV=development

# 🤖 OPENAI API (opcional - para chatbot)
OPENAI_API_KEY=sua_chave_openai_aqui
```

---

## 🛠️ **Opção 2: PostgreSQL Local (Desenvolvimento)**

Se preferir rodar PostgreSQL localmente:

### 1. Instalar PostgreSQL
- **Download:** https://www.postgresql.org/download/
- **Porta padrão:** 5432
- **Usuário padrão:** postgres

### 2. Criar Database
```sql
CREATE DATABASE pipoqueiro;
```

### 3. Executar Scripts
```bash
psql -U postgres -d pipoqueiro -f backend/supabaseQueries/createTables.sql
psql -U postgres -d pipoqueiro -f backend/supabaseQueries/functions.sql
```

### 4. Configurar .env para PostgreSQL Local
```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/pipoqueiro
# ... resto das configs
```

---

## 📊 **Estrutura do Banco de Dados**

### **Tabelas Criadas:**

#### 1. `usuarios`
Armazena perfis e autenticação dos usuários.

**Campos:**
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR(100))
- `email` (VARCHAR(100) UNIQUE)
- `senha_hash` (VARCHAR(255))
- `bio` (TEXT, nullable)
- `foto_perfil` (VARCHAR(500), nullable)
- `generos_favoritos` (JSON) - Array de strings
- `data_nascimento` (DATE, nullable)
- `favoritos` (JSON) - Array de IDs de filmes
- `lista_quero_ver` (JSON) - Array de IDs de filmes
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Exemplo de dados JSON:**
```json
{
  "generos_favoritos": ["Ação", "Terror", "Ficção Científica"],
  "favoritos": [550, 680, 278],
  "lista_quero_ver": [120, 238, 155]
}
```

#### 2. `avaliacoes`
Armazena reviews de filmes dos usuários.

**Campos:**
- `id` (SERIAL PRIMARY KEY)
- `usuario_id` (INT, FOREIGN KEY → usuarios.id)
- `tmdb_id` (INT) - ID do filme no TMDB
- `nota` (INT CHECK 1-5)
- `titulo_review` (VARCHAR(200), nullable)
- `comentario` (TEXT, nullable)
- `spoiler` (BOOLEAN, default FALSE)
- `curtidas` (INT, default 0)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Constraints:**
- UNIQUE(usuario_id, tmdb_id) - Usuário só pode avaliar filme uma vez
- ON DELETE CASCADE - Remove reviews ao excluir usuário

---

## 🔧 **Functions PostgreSQL (RPCs)**

O projeto usa **PostgreSQL Functions** para operações complexas:

### 1. `get_user_stats(p_user_id INT)`
**Retorna:** Estatísticas do usuário (reviews, watchlist, favoritos)

**Usado em:** `GET /api/users/estatisticas`

```sql
SELECT * FROM get_user_stats(1);
```

### 2. `add_to_watchlist(p_user_id INT, p_tmdb_id INT)`
**Retorna:** Lista atualizada de "Quero Ver"

**Usado em:** `POST /api/watchlist`

### 3. `add_to_favorites(p_user_id INT, p_tmdb_id INT)`
**Retorna:** Lista atualizada de favoritos

**Usado em:** `POST /api/favorites`

### 4. `remove_from_watchlist(p_user_id INT, p_tmdb_id INT)`
**Retorna:** Lista atualizada de "Quero Ver"

**Usado em:** `DELETE /api/watchlist/:tmdb_id`

### 5. `remove_from_favorites(p_user_id INT, p_tmdb_id INT)`
**Retorna:** Lista atualizada de favoritos

**Usado em:** `DELETE /api/favorites/:tmdb_id`

---

## 🧪 **Testar Conexão**

### 1. Iniciar Backend
```bash
cd backend/
npm install
npm run dev
```

### 2. Testar Endpoints
```bash
# API funcionando?
curl http://localhost:3000/api/health

# Ver filmes populares:
curl http://localhost:3000/api/movies/popular

# Ver ranking da comunidade:
curl http://localhost:3000/api/movies/ranking
```

---

## 📡 **APIs Disponíveis**

### Usuários
- `POST /api/users/registrar` - Criar conta
- `POST /api/users/login` - Login
- `GET /api/users/perfil` - Ver perfil
- `PUT /api/users/perfil` - Atualizar perfil
- `GET /api/users/estatisticas` - Estatísticas do usuário
- `DELETE /api/users/conta` - Excluir conta

### Reviews
- `POST /api/reviews` - Criar review
- `GET /api/reviews/filme/:tmdb_id` - Reviews de um filme
- `GET /api/reviews/minhas` - Minhas reviews
- `PUT /api/reviews/:id` - Atualizar review
- `DELETE /api/reviews/:id` - Excluir review

### Filmes (TMDB)
- `GET /api/movies/popular` - Filmes populares
- `GET /api/movies/ranking` - Ranking comunidade
- `GET /api/movies/search` - Buscar filmes
- `GET /api/movies/:tmdbId` - Detalhes do filme
- `GET /api/movies/:tmdbId/videos` - Vídeos/trailers
- `GET /api/movies/:tmdbId/credits` - Elenco/equipe
- `GET /api/movies/:tmdbId/similar` - Filmes similares

### Watchlist
- `GET /api/watchlist` - Obter lista "Quero Ver"
- `POST /api/watchlist` - Adicionar filme
- `DELETE /api/watchlist/:tmdb_id` - Remover filme

### Favoritos
- `GET /api/favorites` - Obter favoritos
- `POST /api/favorites` - Adicionar favorito
- `DELETE /api/favorites/:tmdb_id` - Remover favorito

### Chat IA
- `POST /api/chat` - Conversar com IA sobre filmes

---

## 🔍 **Como o Projeto Usa Supabase**

### **Padrão de Queries (Supabase SDK)**

O projeto **NÃO usa SQL raw**. Usa o **Supabase SDK**:

```javascript
// ❌ NÃO fazemos assim (SQL raw):
db.query("SELECT * FROM usuarios WHERE id = ?", [userId])

// ✅ Fazemos assim (Supabase SDK):
supabase
  .from('usuarios')
  .select('*')
  .eq('id', userId)
  .single()
```

### **Padrão de Queries com JOIN**

```javascript
// Exemplo: Reviews com dados do usuário
const { data, error } = await supabase
  .from('avaliacoes')
  .select(`
    *,
    usuarios ( nome, foto_perfil )
  `)
  .eq('tmdb_id', movieId)
  .order('created_at', { ascending: false });
```

### **Padrão de RPCs (Functions)**

```javascript
// Chamar function PostgreSQL
const { data, error } = await supabase
  .rpc('get_user_stats', { p_user_id: userId });
```

---

## 🚨 **Troubleshooting**

### Erro: "Invalid API Key"
- Verificar `SUPABASE_KEY` no `.env`
- Usar **anon key** (não service_role key)

### Erro: "relation does not exist"
- Executar `createTables.sql` no SQL Editor do Supabase
- Verificar se tabelas foram criadas na aba "Table Editor"

### Erro: "function does not exist"
- Executar `functions.sql` no SQL Editor
- Verificar se functions foram criadas na aba "Database" → "Functions"

### Scripts não executam
- Copiar e colar manualmente no SQL Editor do Supabase
- Executar um script por vez
- Verificar mensagens de erro no próprio editor

---

## 🔄 **Diferenças do MySQL para Supabase/PostgreSQL**

| Feature | MySQL (Antigo) | Supabase/PostgreSQL (Atual) |
|---------|----------------|------------------------------|
| **Banco** | MySQL | PostgreSQL |
| **Queries** | SQL raw com `?` | Supabase SDK com métodos |
| **JSON** | JSON com suporte limitado | JSON nativo com funções |
| **Functions** | Stored Procedures | PostgreSQL Functions (PL/pgSQL) |
| **Auto-increment** | AUTO_INCREMENT | SERIAL |
| **Timestamps** | TIMESTAMP | TIMESTAMPTZ |
| **Booleans** | TINYINT(1) | BOOLEAN nativo |

---

## 📝 **Arquivos Importantes**

```
📁 backend/
  📁 supabaseQueries/
    📄 createTables.sql       # Cria tabelas usuarios e avaliacoes
    📄 functions.sql          # Cria functions PostgreSQL (RPCs)
  📁 src/
    📁 config/
      📄 database.ts          # Configuração do Supabase client
    📁 controllers/
      📄 *.ts                 # Usam supabase.from() e supabase.rpc()
```

---

## ✅ **Checklist de Setup**

- [ ] Criar projeto no Supabase
- [ ] Obter SUPABASE_URL e SUPABASE_KEY
- [ ] Criar arquivo `.env` no backend
- [ ] Executar `createTables.sql` no SQL Editor
- [ ] Executar `functions.sql` no SQL Editor
- [ ] Verificar tabelas criadas no Table Editor
- [ ] Verificar functions criadas em Database → Functions
- [ ] Rodar `npm install` no backend
- [ ] Rodar `npm run dev` no backend
- [ ] Testar `curl http://localhost:3000/api/health`

---

**Para mais detalhes, consultar:** `docs/API_REFERENCE.md`
