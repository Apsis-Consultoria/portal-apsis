# Quick Reference - Refatoração de Integrações

**Para desenvolvedores que precisam usar rapidamente os novos padrões**

---

## 🚀 Usar API no Frontend (30 segundos)

### Buscar dados
```javascript
import { useApi } from '@/hooks/useApi';
import { projectService } from '@/services/projectService';

function MyComponent() {
  const { data: projects, loading, error } = useApi(
    () => projectService.list()
  );

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  
  return <div>{projects.map(p => <p key={p.id}>{p.nome}</p>)}</div>;
}
```

### Enviar dados
```javascript
import { useAsyncOperation } from '@/hooks/useApi';
import { projectService } from '@/services/projectService';

function CreateProject() {
  const { execute, loading } = useAsyncOperation(
    (data) => projectService.create(data)
  );

  const handleSubmit = async (formData) => {
    const result = await execute(formData);
    console.log('Criado:', result);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.target)); }}>
      <input name="nome" required />
      <button disabled={loading}>{loading ? 'Salvando...' : 'Criar'}</button>
    </form>
  );
}
```

---

## 🔧 Criar Backend Function (1 minuto)

```javascript
// functions/meuFuncaoV1.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    // 1. Autenticar
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });

    // 2. Fazer algo
    const resultado = await base44.entities.Projeto.list();

    // 3. Retornar sucesso
    return Response.json({ success: true, data: resultado }, { status: 200 });
  } catch (error) {
    console.error('Erro:', error.message);
    return Response.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR' } }, { status: 500 });
  }
});
```

---

## 🛡️ Tratamento de Erro

```javascript
import { handleApiError } from '@/lib/errorHandler';

try {
  const result = await apiClient.post('/endpoint', data);
} catch (error) {
  const processed = handleApiError(error);
  
  if (processed.isValidationError) {
    // Mostrar campos com erro
    showFieldErrors(processed.fields);
  } else if (processed.isAuthError) {
    // Fazer login novamente
    window.location.href = '/login';
  } else {
    // Mostrar erro genérico
    showNotification(processed.userMessage);
  }
}
```

---

## 📡 Padrão de Resposta HTTP

### Sucesso
```json
{
  "success": true,
  "data": { /* dados aqui */ },
  "meta": { "timestamp": "...", "version": "v1" }
}
```

### Erro
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": { "fields": { "email": "Email inválido" } }
  },
  "meta": { "timestamp": "..." }
}
```

---

## 🔑 Secrets e Credenciais

### No Backend (Seguro ✅)
```javascript
const apiKey = Deno.env.get('STRIPE_API_KEY');
const resultado = await fetch('https://api.stripe.com/...', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

### No Frontend (Inseguro ❌)
```javascript
// NUNCA FAZER ISSO!
const apiKey = process.env.REACT_APP_STRIPE_KEY; // Exposto no bundle!
const resultado = await fetch('https://api.stripe.com/...', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

**Solução:** Sempre passar pelo backend function

---

## 🔍 Códigos de Erro

| Código | HTTP | Ação |
|--------|------|------|
| VALIDATION_ERROR | 400 | Mostrar campos com erro |
| UNAUTHORIZED | 401 | Fazer login novamente |
| FORBIDDEN | 403 | Mostrar "acesso negado" |
| NOT_FOUND | 404 | Redirecionar para listagem |
| CONFLICT | 409 | Mostrar "item duplicado" |
| INTERNAL_SERVER_ERROR | 500 | Mostrar "erro geral" |

---

## 📁 Onde Cada Coisa Fica

| O que | Onde |
|------|------|
| Cliente HTTP | `src/services/apiClient.js` |
| Hooks de API | `src/hooks/useApi.js` |
| Tratamento de erro | `src/lib/errorHandler.js` |
| Serviços (Projetos, Vendas, etc) | `src/services/{entity}Service.js` |
| Backend functions | `functions/{endpoint}V1.js` |
| Documentação | `INTEGRACOES_API.md` |
| Exemplos | `src/components/examples/` |

---

## ✅ Checklist ao Criar Feature Nova

- [ ] Backend: criar `functions/{entity}{Action}V1.js`
- [ ] Backend: testar via dashboard
- [ ] Frontend: criar `src/services/{entity}Service.js`
- [ ] Frontend: usar `useApi()` ou `useAsyncOperation()`
- [ ] Frontend: adicionar loading state
- [ ] Frontend: adicionar error state
- [ ] Frontend: adicionar validação
- [ ] Frontend: testar no navegador
- [ ] Documentação: adicionar em `INTEGRACOES_API.md`

---

## 🧪 Testar Backend Function

No dashboard > code > functions > [nome da função] > test

```json
Payload:
{
  "nome": "Projeto Teste",
  "cliente_id": "123",
  "valor_total": 5000
}
```

Resposta esperada:
```json
{
  "success": true,
  "data": {
    "id": "proj_abc",
    "nome": "Projeto Teste",
    ...
  }
}
```

---

## 🔗 Endpoints Principais

```
GET    /api/v1/projects              Listar
GET    /api/v1/projects/:id          Obter
POST   /api/v1/projects              Criar
PATCH  /api/v1/projects/:id          Atualizar
DELETE /api/v1/projects/:id          Deletar

GET    /api/v1/clients               Listar clientes
POST   /api/v1/clients               Criar cliente
```

---

## 📝 Template: Refatorar Página Existente

```javascript
// Antes (❌ antiga)
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Projeto.list().then(data => {
      setProjetos(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Carregando...</div>;
  return <div>{projetos.map(p => <div key={p.id}>{p.nome}</div>)}</div>;
}
```

```javascript
// Depois (✅ nova)
import { useApi } from '@/hooks/useApi';
import { projectService } from '@/services/projectService';

export default function ProjetosPage() {
  const { data: projetos, loading } = useApi(() => projectService.list());

  if (loading) return <div>Carregando...</div>;
  return <div>{projetos?.map(p => <div key={p.id}>{p.nome}</div>)}</div>;
}
```

---

## 🚨 Erros Comuns

❌ **Errado:** Chamar fetch direto
```javascript
const data = await fetch('/api/projetos').then(r => r.json());
```

✅ **Correto:** Usar apiClient
```javascript
const { data } = await apiClient.get('/projects');
```

---

❌ **Errado:** Armazenar token em localStorage
```javascript
localStorage.setItem('token', jwtToken);
```

✅ **Correto:** Usar sessionStorage
```javascript
sessionStorage.setItem('auth_token', jwtToken);
```

---

❌ **Errado:** Expor error details ao usuário
```javascript
showAlert(`Erro: ${error.stack}`);
```

✅ **Correto:** Mostrar mensagem amigável
```javascript
const processed = handleApiError(error);
showAlert(processed.userMessage);
```

---

## 🔗 Links Rápidos

- [Documentação Completa](./INTEGRACOES_API.md)
- [Resumo de Mudanças](./REFACTORING_SUMMARY.md)
- [Checklist de Tarefas](./IMPLEMENTATION_CHECKLIST.md)
- [Exemplo Backend](./functions/projectsListV1.js)
- [Exemplo Frontend](./src/components/examples/ProjectListExample.jsx)

---

**Última atualização:** 2026-03-20  
**Versão:** 1.0