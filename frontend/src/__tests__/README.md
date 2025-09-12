# 🧪 Testes Automatizados do Frontend

Este arquivo documenta todos os testes automatizados criados para o frontend do projeto **Pipoqueiro**.

---

## 📂 Estrutura dos Testes

Os testes estão localizados na pasta:

```
frontend/src/__tests__/
```

Os arquivos de teste principais são:
- `LoginPage.test.jsx`
- `SearchPage.test.jsx`

---

## 🛠️ Tecnologias Utilizadas

- **Jest**: Framework de testes JavaScript
- **React Testing Library**: Utilitário para testes de componentes React

---

## ✅ Testes Criados

### LoginPage.test.jsx

1. **envia formulário de login com sucesso**
   - Testa se o formulário de login envia corretamente os dados ao clicar em "Entrar".
2. **exibe mensagem de erro ao falhar login**
   - Testa se a mensagem de erro aparece ao falhar o login.
3. **envia formulário de cadastro com sucesso**
   - Testa se o formulário de cadastro envia corretamente os dados ao clicar em "Cadastrar-se".
4. **exibe botão de cadastro**
   - Testa se o botão de cadastro está visível na tela.
5. **renderiza título de cadastro por padrão**
   - Testa se o título de cadastro aparece por padrão ao abrir a página.
6. **troca para aba de login ao clicar**
   - Testa se ao clicar na aba de login, o título muda para "Bem-vindo de volta!".
7. **exibe campo nome apenas na aba de cadastro**
   - Testa se o campo "nome completo" só aparece na aba de cadastro.

### SearchPage.test.jsx

1. **input de busca está presente e pode ser preenchido**
   - Testa se o input de busca aceita digitação normalmente.
2. **renderiza título da página de busca**
   - Testa se o título "Buscar Filmes" aparece na página.
3. **renderiza subtítulo da página de busca**
   - Testa se o subtítulo "Encontre qualquer filme no catálogo" aparece na página.
4. **não renderiza resultados se não houver busca**
   - Testa se a mensagem de "nenhum resultado" não aparece sem busca.
5. **botão de submit está desabilitado sem texto**
   - Testa se o botão de submit está desabilitado quando o input está vazio.
6. **ao digitar, botão de submit habilita**
   - Testa se ao digitar no input, o botão de submit é habilitado.
7. **exibe input de busca**
   - Testa se o input de busca está visível na tela.

---

## 🚀 Como Executar os Testes

1. Instale as dependências do frontend:
   ```bash
   cd frontend/
   npm install
   ```
2. Execute os testes:
   ```bash
   npm test
   # ou
   npx jest src/__tests__/LoginPage.test.jsx src/__tests__/SearchPage.test.jsx
   ```

---



**Desenvolvido para garantir a qualidade da interface do usuário!**
