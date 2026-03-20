# Endpoints Implementados - API v1

**Status:** Fase 1 & 2 - Em Andamento  
**Data:** 2026-03-20

---

## ✅ Projetos - Implementado

| Método | Endpoint | Status | Descrição |
|--------|----------|--------|-----------|
| GET | `/api/v1/projects` | ✅ | Listar projetos |
| POST | `/api/v1/projects` | ✅ | Criar projeto |
| PATCH | `/api/v1/projects/:id` | ✅ | Atualizar projeto |
| DELETE | `/api/v1/projects/:id` | ✅ | Deletar projeto |

**Backend Functions:**
- ✅ `functions/projectsListV1.js`
- ✅ `functions/projectsCreateV1.js`
- ✅ `functions/projectsUpdateV1.js`
- ✅ `functions/projectsDeleteV1.js`

**Frontend:**
- ✅ `src/services/projectService.js`
- ✅ `pages/Projetos.jsx` (refatorado)

---

## ✅ Vendas - Estrutura Criada

| Método | Endpoint | Status | Descrição |
|--------|----------|--------|-----------|
| GET | `/api/v1/opportunities` | ⏳ | Listar oportunidades |
| POST | `/api/v1/opportunities` | ⏳ | Criar oportunidade |
| PATCH | `/api/v1/opportunities/:id` | ⏳ | Atualizar oportunidade |
| DELETE | `/api/v1/opportunities/:id` | ⏳ | Deletar oportunidade |
| POST | `/api/v1/opportunities/:id/convert` | ⏳ | Converter para projeto |
| GET | `/api/v1/proposals` | ⏳ | Listar propostas |
| POST | `/api/v1/proposals` | ⏳ | Criar proposta |
| GET | `/api/v1/clients` | ⏳ | Listar clientes |
| POST | `/api/v1/clients` | ⏳ | Criar cliente |
| GET | `/api/v1/pipeline` | ⏳ | Pipeline de vendas |

**Frontend:**
- ✅ `src/services/salesService.js`

---

## ✅ Financeiro - Estrutura Criada

| Método | Endpoint | Status | Descrição |
|--------|----------|--------|-----------|
| GET | `/api/v1/receivables` | ⏳ | Contas a receber |
| GET | `/api/v1/payables` | ⏳ | Contas a pagar |
| POST | `/api/v1/payables` | ⏳ | Criar conta a pagar |
| GET | `/api/v1/cash-flow/dashboard` | ⏳ | Dashboard fluxo de caixa |
| GET | `/api/v1/transactions` | ⏳ | Listar transações |

**Frontend:**
- ✅ `src/services/financialService.js`

---

## ✅ Email - Implementado

| Método | Endpoint | Status | Descrição |
|--------|----------|--------|-----------|
| POST | `/api/v1/emails/send` | ✅ | Enviar email |

**Backend Functions:**
- ✅ `functions/emailSendV1.js` (com templates)

**Features:**
- ✅ Templates de email reutilizáveis
- ✅ Suporte a dados dinâmicos
- ✅ Usa Core.SendEmail do Base44
- ✅ Logging em IntegrationLog

---

## ⏳ Integrações Externas - Pendentes

### Stripe (Pagamentos) 🔐
Requer: `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`

```
⏳ POST /api/v1/payments/create
⏳ POST /api/v1/webhooks/stripe (receita webhook)
⏳ GET /api/v1/transactions
```

### ERP SAN (Sincronização) 🔐
Requer: `ERP_API_URL`, `ERP_API_KEY`

```
⏳ POST /api/v1/integrations/erp/sync
⏳ Scheduled: Todos os dias 02:00 AM
```

### WhatsApp Business 🔐
Requer: `WHATSAPP_API_KEY`, `WHATSAPP_ACCOUNT_ID`

```
⏳ POST /api/v1/messages/whatsapp
⏳ POST /api/v1/webhooks/whatsapp
```

---

## 📊 Estatísticas

| Categoria | Total | Implementado | Pendente |
|-----------|-------|--------------|----------|
| Backend Functions | 13 | 5 | 8 |
| Frontend Services | 3 | 3 | 0 |
| Pages Refatoradas | 2 | 2 | 3 |
| Entidades | 3 | 3 | 0 |
| Endpoints | 27 | 9 | 18 |

---

## 🔐 Credenciais Necessárias

Endpoints que requerem credenciais (sinalizados com 🔐):

```bash
# Stripe - Pagamentos
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# ERP SAN - Sincronização
ERP_API_URL=https://erp.example.com/api
ERP_API_KEY=...

# WhatsApp Business
WHATSAPP_API_KEY=...
WHATSAPP_ACCOUNT_ID=...
```

Quando estas credenciais forem obtidas, as funções correspondentes podem ser implementadas.

---

## 🚀 Próximos Passos

1. **Curto prazo (1 semana):**
   - Implementar vendas (`opportunitiesListV1.js`, etc)
   - Implementar financeiro (`receivablesListV1.js`, etc)
   - Refatorar mais páginas

2. **Médio prazo (2 semanas):**
   - Obter credenciais Stripe
   - Obter credenciais ERP SAN
   - Implementar Stripe webhook

3. **Longo prazo (1 mês):**
   - Implementar ERP sync (scheduled)
   - Implementar WhatsApp
   - Testes de integração completos

---

## 📋 Checklist de Implementação

Padrão para cada novo endpoint:

- [ ] Backend Function v1 criada
- [ ] Autenticação validada
- [ ] Validação de payload
- [ ] Logging em IntegrationLog
- [ ] Tratamento de erro padronizado
- [ ] Service no frontend criado
- [ ] Exemplo de uso documentado
- [ ] Testado com curl/postman
- [ ] Refatorado em página/componente

---

**Última atualização:** 2026-03-20  
**Próxima revisão:** 2026-03-27