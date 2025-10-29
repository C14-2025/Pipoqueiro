# Setup do Banco de Dados MySQL - Pipoqueiro

**Guia completo para configurar o MySQL do projeto Pipoqueiro**

---

## Opção 1: MySQL Workbench (Recomendado)

### 1. Instalar MySQL
- **Download:** https://dev.mysql.com/downloads/installer/
- **Escolher:** MySQL Installer for Windows
- **Durante instalação:** definir senha para usuário `root`
- **Anotar:** essa senha será usada no `.env`

### 2. Instalar MySQL Workbench
- Já vem incluído no MySQL Installer
- **Ou baixar separado:** https://dev.mysql.com/downloads/workbench/

### 3. Conectar no Workbench
1. Abrir MySQL Workbench
2. Conectar em `localhost:3306`
3. Usuário: `root`
4. Senha: a que você definiu na instalação

### 4. Executar Scripts SQL
**Na pasta `database/` do projeto, executar EM ORDEM:**

```sql
-- 1. Criar database
SOURCE C:/caminho/para/projeto/database/01-create-database.sql

-- 2. Criar tabelas
SOURCE C:/caminho/para/projeto/database/02-create-tables.sql

-- 3. Inserir dados
SOURCE C:/caminho/para/projeto/database/03-insert-data.sql
```

**Ou copiar e colar cada arquivo diretamente no Workbench.**

---

## Opção 2: Via Command Line

### 1. Conectar ao MySQL
```bash
mysql -u root -p
# Digite sua senha do MySQL
```

### 2. Executar Scripts
```sql
-- Dentro do MySQL CLI:
SOURCE C:\\caminho\\para\\projeto\\database\\01-create-database.sql
SOURCE C:\\caminho\\para\\projeto\\database\\02-create-tables.sql
SOURCE C:\\caminho\\para\\projeto\\database\\03-insert-data.sql
```

---

## Opção 3: PowerShell (Windows)

### 1. Na pasta database/ do projeto:
```powershell
# Executar em ordem:
Get-Content 01-create-database.sql | mysql -u root -p
Get-Content 02-create-tables.sql | mysql -u root -p
Get-Content 03-insert-data.sql | mysql -u root -p
```

---

## Opção 4: XAMPP (Mais Simples)

### 1. Instalar XAMPP
- **Download:** https://www.apachefriends.org/download.html
- **Incluí:** Apache, MySQL e phpMyAdmin

### 2. Iniciar MySQL no XAMPP
- Abrir XAMPP Control Panel
- Start → MySQL

### 3. Acessar phpMyAdmin
- **URL:** http://localhost/phpmyadmin
- **Usuário:** `root` (sem senha)

### 4. Executar Scripts
1. Criar database: `pipoqueiro`
2. Importar: `02-create-tables.sql`
3. Importar: `03-insert-data.sql`

---

## Configuração do Backend

### 1. Criar arquivo `.env`
```bash
# Na pasta backend/:
cp .env.example .env
```

### 2. Configurar credenciais
```env
# MySQL Local
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql_aqui
DB_NAME=pipoqueiro
DB_PORT=3306

# JWT
JWT_SECRET=seu_jwt_secret_aqui_muito_seguro_123
JWT_EXPIRES_IN=7d

# TMDB API
TMDB_API_KEY=sua_chave_tmdb_aqui

# OpenAI API (opcional - para chatbot)
OPENAI_API_KEY=sua_chave_openai_aqui
```

---

## Testar Conexão

### 1. Iniciar Backend
```bash
cd backend/
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

## Estrutura do Banco de Dados

### Tabelas Criadas:

#### 1. usuarios
Armazena perfis e autenticação dos usuários.

**Campos:**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `nome` (VARCHAR(100))
- `email` (VARCHAR(100), UNIQUE)
- `senha_hash` (VARCHAR(255))
- `bio` (TEXT, nullable)
- `foto_perfil` (VARCHAR(255), nullable)
- `generos_favoritos` (JSON, nullable) - Array de strings
- `data_nascimento` (DATE, nullable)
- `favoritos` (JSON, nullable) - Array de objetos {tmdb_id, data_adicao}
- `lista_quero_ver` (JSON, nullable) - Array de objetos {tmdb_id, data_adicao}
- `created_at` (TIMESTAMP, default CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, default CURRENT_TIMESTAMP ON UPDATE)

**Exemplo de dados JSON:**
```json
{
  "generos_favoritos": ["ação", "terror", "ficção científica"],
  "favoritos": [
    {"tmdb_id": 550, "data_adicao": "2025-01-01"},
    {"tmdb_id": 680, "data_adicao": "2025-01-02"}
  ],
  "lista_quero_ver": [
    {"tmdb_id": 120, "data_adicao": "2025-01-03"}
  ]
}
```

#### 2. avaliacoes
Armazena reviews de filmes dos usuários.

**Campos:**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `usuario_id` (INT, FOREIGN KEY → usuarios.id)
- `tmdb_id` (INT) - ID do filme no TMDB
- `nota` (INT) - Nota de 1 a 5
- `titulo_review` (VARCHAR(255), nullable)
- `comentario` (TEXT, nullable)
- `spoiler` (BOOLEAN, default FALSE)
- `curtidas` (INT, default 0)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Constraints:**
- UNIQUE(usuario_id, tmdb_id) - Usuário só pode avaliar um filme uma vez
- ON DELETE CASCADE - Remove reviews ao excluir usuário

---

## Funcionalidades Backend

### Sistema de Autenticação
- Registro de usuários com bcrypt
- Login com JWT
- Middleware de autenticação
- Perfis personalizáveis

### Sistema de Reviews
- CRUD completo de reviews (1-5 estrelas)
- Curtidas em reviews
- Filtro de spoilers
- Estatísticas por filme

### Sistema de Listas (JSON)
- Favoritos armazenados em campo JSON
- Watchlist ("Quero Ver") em campo JSON
- Ordenação por data de adição
- Integração com TMDB API

### Integração TMDB
- Filmes populares
- Busca de filmes
- Detalhes completos
- Vídeos e trailers
- Créditos (elenco/equipe)
- Filmes similares
- Ranking da comunidade

---

## APIs Disponíveis

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
- `POST /api/reviews/:id/curtir` - Curtir review

### Filmes (TMDB)
- `GET /api/movies/popular` - Filmes populares
- `GET /api/movies/ranking` - Ranking comunidade
- `GET /api/movies/search` - Buscar filmes
- `GET /api/movies/:tmdb_id` - Detalhes do filme
- `GET /api/movies/:tmdb_id/videos` - Vídeos/trailers
- `GET /api/movies/:tmdb_id/credits` - Elenco/equipe
- `GET /api/movies/:tmdb_id/similar` - Filmes similares

### Watchlist
- `GET /api/watchlist` - Obter lista "Quero Ver"
- `POST /api/watchlist` - Adicionar filme
- `DELETE /api/watchlist/:tmdb_id` - Remover filme

### Favoritos
- `GET /api/favorites` - Obter favoritos
- `POST /api/favorites` - Adicionar favorito
- `DELETE /api/favorites/:tmdb_id` - Remover favorito
- `GET /api/favorites/check/:tmdb_id` - Verificar se é favorito

---

## Troubleshooting

### Erro: "Access denied for user 'root'"
- Verificar senha no `.env`
- Tentar resetar senha do MySQL

### Erro: "Can't connect to MySQL server"
- Verificar se MySQL está rodando
- Checar porta 3306
- Firewall pode estar bloqueando

### Erro: "Database 'pipoqueiro' doesn't exist"
- Executar `01-create-database.sql` primeiro
- Verificar se database foi criado no Workbench

### Scripts não executam
- Verificar caminho completo dos arquivos
- Usar barras corretas: Windows = `\\`, Linux = `/`
- Permissões de leitura dos arquivos SQL

---

## Reset Completo

```sql
-- Para recomeçar do zero:
DROP DATABASE IF EXISTS pipoqueiro;

-- Depois executar scripts novamente
```

---

## Diferenças da Estrutura Antiga

### Antes (com tabelas separadas):
- `favoritos` - Tabela separada
- `lista_quero_ver` - Tabela separada
- Queries complexas com JOINs
- Mais lento para adicionar/remover

### Agora (campos JSON):
- `usuarios.favoritos` - Campo JSON
- `usuarios.lista_quero_ver` - Campo JSON
- Queries simples e diretas
- Mais rápido e eficiente
- Menos complexidade no código

**Qualquer dúvida, checar:** `database/README.md` ou `docs/API_REFERENCE.md`
