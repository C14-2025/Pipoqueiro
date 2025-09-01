# 🎬 Pipoqueiro

**Sistema de reviews de filmes com integração TMDb**

Uma plataforma completa onde usuários podem avaliar filmes, criar listas "quero ver" e descobrir novos conteúdos através da integração com a base de dados TMDb.

---

## 🚀 **Quick Start**

### **Backend (API REST)**
```bash
cd backend/
npm install
npm run dev

# ✅ API rodando em http://localhost:3000
```

### **Frontend** *(em desenvolvimento)*
```bash
cd frontend/
# TODO: Instruções do frontend
```

---

## 🏗️ **Arquitetura**

```
Pipoqueiro/
├── backend/           # 🔧 API REST (Node.js + TypeScript)
│   ├── src/          # Código fonte
│   └── docs/         # 📚 Documentação da API
├── frontend/         # 🎨 Interface (TODO)
└── database/         # 🗄️ Scripts SQL e schema MySQL
```

---

## 🛠️ **Stack Tecnológica**

### **Backend:**
- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **TMDb API** - Catálogo de filmes

### **Frontend:** *(em desenvolvimento)*
- React/Vue/Angular (TODO)

### **Database:**
- **MySQL 8.0+**
- **4 tabelas principais** + views
- **Dados de exemplo** inclusos

---

## 📚 **Documentação**

| Documento | Descrição |
|-----------|-----------|
| [`backend/docs/API_REFERENCE.md`](backend/docs/API_REFERENCE.md) | 📡 **Referência completa da API** |
| [`backend/docs/FRONTEND_SETUP.md`](backend/docs/FRONTEND_SETUP.md) | 🚀 **Como configurar backend para frontend** |
| [`backend/docs/DATABASE_SETUP.md`](backend/docs/DATABASE_SETUP.md) | 🗄️ **Setup do banco MySQL** |
| [`backend/docs/TMDB_INTEGRATION.md`](backend/docs/TMDB_INTEGRATION.md) | 🎬 **Integração com TMDb API** |

---

## ⚡ **Features Implementadas**

### **✅ Usuários**
- Registro e login com JWT
- Perfis personalizados
- Gêneros favoritos
- Estatísticas de atividade

### **✅ Reviews**
- Sistema de 1-5 estrelas
- Reviews com títulos e comentários
- Marcação de spoilers
- Sistema de curtidas
- Reviews por filme

### **✅ Listas**
- Lista "Quero Ver"
- Prioridades (baixa/média/alta)
- Notificações de lançamento
- "Onde assistir"

### **✅ Database**
- Schema completo otimizado
- Dados de exemplo (4 usuários, 10+ reviews)
- Views para estatísticas
- Índices para performance

---

## 🎯 **Em Desenvolvimento**

### **🔄 Backend**
- [ ] Lista de filmes assistidos
- [ ] Sistema de seguir outros usuários  
- [ ] Feed de atividades
- [ ] API de recomendações

### **⏳ Frontend**
- [ ] Interface web responsiva
- [ ] Catálogo de filmes (TMDb)
- [ ] Perfis de usuário
- [ ] Sistema de reviews

---

## 🗄️ **Database Schema**

### **Tabelas:**
- **`usuarios`** - Perfis e autenticação
- **`avaliacoes`** - Reviews e notas (1-5⭐)
- **`lista_quero_ver`** - Watchlist dos usuários

### **Relacionamentos:**
- Users → Reviews (1:N)
- Users → Watchlist (1:N)  
- Filmes via `tmdb_id` (TMDb API)

---

## 🧪 **Como Testar**

### **1. Backend funcionando:**
```bash
curl http://localhost:3000/api/health
# {"success": true, "message": "API Pipoqueiro funcionando!"}
```

### **2. Banco conectado:**
```bash
curl http://localhost:3000/api/test-db
# {"success": true, "message": "Banco conectado!", "usuarios": [...]}
```

### **3. Reviews de exemplo:**
```bash
curl http://localhost:3000/api/reviews/filme/550
# Reviews do filme "Clube da Luta"
```

---

## 👥 **Time de Desenvolvimento**

| Pessoa | Responsabilidade |
|--------|-----------------|
| **Alexandre** | Backend (Node.js + TypeScript + APIs) |
| **Daví Padula** | Database (MySQL + Schema + Dados) |
| **Frontend Dev** | Interface (TODO) |

---

## 🤝 **Como Contribuir**

### **Para Backend:**
1. Ler [`backend/docs/API_REFERENCE.md`](backend/docs/API_REFERENCE.md)
2. Setup: [`backend/docs/DATABASE_SETUP.md`](backend/docs/DATABASE_SETUP.md)
3. Fazer fork → branch → PR

### **Para Frontend:**
1. Setup: [`backend/docs/FRONTEND_SETUP.md`](backend/docs/FRONTEND_SETUP.md)
2. Usar API em `http://localhost:3000/api/*`
3. Documentação completa disponível

### **Para Database:**
1. Scripts em `/database/`
2. Schema documentado em [`backend/docs/DATABASE_SETUP.md`](backend/docs/DATABASE_SETUP.md)

---

## 📝 **Licença**

Projeto educacional - Livre para uso e modificação.

---

## 🎬 **"Pipoqueiro is the new IMDb!"**

**Desenvolvido com ❤️ para amantes de cinema** 🍿

*Projeto em desenvolvimento ativo - Contribuições são bem-vindas!*