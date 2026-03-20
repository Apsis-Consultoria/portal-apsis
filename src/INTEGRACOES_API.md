# Documentação de Integrações e Arquitetura de API

**Data:** 2026-03-20  
**Versão:** 1.0  
**Status:** Sistema em Refatoração para Padrão Enterprise

---

## 1. Visão Geral da Arquitetura

A aplicação APSIS Portal segue uma arquitetura **clean architecture** com separação de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          API Client Service (Centralizado)           │   │
│  │  - Chamadas HTTP padronizadas                         │   │
│  │  - Tratamento de auth/refresh token                  │   │
│  │  - Interceptação de requests/responses               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Deno/Functions)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          API Routes (/api/v1/*)                      │   │
│  │  ├── Controllers (Request/Response handling)         │   │
│  │  ├── Services (Business logic)                       │   │
│  │  ├── Repositories (Data access)                      │   │
│  │  └── Middleware (Auth, Validation, Logging)         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Integrations Layer (APIs Externas)            │   │
│  │  ├── Payment Gateway (Stripe, etc)                   │   │
│  │  ├── Email Service (SendGrid, etc)                  │   │
│  │  ├── ERP System                                      │   │
│  │  ├── WhatsApp/SMS                                    │   │
│  │  └── Third-party APIs                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ Queries/Commands
┌─────────────────────────────────────────────────────────────┐
│                    BASE44 DATABASE                           │
│  ├── Entities (Schemas)                                      │
│  ├── Relationships                                           │
│  ├── Audit Tables                                            │
│  └── Integration Logs                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Pastas

```
projeto/
├── src/
│   ├── api/
│   │   └── base44Client.js                 # SDK inicializado
│   ├── services/
│   │   ├── apiClient.js                    # Cliente HTTP centralizado ✨ NOVO
│   │   ├── authService.js                  # Autenticação (Microsoft SSO)
│   │   ├── projectService.js               # Serviço de projetos
│   │   ├── salesService.js                 # Serviço de vendas
│   │   ├── financialService.js             # Serviço de financeiro
│   │   └── ...
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Projetos.jsx
│   │   ├── Vendas.jsx
│   │   └── ...
│   ├── components/
│   ├── lib/
│   │   ├── utils.js
│   │   ├── constants.js
│   │   └── errorHandler.js                 # Tratamento centralizado de erros ✨ NOVO
│   └── hooks/
│       └── useApi.js                       # Hook para consumir APIs ✨ NOVO
│
├── functions/
│   ├── _common/
│   │   ├── responseFormatter.js             # Padrão de respostas ✨ NOVO
│   │   ├── errorHandler.js                  # Tratamento de erros ✨ NOVO
│   │   ├── authMiddleware.js                # Autenticação ✨ NOVO
│   │   └── validationSchema.js              # Validação de payloads ✨ NOVO
│   ├── v1/
│   │   ├── auth/
│   │   │   └── login.js
│   │   ├── projects/
│   │   │   ├── list.js
│   │   │   ├── create.js
│   │   │   ├── update.js
│   │   │   └── delete.js
│   │   ├── sales/
│   │   │   └── ...
│   │   ├── integrations/
│   │   │   ├── stripe/webhook.js
│   │   │   ├── email/send.js
│   │   │   ├── erp/sync.js
│   │   │   └── ...
│   │   └── ...
│   └── ...
│
├── entities/
│   ├── User.json                           # Usuário (built-in)
│   ├── Projeto.json                        # Projeto/Ordem de Serviço
│   ├── Cliente.json                        # Cliente
│   ├── Proposta.json                       # Proposta
│   ├── IntegrationLog.json                 # ✨ NOVO - Log de integrações
│   ├── IntegrationConfig.json              # ✨ NOVO - Configuração de integrações
│   ├── WebhookLog.json                     # ✨ NOVO - Log de webhooks
│   └── ...
│
├── INTEGRACOES_API.md                      # ✨ NOVO - Esta documentação
└── ...
```

---

## 3. Padrão de Respostas HTTP

### ✅ Sucesso (2xx)
```json
{
  "success": true,
  "data": {
    "id": "projeto_123",
    "nome": "Projeto XYZ",
    "status": "ativo",
    "created_date": "2026-03-20T10:00:00Z",
    "updated_date": "2026-03-20T11:30:00Z"
  },
  "meta": {
    "timestamp": "2026-03-20T11:35:00Z",
    "version": "v1"
  }
}
```

### ❌ Erro Genérico (5xx)
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Ocorreu um erro ao processar a solicitação",
    "details": "Database connection failed"
  },
  "meta": {
    "timestamp": "2026-03-20T11:35:00Z",
    "requestId": "req_abc123xyz"
  }
}
```

### ⚠️ Erro de Validação (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "fields": {
      "email": "Email inválido",
      "nome": "Nome é obrigatório"
    }
  },
  "meta": {
    "timestamp": "2026-03-20T11:35:00Z"
  }
}
```

### 🔒 Erro de Autenticação (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token expirado ou inválido",
    "action": "refresh_token"
  }
}
```

### 🚫 Erro de Autorização (403)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Você não tem permissão para acessar este recurso"
  }
}
```

---

## 4. Autenticação e Autorização

### Fluxo SSO (Microsoft Entra ID)
1. Frontend detecta usuário não autenticado
2. Redireciona para página de login Microsoft
3. Microsoft retorna `access_token` ao frontend
4. Frontend armazena token em sessionStorage (nunca localStorage para dados sensíveis)
5. Frontend envia `Authorization: Bearer {token}` em requisições
6. Backend valida token com Microsoft Entra ID
7. Se válido, extrai claims (email, nome, role)
8. Se inválido, retorna 401 - frontend inicia novo login

### Header de Autenticação
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Imp3a19...
```

### Autorização por Role
Baseada em field `role` da entidade `User`:
- `admin` - Acesso total
- `diretor` - Acesso a dashboards táticos
- `gerente` - Acesso limitado a sua equipe
- `analista` - Acesso apenas leitura
- `cliente` - Acesso ao portal do cliente

### Validação de Permissão no Backend
```javascript
// middleware/authMiddleware.js
const authMiddleware = async (req) => {
  const user = await base44.auth.me();
  if (!user) throw { code: 401, message: 'Unauthorized' };
  if (user.role !== 'admin') throw { code: 403, message: 'Forbidden' };
  return user;
};
```

---

## 5. Catálogo de Endpoints

### Projetos
```
GET    /api/v1/projects              - Listar projetos
GET    /api/v1/projects/:id          - Obter projeto
POST   /api/v1/projects              - Criar projeto
PATCH  /api/v1/projects/:id          - Atualizar projeto
DELETE /api/v1/projects/:id          - Deletar projeto
```

### Clientes
```
GET    /api/v1/clients               - Listar clientes
GET    /api/v1/clients/:id           - Obter cliente
POST   /api/v1/clients               - Criar cliente
PATCH  /api/v1/clients/:id           - Atualizar cliente
DELETE /api/v1/clients/:id           - Deletar cliente
```

### Vendas
```
GET    /api/v1/sales                 - Listar vendas
GET    /api/v1/sales/:id             - Obter venda
POST   /api/v1/sales                 - Criar venda
PATCH  /api/v1/sales/:id             - Atualizar venda
DELETE /api/v1/sales/:id             - Deletar venda
POST   /api/v1/sales/:id/convert     - Converter proposta em venda
```

### Financeiro
```
GET    /api/v1/financial/invoices    - Listar faturas
GET    /api/v1/financial/payments    - Listar pagamentos
POST   /api/v1/financial/invoices    - Criar fatura
PATCH  /api/v1/financial/invoices/:id - Atualizar fatura
```

### Integrações Externas
```
POST   /api/v1/integrations/stripe/webhook    - Webhook Stripe
POST   /api/v1/integrations/email/send        - Enviar email
POST   /api/v1/integrations/erp/sync          - Sincronizar com ERP
POST   /api/v1/integrations/whatsapp/send     - Enviar WhatsApp
GET    /api/v1/integrations/status            - Status das integrações
```

---

## 6. Exemplo: Criar um Projeto

### Request
```http
POST /api/v1/projects HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "nome": "Auditoria XYZ Ltda",
  "cliente_id": "cliente_123",
  "data_inicio": "2026-04-01",
  "data_fim": "2026-05-31",
  "valor_total": 50000,
  "status": "planejamento",
  "descricao": "Auditoria contábil e fiscal"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "proj_abc123xyz",
    "nome": "Auditoria XYZ Ltda",
    "cliente_id": "cliente_123",
    "data_inicio": "2026-04-01",
    "data_fim": "2026-05-31",
    "valor_total": 50000,
    "status": "planejamento",
    "created_date": "2026-03-20T12:00:00Z",
    "updated_date": "2026-03-20T12:00:00Z",
    "created_by": "user@company.com"
  }
}
```

### No Frontend (React)
```javascript
import { useApi } from '@/hooks/useApi';

function CreateProject() {
  const { post, loading, error } = useApi();

  const handleSubmit = async (formData) => {
    const { data, error } = await post('/projects', formData);
    if (error) {
      showNotification('error', error.message);
      return;
    }
    showNotification('success', 'Projeto criado!');
    navigate(`/projects/${data.id}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* campos do formulário */}
      <button disabled={loading}>
        {loading ? 'Salvando...' : 'Criar Projeto'}
      </button>
    </form>
  );
}
```

---

## 7. Tratamento de Erros

### Erros Mapeados

| Código HTTP | Código de Erro | Significado | Ação |
|-----------|------------|---------|--------|
| 400 | VALIDATION_ERROR | Payload inválido | Mostrar campos com erro |
| 401 | UNAUTHORIZED | Token expirado | Fazer login novamente |
| 403 | FORBIDDEN | Sem permissão | Exibir acesso negado |
| 404 | NOT_FOUND | Recurso não existe | Redirecionar para listagem |
| 409 | CONFLICT | Conflito de dados (duplicado) | Mostrar alerta de conflito |
| 429 | RATE_LIMITED | Muitas requisições | Mostrar "Aguarde..." |
| 500 | INTERNAL_SERVER_ERROR | Erro do servidor | Registrar e notificar suporte |

### Tratamento no Frontend
```javascript
// lib/errorHandler.js
export const handleApiError = (error, context = {}) => {
  const code = error?.code || 'UNKNOWN_ERROR';
  const message = error?.message || 'Erro desconhecido';

  switch (code) {
    case 'VALIDATION_ERROR':
      return {
        type: 'validation',
        fields: error.fields,
        userMessage: 'Por favor, corrija os campos destacados'
      };
    case 'UNAUTHORIZED':
      window.location.href = '/login';
      return { type: 'auth', userMessage: 'Sessão expirada. Faça login novamente.' };
    case 'FORBIDDEN':
      return { type: 'permission', userMessage: 'Você não tem acesso a este recurso.' };
    default:
      console.error('[API Error]', { code, message, context });
      return { type: 'error', userMessage: 'Erro ao processar solicitação. Tente novamente.' };
  }
};
```

---

## 8. Banco de Dados - Estrutura Padrão

### Campos Obrigatórios em Todas as Entidades
```json
{
  "id": "string (gerado automaticamente)",
  "created_date": "date-time (servidor)",
  "updated_date": "date-time (servidor)",
  "created_by": "string (email do usuário)",
  "status": "string (enum: ativo, inativo, deletado)"
}
```

### Exemplo: Entidade Projeto
```json
{
  "name": "Projeto",
  "type": "object",
  "properties": {
    "nome": { "type": "string" },
    "cliente_id": { "type": "string" },
    "data_inicio": { "type": "string", "format": "date" },
    "data_fim": { "type": "string", "format": "date" },
    "valor_total": { "type": "number" },
    "status": { "type": "string", "enum": ["planejamento", "ativo", "encerrado", "cancelado"] },
    "descricao": { "type": "string" }
  },
  "required": ["nome", "cliente_id", "data_inicio"]
}
```

### ✨ NOVO: Entidade IntegrationLog
Para rastrear todas as chamadas de integração:
```json
{
  "name": "IntegrationLog",
  "type": "object",
  "properties": {
    "integration_name": { "type": "string", "enum": ["stripe", "email", "erp", "whatsapp"] },
    "event_type": { "type": "string", "enum": ["sync", "webhook", "notification"] },
    "status": { "type": "string", "enum": ["success", "failed", "pending", "retry"] },
    "request": { "type": "object" },
    "response": { "type": "object" },
    "error_message": { "type": "string" },
    "duration_ms": { "type": "number" },
    "retries": { "type": "number", "default": 0 },
    "next_retry": { "type": "string", "format": "date-time" }
  },
  "required": ["integration_name", "event_type", "status"]
}
```

### ✨ NOVO: Entidade IntegrationConfig
Para armazenar configurações de integrações:
```json
{
  "name": "IntegrationConfig",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "provider": { "type": "string" },
    "is_active": { "type": "boolean", "default": false },
    "webhook_url": { "type": "string" },
    "webhook_secret": { "type": "string" },
    "credentials_secret_key": { "type": "string" },
    "test_mode": { "type": "boolean", "default": true },
    "config": { "type": "object" }
  },
  "required": ["name", "provider"]
}
```

---

## 9. Integrações Externas

### 🔄 Stripe (Pagamentos)
- **Status:** Não implementado
- **Função:** Processar pagamentos, webhooks
- **Backend Function:** `functions/v1/integrations/stripe/webhook.js`
- **Secrets Necessários:** `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Webhooks:** `POST /api/v1/integrations/stripe/webhook`

### 📧 Email
- **Status:** Base64 implementado (Core.SendEmail)
- **Função:** Notificações, confirmações
- **Backend Function:** `functions/v1/integrations/email/send.js`
- **Secrets Necessários:** Configurados na entidade EmailConfig
- **Fluxo:** Frontend → Backend → SendGrid/Microsoft 365

### 🤖 ERP SAN
- **Status:** Planejado
- **Função:** Sincronizar projetos, clientes, vendas
- **Backend Function:** `functions/v1/integrations/erp/sync.js`
- **Secrets Necessários:** `ERP_API_URL`, `ERP_API_KEY`
- **Frequência:** Scheduled (diário às 02:00 AM)

### 💬 WhatsApp
- **Status:** Planejado
- **Função:** Notificações, alertas
- **Backend Function:** `functions/v1/integrations/whatsapp/send.js`
- **Secrets Necessários:** `WHATSAPP_API_KEY`, `WHATSAPP_ACCOUNT_ID`

### 🔐 Microsoft Entra ID (SSO)
- **Status:** Implementado
- **Função:** Autenticação
- **Secrets:** `VITE_AZURE_TENANT_ID`, `VITE_AZURE_CLIENT_ID`, etc
- **Fluxo:** Frontend (MSAL) → Microsoft → Frontend

---

## 10. Variáveis de Ambiente

```bash
# Azure/Microsoft
VITE_AZURE_TENANT_ID=seu-tenant-id
VITE_AZURE_CLIENT_ID=seu-client-id
AZ_CLIENT_SECRET=seu-secret
AZ_TENANT_ID=seu-tenant-id
sso_tenant_id=seu-tenant-id
sso_client_id=seu-client-id
sso_client_secret=seu-secret

# Base44
BASE44_APP_ID=seu-app-id (automático)

# Integrações (adicionar conforme necessário)
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ERP_API_URL=https://erp.example.com
ERP_API_KEY=sua-chave
WHATSAPP_API_KEY=sua-chave
```

---

## 11. Como Adicionar Uma Nova Integração

### Passo 1: Criar Backend Function
```bash
# functions/v1/integrations/{nome}/webhook.js
```

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const responseFormatter = {
  success: (data) => ({ success: true, data }),
  error: (code, message) => ({ success: false, error: { code, message } })
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) return Response.json(responseFormatter.error('UNAUTHORIZED', 'Token inválido'), { status: 401 });

    // Lógica da integração
    const result = await processIntegration(req);

    // Log da integração
    await base44.entities.IntegrationLog.create({
      integration_name: 'exemplo',
      event_type: 'webhook',
      status: 'success',
      request: { /* ... */ },
      response: result,
      duration_ms: 150
    });

    return Response.json(responseFormatter.success(result));
  } catch (error) {
    return Response.json(responseFormatter.error('INTERNAL_SERVER_ERROR', error.message), { status: 500 });
  }
});
```

### Passo 2: Criar Serviço no Frontend
```javascript
// services/exampleService.js
import { apiClient } from './apiClient';

export const exampleService = {
  sendNotification: (data) => apiClient.post('/integrations/exemplo/send', data),
  getStatus: () => apiClient.get('/integrations/status')
};
```

### Passo 3: Usar no Componente
```javascript
import { exampleService } from '@/services/exampleService';
import { useApi } from '@/hooks/useApi';

function MyComponent() {
  const { data, error, loading } = useApi(() => exampleService.getStatus());
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{data?.status}</div>;
}
```

### Passo 4: Criar Entrada na Documentação
Adicione na seção "Integrações Externas" acima

### Passo 5: Adicionar Testes
```javascript
// Testar via dashboard > code > functions
test_backend_function('exampleFunction', { payload: 'test' })
```

---

## 12. Como Consumir Uma API no Frontend

### Usando o Hook useApi
```javascript
import { useApi } from '@/hooks/useApi';

function ListProjects() {
  const { data: projects, loading, error, refetch } = useApi(
    () => apiClient.get('/projects'),
    { autoFetch: true }
  );

  if (loading) return <div>Carregando...</div>;
  if (error) return <ErrorBoundary error={error} />;

  return (
    <div>
      {projects?.map(p => (
        <ProjectCard key={p.id} project={p} />
      ))}
      <button onClick={refetch}>Atualizar</button>
    </div>
  );
}
```

### Usando apiClient Diretamente
```javascript
import { apiClient } from '@/services/apiClient';

const createProject = async (data) => {
  try {
    const response = await apiClient.post('/projects', data);
    return response;
  } catch (error) {
    handleError(error);
  }
};
```

---

## 13. Backend Function Segura

### ✅ Exemplo Correto
```javascript
// Credenciais vêm do Deno.env (secrets)
const apiKey = Deno.env.get('ERP_API_KEY');
const apiUrl = Deno.env.get('ERP_API_URL');

Deno.serve(async (req) => {
  // 1. Autenticar usuário
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Validar payload
  const body = await req.json();
  if (!body.project_id) return Response.json({ error: 'Missing project_id' }, { status: 400 });

  // 3. Chamar API externa (credenciais do backend, nunca frontend)
  const erpResponse = await fetch(`${apiUrl}/projects/${body.project_id}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });

  // 4. Registrar tentativa
  await base44.entities.IntegrationLog.create({
    integration_name: 'erp',
    event_type: 'sync',
    status: erpResponse.ok ? 'success' : 'failed',
    duration_ms: 250
  });

  return Response.json({ success: true, data: await erpResponse.json() });
});
```

### ❌ Exemplo Incorreto
```javascript
// Nunca passar credenciais para o frontend
const apiKey = req.headers.get('x-api-key'); // INSEGURO!

// Nunca confiar em dados do cliente sem validar
const projectId = body.project_id; // Validar antes de usar!

// Nunca logar dados sensíveis
console.log('API Key:', apiKey); // INSEGURO!
```

---

## 14. Logging e Monitoramento

### Logs Técnicos (Backend)
```javascript
// Sempre logar erros técnicos no backend
console.error('[IntegrationError]', {
  integration: 'stripe',
  error: error.message,
  timestamp: new Date().toISOString(),
  userId: user.id
});
```

### Mensagens ao Usuário (Frontend)
```javascript
// Mensagens amigáveis ao usuário
showNotification('error', 'Erro ao processar pagamento. Por favor, tente novamente.');
```

### Entidade IntegrationLog
Toda integração deve registrar em `IntegrationLog`:
- Nome da integração
- Tipo de evento (sync, webhook, notification)
- Status (success, failed, pending)
- Request/Response
- Tempo de execução
- Número de retries

---

## 15. Segurança - Checklist

- [ ] Todas as credenciais armazenadas como secrets (Deno.env)
- [ ] Tokens JWT/OAuth armazenados em sessionStorage (nunca localStorage)
- [ ] Validação de payload em todo POST/PATCH/DELETE
- [ ] Autenticação verificada antes de qualquer operação
- [ ] Autorização (role) verificada para recursos sensíveis
- [ ] CORS configurado apenas para domínios conhecidos
- [ ] Rate limiting implementado em endpoints públicos
- [ ] Logs não contêm dados sensíveis (PII, tokens, senhas)
- [ ] HTTPS obrigatório em produção
- [ ] Webhooks validam assinatura do provider
- [ ] Timeout e retry implementados para APIs externas
- [ ] Error messages não expõem detalhes de implementação

---

## 16. Deploy - Checklist

### Pré-Produção
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Testes de integração passando
- [ ] Tratamento de erros testado
- [ ] Logs em nível apropriado (não verbose em prod)
- [ ] Rate limiting ativo
- [ ] Backup do banco programado

### Produção
- [ ] Secrets armazenados com segurança
- [ ] Certificado SSL válido
- [ ] CDN configurado para assets estáticos
- [ ] Alertas configurados para integrações críticas
- [ ] Plano de rollback documentado
- [ ] Monitoramento de performance
- [ ] Logs centralizados

---

## 17. Roadmap de Integrações

| Integração | Status | Prioridade | Data Estimada |
|-----------|--------|-----------|---------------|
| Stripe | Planejado | Alta | 2026-05 |
| ERP SAN | Planejado | Alta | 2026-06 |
| WhatsApp | Planejado | Média | 2026-07 |
| Google Drive | Futuro | Baixa | 2026-Q3 |
| Slack | Futuro | Baixa | 2026-Q3 |

---

## 18. Suporte e Troubleshooting

### Erro: "Token expirado"
- Verificar se sessionStorage tem token válido
- Fazer logout e login novamente
- Verificar clock sync do navegador

### Erro: "CORS error"
- Verificar se backend permite origin do frontend
- Verificar preflight request (OPTIONS)

### Erro: "Rate Limited"
- Aguardar antes de fazer nova requisição
- Implementar backoff exponencial no cliente

### Erro: "Webhook not received"
- Verificar URL do webhook no provider
- Validar assinatura no backend
- Checar logs em IntegrationLog

---

**Última Atualização:** 2026-03-20  
**Responsável:** Tech Lead / DevOps  
**Próxima Revisão:** 2026-06-20