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

### **Tabelas:**
- **`usuarios`** - Perfis e autenticação
- **`avaliacoes`** - Reviews de filmes (1-5⭐)
- **`lista_quero_ver`** - Watchlist dos usuários

### **Views:**
- **`estatisticas_filmes`** - Agregados por filme
- **`usuarios_ativos`** - Stats por usuário

### **Relacionamentos:**
- Users → Reviews (1:N)
- Users → Watchlist (1:N)
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

**💾 Schema criado por:** Daví Padula  
**📡 API integração:** Alexandre

**Para mais detalhes, ver:** `backend/docs/DATABASE_SETUP.md`