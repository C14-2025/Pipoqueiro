# 🗄️ Setup do Banco de Dados MySQL

## **🎯 Opção 1: MySQL + Workbench (Recomendado)**

### **1. Instalar MySQL**
- **Download:** https://dev.mysql.com/downloads/installer/
- **Escolher:** MySQL Installer for Windows
- **Configurar:** senha para usuário `root`

### **2. Instalar MySQL Workbench**
- Já vem no MySQL Installer
- **Ou baixar:** https://dev.mysql.com/downloads/workbench/

### **3. Criar Database**
```sql
-- No Workbench:
CREATE DATABASE pipoqueiro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pipoqueiro;
```

### **4. Executar Scripts**
**Na pasta `database/` do projeto, executar em ordem:**
1. `createTabelas.sql` - Cria tabelas
2. `scriptTabelas.sql` - Insere dados de exemplo

---

## **🎯 Opção 2: Via Command Line**

### **1. Conectar ao MySQL**
```bash
mysql -u root -p
# Digite sua senha
```

### **2. Criar database**
```sql
CREATE DATABASE pipoqueiro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

### **3. Executar scripts**
```bash
# Na pasta do projeto:
cd database/

# Executar scripts (PowerShell)
Get-Content createTabelas.sql | mysql -u root -p pipoqueiro
Get-Content scriptTabelas.sql | mysql -u root -p pipoqueiro
```

---

## **🎯 Opção 3: XAMPP (Mais Simples)**

### **1. Baixar XAMPP**
- **Download:** https://www.apachefriends.org/download.html

### **2. Iniciar MySQL**
- Abrir XAMPP Control Panel
- Clicar "Start" no MySQL

### **3. Acessar phpMyAdmin**
- Clicar "Admin" no MySQL
- Ou ir em: http://localhost/phpmyadmin

### **4. Criar database**
- Clicar "Databases"
- Nome: `pipoqueiro`
- Collation: `utf8mb4_unicode_ci`

### **5. Importar dados**
- Selecionar database `pipoqueiro`
- Aba "Import"
- Escolher arquivo `database/schemaPipoca.sql`

---

## **🔧 Configuração do .env**

**Depois de configurar o MySQL, editar `.env`:**

### **MySQL Standalone:**
```env
DB_HOST=localhost
DB_USER=root  
DB_PASSWORD=sua_senha_definida
DB_NAME=pipoqueiro
DB_PORT=3306
```

### **XAMPP:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=    # Vazio no XAMPP
DB_NAME=pipoqueiro
DB_PORT=3306
```

---

## **✅ Testar Conexão**

### **1. Rodar backend:**
```bash
npm run dev
```

### **2. Testar no navegador:**
```
http://localhost:3000/api/test-db
```

### **3. Deve retornar:**
```json
{
  "success": true,
  "message": "Banco conectado!",
  "usuarios": [{ "total": 4 }]
}
```

---

## **🗂️ Estrutura do Banco**

### **Tabelas:**
- **`usuarios`** - Dados dos usuários
- **`avaliacoes`** - Reviews de filmes  
- **`lista_quero_ver`** - Watchlist dos usuários

### **Views:**
- **`estatisticas_filmes`** - Stats por filme
- **`usuarios_ativos`** - Stats por usuário

### **Relacionamentos:**
- `avaliacoes.usuario_id` → `usuarios.id`
- `lista_quero_ver.usuario_id` → `usuarios.id`
- Filmes identificados por `tmdb_id` (API externa)

---

## **🎬 Dados de Exemplo Inclusos**

### **4 Usuários:**
1. João Cinéfilo Silva
2. Maria Santos Crítica  
3. Pedro Blockbuster Fan
4. Ana Clássicos Forever

### **10+ Reviews de filmes famosos:**
- Clube da Luta
- Forrest Gump  
- Interestelar
- Parasita
- Vingadores Ultimato

### **Listas "Quero Ver" populadas**

---

## **🐛 Problemas Comuns**

### **"Access denied for user 'root'"**
- ✅ Senha do MySQL está correta?
- ✅ Usuário `root` existe?
- ✅ MySQL está rodando?

### **"Database doesn't exist"**
- ✅ Executou `CREATE DATABASE pipoqueiro`?
- ✅ Nome está exato (sem maiúsculas)?

### **"Connection refused"**
- ✅ MySQL está rodando na porta 3306?
- ✅ Firewall bloqueando conexões?

### **Scripts SQL com erro**
- ✅ Executou na ordem: `createTabelas.sql` depois `scriptTabelas.sql`?
- ✅ Database `pipoqueiro` estava selecionado?

---

## **🔄 Reset Completo (se der problema)**

```sql
-- Apagar tudo e começar de novo:
DROP DATABASE IF EXISTS pipoqueiro;
CREATE DATABASE pipoqueiro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pipoqueiro;

-- Depois executar os scripts novamente
```

---

## **📞 Ajuda**

**Scripts criados por:** David  
**Integração backend:** Alexandre

**Problemas?** Verifique se:
1. MySQL está rodando
2. Database `pipoqueiro` existe  
3. Credenciais do `.env` estão corretas
4. Scripts foram executados na ordem

**Happy data! 🗄️**