# 🗄️ Database Schema - Pipoqueiro

**Scripts SQL para setup do banco MySQL do projeto Pipoqueiro**

---

## 🚀 **Setup Rápido**

```bash
# Na pasta database/ do projeto:
cd database/

# Executar scripts em ordem:
mysql -u root -p < 01-create-database.sql
mysql -u root -p < 02-create-tables.sql  
mysql -u root -p < 03-insert-data.sql
```

**PowerShell (Windows):**
```powershell
# Na pasta database/:
Get-Content 01-create-database.sql | mysql -u root -p
Get-Content 02-create-tables.sql | mysql -u root -p
Get-Content 03-insert-data.sql | mysql -u root -p
```

---

## 📁 **Arquivos**

| Arquivo | Descrição |
|---------|-----------|
| `01-create-database.sql` | Cria database `pipoqueiro` |
| `02-create-tables.sql` | Cria tabelas, índices e views |
| `03-insert-data.sql` | Insere dados de exemplo |
| `schema-full.sql` | Dump completo (alternativa) |

---

## 🏗️ **Estrutura do Banco**

### **Tabelas Principais:**
- **`usuarios`** - Perfis e autenticação
- **`avaliacoes`** - Reviews de filmes (1-5⭐)
- **`lista_quero_ver`** - Lista "Quero Ver" dos usuários
- **`favoritos`** - Filmes favoritos dos usuários ⭐

### **Campos por Tabela:**

#### **`usuarios`**
- `id`, `nome`, `email`, `senha_hash`
- `bio`, `foto_perfil`, `generos_favoritos`, `data_nascimento`
- `created_at`, `updated_at`

#### **`avaliacoes`**
- `id`, `usuario_id`, `tmdb_id`, `nota` (1-5)
- `titulo_review`, `comentario`, `spoiler`, `curtidas`
- `created_at`, `updated_at`

#### **`lista_quero_ver`**
- `id`, `usuario_id`, `tmdb_id`
- `prioridade` (baixa/media/alta), `data_adicao`
- `notificar_lancamento`, `onde_assistir`

#### **`favoritos`**
- `id`, `usuario_id`, `tmdb_id`
- `comentario_favorito`, `created_at`

### **Relacionamentos:**
- Users → Reviews (1:N)
- Users → Watchlist (1:N)
- Users → Favorites (1:N)
- Filmes via `tmdb_id` (TMDb API)

---

## 🧪 **Dados de Exemplo**

### **4 Usuários:**
1. João Cinéfilo Silva
2. Maria Santos Crítica
3. Pedro Blockbuster Fan  
4. Ana Clássicos Forever

### **10+ Reviews:**
- Clube da Luta (tmdb_id: 550)
- Forrest Gump (tmdb_id: 13)
- Interestelar (tmdb_id: 157336)
- Parasita (tmdb_id: 496243)
- Vingadores Ultimato (tmdb_id: 299534)

---

## 🔄 **Reset Database**

```sql
DROP DATABASE IF EXISTS pipoqueiro;
-- Depois executar os scripts novamente
```

---

---

## 🚀 **APIs Disponíveis**

### **Watchlist (Lista "Quero Ver")**
```bash
GET    /api/watchlist           # Listar filmes "quero ver"
POST   /api/watchlist           # Adicionar filme
PUT    /api/watchlist/:tmdb_id  # Atualizar prioridade
DELETE /api/watchlist/:tmdb_id  # Remover filme
```

### **Favorites (Favoritos)**
```bash
GET    /api/favorites           # Listar favoritos
POST   /api/favorites           # Adicionar favorito
PUT    /api/favorites/:tmdb_id  # Atualizar comentário
DELETE /api/favorites/:tmdb_id  # Remover favorito
GET    /api/favorites/check/:tmdb_id  # Verificar se é favorito
```

### **Reviews (Avaliações)**
```bash
GET    /api/reviews/filme/:tmdb_id  # Reviews de um filme
GET    /api/reviews/minhas          # Minhas reviews
POST   /api/reviews                 # Criar review
PUT    /api/reviews/:id             # Editar review
DELETE /api/reviews/:id             # Excluir review
```

---

**💾 Schema criado por:** Daví Padula
**📡 API Backend:** Alexandre
**🎬 TMDB Integration:** Completa

**Para mais detalhes técnicos, ver:** `backend/src/controllers/`