# Checklist de Implementação - Refatoração de Integrações

**Objetivo:** Migrar toda a aplicação para os novos padrões de API  
**Data Início:** 2026-03-20  
**Status:** Em Progresso

---

## Fase 1: Fundação ✅ COMPLETA

### Backend Foundation
- [x] Criar padrão de resposta unificado
- [x] Exemplo: `functions/projectsListV1.js`
- [x] Documentar padrão em `INTEGRACOES_API.md`

### Frontend Foundation
- [x] `src/services/apiClient.js` - Cliente HTTP
- [x] `src/hooks/useApi.js` - Hook de requisições
- [x] `src/lib/errorHandler.js` - Tratamento de erros
- [x] `src/services/projectService.js` - Exemplo de serviço

### Database
- [x] `entities/IntegrationLog.json` - Logging de integrações
- [x] `entities/IntegrationConfig.json` - Config de integrações
- [x] `entities/WebhookLog.json` - Logging de webhooks

### Documentation
- [x] `INTEGRACOES_API.md` - Documentação completa
- [x] `REFACTORING_SUMMARY.md` - Resumo do que foi feito
- [x] `IMPLEMENTATION_CHECKLIST.md` - Este arquivo

---

## Fase 2: Refatorar Backend Functions

### Autenticação e Autorização
- [ ] Reescrever `functions/clientAuth.js`
- [ ] Usar novo padrão de resposta
- [ ] Adicionar validação de payload
- [ ] Logar tentativas falhadas

### Projetos
- [ ] Reescrever `functions/projectsListV1.js` (exemplo modelo)
- [ ] Criar `functions/projectsCreateV1.js`
- [ ] Criar `functions/projectsUpdateV1.js`
- [ ] Criar `functions/projectsDeleteV1.js`
- [ ] Criar `functions/projectsGetV1.js`

### Clientes
- [ ] Criar `functions/clientsListV1.js`
- [ ] Criar `functions/clientsCreateV1.js`
- [ ] Criar `functions/clientsUpdateV1.js`
- [ ] Criar `functions/clientsDeleteV1.js`

### Vendas
- [ ] Criar `functions/salesListV1.js`
- [ ] Criar `functions/salesCreateV1.js`
- [ ] Criar `functions/salesUpdateV1.js`
- [ ] Criar `functions/salesDeleteV1.js`
- [ ] Criar `functions/salesConvertV1.js`

### Financeiro
- [ ] Criar `functions/invoicesListV1.js`
- [ ] Criar `functions/invoicesCreateV1.js`
- [ ] Criar `functions/paymentsListV1.js`
- [ ] Criar `functions/paymentsCreateV1.js`

### Integrações Externas
- [ ] Stripe webhook: `functions/integrationsStripeWebhook.js`
- [ ] Stripe sync: `functions/integrationsStripeSyncV1.js`
- [ ] Email send: `functions/integrationsEmailSendV1.js`
- [ ] ERP sync: `functions/integrationsErpSyncV1.js`
- [ ] WhatsApp send: `functions/integrationsWhatsappSendV1.js`

### Validação de Payloads
- [ ] Validar nome, email, CPF/CNPJ em todas as funções
- [ ] Retornar VALIDATION_ERROR com campos específicos
- [ ] Logar tentativas inválidas

### Tratamento de Erros
- [ ] Todas as functions com try/catch
- [ ] Usar responseFormatter.error()
- [ ] Nunca expor stack trace ao cliente
- [ ] Logar detalhes técnicos no servidor

---

## Fase 3: Refatorar Frontend

### Pages Principais
- [ ] `pages/Projetos.jsx` - Usar projectService + useApi
- [ ] `pages/Vendas.jsx` - Usar salesService + useApi
- [ ] `pages/Financeiro.jsx` - Usar financialService + useApi
- [ ] `pages/Dashboard.jsx` - Usar dashboardService + useApi

### Componentes
- [ ] `components/projetos/ProjetosKanban.jsx`
- [ ] `components/projetos/ProjetosLista.jsx`
- [ ] `components/projetos/ProjetoRiscos.jsx`
- [ ] `components/pipeline/KanbanPipeline.jsx`
- [ ] `components/pipeline/OportunidadesLista.jsx`
- [ ] `components/vendas/VendasClientes.jsx` ✅ (já ajustado)
- [ ] `components/vendas/VendasDashboard.jsx`

### Padrão de Uso
Cada componente deve seguir:
```javascript
const { data, loading, error, refetch } = useApi(() => service.method());
// ou
const { execute, loading } = useAsyncOperation((payload) => service.method(payload));
```

### UI/UX
- [ ] Loading spinner consistente em todos componentes
- [ ] Empty state padronizado
- [ ] Error message amigável
- [ ] Toast/notification para ações (sucesso/erro)
- [ ] Retry button para erros

### Remover Código Legado
- [ ] Remover chamadas diretas a `base44.entities` em componentes
- [ ] Remover `fetch()` direto sem tratamento
- [ ] Remover try/catch sem logging
- [ ] Remover console.log de dados sensíveis

---

## Fase 4: Implementar Integrações Externas

### Stripe (Pagamentos)
- [ ] Registrar conta Stripe
- [ ] Gerar API keys (test + prod)
- [ ] Armazenar como secrets: `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] Criar `IntegrationConfig` para Stripe
- [ ] Webhook: receber charge.completed, charge.failed
- [ ] Webhook: registrar em `WebhookLog`
- [ ] Webhook: atualizar status de fatura em Transacao/Fatura
- [ ] Sync: listar transações da Stripe diariamente
- [ ] Documentação: adicionar Stripe em `INTEGRACOES_API.md`

### Email (SendGrid/Microsoft 365)
- [ ] Configurar provider (já tem EmailConfig)
- [ ] Criar `functions/integrationsEmailSendV1.js`
- [ ] Templates de email para:
  - [ ] Novo projeto criado
  - [ ] Pagamento recebido
  - [ ] Projeto finalizado
  - [ ] Relatório mensal
- [ ] Integração com `EmailNotifications` entity

### ERP SAN (Sincronização)
- [ ] Configurar acesso à API ERP
- [ ] Armazenar credenciais: `ERP_API_URL`, `ERP_API_KEY`
- [ ] Sync de Projetos (OrdemServico)
- [ ] Sync de Clientes
- [ ] Sync de Vendas
- [ ] Scheduled: todos os dias 02:00 AM
- [ ] Logging em `IntegrationLog`
- [ ] Retry automático em caso de falha
- [ ] Dashboard de status de sync

### WhatsApp Business
- [ ] Registrar conta WhatsApp Business
- [ ] Obter API key e account ID
- [ ] Criar `functions/integrationsWhatsappSendV1.js`
- [ ] Templates para:
  - [ ] Confirmação de projeto
  - [ ] Alerta de vencimento
  - [ ] Notificação de pagamento
- [ ] Logging de mensagens enviadas

---

## Fase 5: Testes e Qualidade

### Testes Backend
- [ ] Teste cada function com payload válido
- [ ] Teste cada function com payload inválido
- [ ] Teste sem autenticação (deve retornar 401)
- [ ] Teste com usuário sem permissão (deve retornar 403)
- [ ] Teste rate limiting
- [ ] Teste timeout
- [ ] Teste integração com banco

### Testes Frontend
- [ ] Componente carrega dados corretamente
- [ ] Componente trata erro corretamente
- [ ] Componente exibe loading state
- [ ] Componente exibe empty state
- [ ] Formulário valida antes de enviar
- [ ] Retry funciona após erro
- [ ] Logout após erro 401

### Testes de Integração
- [ ] Criar projeto → sincronizar com ERP → receber no ERP
- [ ] Receber pagamento no Stripe → webhook → atualizar fatura
- [ ] Enviar email → log em EmailNotifications
- [ ] Enviar WhatsApp → log em integração

### Testes de Segurança
- [ ] CORS apenas para domínios autorizados
- [ ] Rate limiting ativo (max 100 req/min por IP)
- [ ] SQL injection tests (se houver queries diretas)
- [ ] XSS tests (escapar inputs)
- [ ] CSRF protection (se houver forms)
- [ ] Secrets não expostos em logs
- [ ] Tokens não expostos no localStorage

### Load Testing
- [ ] Simular 100 usuários simultâneos
- [ ] Simular 1000 requisições por segundo
- [ ] Medir tempo de resposta (< 500ms)
- [ ] Verificar memoria
- [ ] Verificar CPU

---

## Fase 6: Deploy e Produção

### Pre-Deploy Checklist
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Secrets armazenados com segurança
- [ ] Backups do banco automáticos
- [ ] Logging centralizado (Sentry, LogRocket)
- [ ] Monitoring e alertas configurados
- [ ] Plano de rollback documentado
- [ ] Runbook de resposta a incidentes

### Deploy Staging
- [ ] Fazer deploy em staging environment
- [ ] Testar todas as funcionalidades
- [ ] Testar integrações
- [ ] Performance testing
- [ ] Load testing
- [ ] Smoke tests

### Deploy Produção
- [ ] Fazer deploy fora do horário de pico
- [ ] Monitorar logs
- [ ] Monitorar performance
- [ ] Estar preparado para rollback
- [ ] Comunicar ao time
- [ ] Documentar release notes

---

## Métricas de Sucesso

- [ ] 100% das functions retornam padrão unificado
- [ ] 100% das páginas usam novo apiClient
- [ ] < 2% de taxa de erro em produção
- [ ] Tempo médio de resposta < 500ms
- [ ] Uptime > 99.9%
- [ ] Zero exposição de dados sensíveis
- [ ] 0 bugs de segurança críticos

---

## Pendências e Dependências

### Bloqueantes
- [ ] Credentials Stripe (para fase de testes)
- [ ] Credentials ERP SAN
- [ ] Credentials WhatsApp Business
- [ ] Aprovação para mudanças de padrão

### Recomendado
- [ ] Integração com Sentry para error tracking
- [ ] Integração com DataDog/New Relic para monitoring
- [ ] Rate limiting library (ex: redis)
- [ ] Job queue para tarefas assincronas (ex: Bull)

---

## Pessoas Responsáveis

| Role | Responsável | Status |
|------|-----------|--------|
| Tech Lead | [nome] | ⏳ |
| Backend Dev | [nome] | ⏳ |
| Frontend Dev | [nome] | ⏳ |
| QA | [nome] | ⏳ |
| DevOps | [nome] | ⏳ |

---

## Timeline Estimada

| Fase | Duração | Data Início | Data Fim |
|------|---------|-------------|----------|
| 1 - Fundação | 1 semana | 2026-03-20 | 2026-03-27 ✅ |
| 2 - Backend | 3-4 semanas | 2026-03-27 | 2026-04-24 |
| 3 - Frontend | 3-4 semanas | 2026-04-10 | 2026-05-08 |
| 4 - Integrações | 4-6 semanas | 2026-05-08 | 2026-06-19 |
| 5 - Testes | 2-3 semanas | 2026-06-19 | 2026-07-10 |
| 6 - Deploy | 1 semana | 2026-07-10 | 2026-07-17 |

**Total Estimado:** 14-18 semanas (3.5-4.5 meses)

---

## Recursos Necessários

- **Frontend:** 1 dev full-time
- **Backend:** 1-2 devs full-time
- **QA:** 0.5 dev full-time
- **DevOps:** 0.5 dev full-time
- **Tech Lead:** reviews + architecture

---

## Documentação e Referências

- `INTEGRACOES_API.md` - Documentação técnica completa
- `REFACTORING_SUMMARY.md` - Resumo do que foi feito
- `functions/projectsListV1.js` - Exemplo backend
- `src/components/examples/ProjectListExample.jsx` - Exemplo frontend
- GitHub Issues/Jira - Rastreamento de tarefas

---

## Status Atual

**Fase:** 1 de 6  
**Progresso:** 100% ✅  
**Próximo:** Começar fase 2 (refatorar backend functions)

**Última atualização:** 2026-03-20  
**Próxima revisão:** 2026-03-27