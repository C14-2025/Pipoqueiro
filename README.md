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

### **Frontend (React + Vite)**
```bash
cd frontend/
npm install
npm run dev

# ✅ Frontend rodando em http://localhost:5173
```

---

## 🏗️ **Arquitetura**

```
Pipoqueiro/
├── backend/           # 🔧 API REST (Node.js + TypeScript)
│   ├── src/          # Código fonte
│   └── docs/         # 📚 Documentação da API
├── frontend/         # 🎨 Interface Web (React + Vite + TailwindCSS)
│   ├── src/          # Componentes, páginas e serviços
│   └── public/       # Assets estáticos
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

### **Frontend:**
- **React 19** + **Vite** - Build tool moderno
- **React Router** - Navegação
- **TailwindCSS** - Estilização
- **Axios** - Requisições HTTP
- **React Icons** - Ícones

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

### **✅ Integração TMDb**
- Catálogo completo de filmes
- Busca em tempo real
- Posters e metadados
- Filmes populares e trending

---

## 🎯 **Em Desenvolvimento**

### **🔄 Backend**
- [ ] Lista de filmes assistidos
- [ ] Sistema de seguir outros usuários  
- [ ] Feed de atividades
- [ ] API de recomendações

### **✅ Frontend (React + Vite)**

**📄 Páginas Implementadas:**
- **HomePage** (`/`) - Filmes populares + trending da TMDb
- **LoginPage** (`/login`) - Autenticação de usuários
- **SearchPage** (`/busca`) - Busca de filmes em tempo real
- **MediaDetailsPage** (`/filme/:id`) - Detalhes completos do filme
- **UserProfilePage** (`/perfil`) - Perfil e configurações do usuário
- **YourListPage** (`/sua-lista`) - Lista "Quero Ver" personalizada
- **MoviesListPage** (`/filmes`) - Catálogo completo de filmes

**🎨 Design System:**
- Interface responsiva (mobile-first)
- Design moderno com TailwindCSS
- Componentes reutilizáveis (Header, Footer, Cards)
- Sistema de cores consistente
- Navegação intuitiva com React Router

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

### **4. Frontend funcionando:**
```bash
# Acesse http://localhost:5173 no navegador
# ✅ Interface completa com filmes populares da TMDb
```

---

## 👥 **Time de Desenvolvimento**

| Pessoa | Responsabilidade |
|--------|-----------------|
| **Alexandre** | Backend (Node.js + TypeScript + APIs) |
| **Otávio** | Backend (Node.js + TypeScript + APIs) |
| **Daví Padula** | Database (MySQL + Schema + Dados) |
| **Jordan** | Frontend (React + Design System) |
| **Antonio** | Frontend (React + Design System) |

---

## 🤝 **Como Contribuir**

### **Para Backend:**
1. Ler [`backend/docs/API_REFERENCE.md`](backend/docs/API_REFERENCE.md)
2. Setup: [`backend/docs/DATABASE_SETUP.md`](backend/docs/DATABASE_SETUP.md)
3. Fazer fork → branch → PR

### **Para Frontend:**
1. Setup: `cd frontend/ && npm install && npm run dev`
2. API Backend: `http://localhost:3000/api/*`
3. Frontend local: `http://localhost:5173`
4. Usar serviços em `src/services/api.js`
5. Seguir padrões TailwindCSS existentes

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