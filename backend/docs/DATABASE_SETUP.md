# 🗄️ Setup do Banco de Dados MySQL - Pipoqueiro

**Guia completo para configurar o MySQL do projeto Pipoqueiro**

---

## **🎯 Opção 1: MySQL Workbench (Recomendado)**

### **1. Instalar MySQL**
- **Download:** https://dev.mysql.com/downloads/installer/
- **Escolher:** MySQL Installer for Windows
- **Durante instalação:** definir senha para usuário `root`
- **Anotar:** essa senha será usada no `.env`

### **2. Instalar MySQL Workbench**
- Já vem incluído no MySQL Installer
- **Ou baixar separado:** https://dev.mysql.com/downloads/workbench/

### **3. Conectar no Workbench**
1. Abrir MySQL Workbench
2. Conectar em `localhost:3306`
3. Usuário: `root`
4. Senha: a que você definiu na instalação

### **4. Executar Scripts SQL**
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

## **🎯 Opção 2: Via Command Line**

### **1. Conectar ao MySQL**
```bash
mysql -u root -p
# Digite sua senha do MySQL
```

### **2. Executar Scripts**
```sql
-- Dentro do MySQL CLI:
SOURCE C:\\caminho\\para\\projeto\\database\\01-create-database.sql
SOURCE C:\\caminho\\para\\projeto\\database\\02-create-tables.sql
SOURCE C:\\caminho\\para\\projeto\\database\\03-insert-data.sql
```

---

## **🎯 Opção 3: PowerShell (Windows)**

### **1. Na pasta database/ do projeto:**
```powershell
# Executar em ordem:
Get-Content 01-create-database.sql | mysql -u root -p
Get-Content 02-create-tables.sql | mysql -u root -p  
Get-Content 03-insert-data.sql | mysql -u root -p
```

---

## **🎯 Opção 4: XAMPP (Mais Simples)**

### **1. Instalar XAMPP**
- **Download:** https://www.apachefriends.org/download.html
- **Incluí:** Apache, MySQL e phpMyAdmin

### **2. Iniciar MySQL no XAMPP**
- Abrir XAMPP Control Panel
- Start → MySQL

### **3. Acessar phpMyAdmin**
- **URL:** http://localhost/phpmyadmin
- **Usuário:** `root` (sem senha)

### **4. Executar Scripts**
1. Criar database: `pipoqueiro`
2. Importar: `02-create-tables.sql`  
3. Importar: `03-insert-data.sql`

---

## **⚙️ Configuração do Backend**

### **1. Criar arquivo `.env`**
```bash
# Na pasta backend/:
cp .env.example .env
```

### **2. Configurar credenciais**
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

# CORS (para frontend)
CORS_ORIGIN=http://localhost:3000
```

---

## **🧪 Testar Conexão**

### **1. Iniciar Backend**
```bash
cd backend/
npm run dev
```

### **2. Testar Endpoints**
```bash
# API funcionando?
curl http://localhost:3000/api/health

# Banco conectado?
curl http://localhost:3000/api/test-db

# Ver usuários de exemplo:
curl http://localhost:3000/api/usuarios
```

---

## **🗄️ Estrutura Final**

### **Tabelas Criadas:**
- ✅ `usuarios` - Perfis e autenticação
- ✅ `avaliacoes` - Reviews de filmes (1-5⭐)
- ✅ `lista_quero_ver` - Watchlist dos usuários

### **Dados de Exemplo:**
- 4 usuários já cadastrados
- 10+ reviews de filmes populares
- Diversos filmes na watchlist

### **Views para Estatísticas:**
- `estatisticas_filmes` - Agregados por filme  
- `usuarios_ativos` - Stats por usuário

---

## **❌ Troubleshooting**

### **Erro: "Access denied for user 'root'"**
- Verificar senha no `.env`
- Tentar resetar senha do MySQL

### **Erro: "Can't connect to MySQL server"**
- Verificar se MySQL está rodando
- Checar porta 3306
- Firewall pode estar bloqueando

### **Erro: "Database 'pipoqueiro' doesn't exist"**
- Executar `01-create-database.sql` primeiro
- Verificar se database foi criado no Workbench

### **Scripts não executam**
- Verificar caminho completo dos arquivos
- Usar barras corretas: Windows = `\\`, Linux = `/`
- Permissões de leitura dos arquivos SQL

---

## **🔄 Reset Completo**

```sql
-- Para recomeçar do zero:
DROP DATABASE IF EXISTS pipoqueiro;

-- Depois executar scripts novamente
```

---

**💾 Qualquer dúvida, checar:** `database/README.md`