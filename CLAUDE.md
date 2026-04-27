# PORTAL APSIS — Contexto do Projeto

## O que é
Portal interno da APSIS Consultoria. Hub centralizado com dashboards por área de negócio, gestão de projetos, financeiro, capital humano, marketing, onboarding, ERP e ferramentas internas.

Repositório GitHub: portal-apsis
Base44 App: PORTAL APSIS

## Stack
- Frontend: React 18 + Vite + Tailwind CSS + shadcn/ui (Radix UI)
- Auth: Azure AD SSO (clientAuth, getAzureToken, getAzureConfig)
- Backend: Base44 Functions (Deno) — migração em andamento para Supabase
- Banco de dados: Supabase (destino final — Base44 entities sendo descontinuadas)
- Integrações: ERP (MySQL via mysqlIntegration), Microsoft Graph, e-mail
- Deploy: AWS Amplify

## Diretriz crítica
- Banco de dados: usar sempre Supabase, nunca Base44 entities
- Funções com prefixo erp* integram com ERP via MySQL
- Funções _AZURE_SSO_CONFIG, _BACKEND_MIGRATION, _DATABASE_SCHEMAS, _MIGRATION_GUIDE são documentação interna de migração

## Páginas principais
- BoasVindas — landing page (mainPage)
- Dashboard — dashboard geral
- DashboardAtivos, DashboardCapitalHumano, DashboardContabil, DashboardEstrategica, DashboardFinanceiro, DashboardMA, DashboardMercadoClientes, DashboardProjetos, DashboardQualidade, DashboardValuation — dashboards por área
- Projetos — gestão de projetos
- AlocacoesHoras — alocação de horas por projeto
- Budget — orçamento
- Financeiro, ContasAPagar, ContasAReceber — financeiro
- Marketing, MarketingComercial, MarketingOrcado — marketing
- CapitalHumano, Ferias, RateiosCapitalHumano — RH
- OnboardingInterno, OnboardingPublico — onboarding
- Admin, Configuracoes, GerenciamentoAcessos — administração
- RateioCaju, RateioDespesas — rateios
- SolicitacoesIAAdmin — gestão de solicitações de IA
- Recover, ResetPassword, AccessDenied — auth/acesso

## Base44 Functions
- clientAuth — autenticação de clientes
- erpClient, erpDashboard, erpFinanceiro, erpProjetos, erpQualidade — integração ERP
- erpSyncManual, erpSyncScheduled — sincronização ERP
- getAzureToken, getAzureConfig, getAzureMicrosoftAuthUrl — Azure AD
- projectsListV1, projectsCreateV1, projectsUpdateV1, projectsDeleteV1 — CRUD projetos
- getColaboradores, createColaborador, updateColaborador, deleteColaborador — colaboradores
- importarColaboradoresToSupabase — migração de colaboradores para Supabase
- emailNotificationHandler, emailNotificationTrigger, emailSendV1 — e-mails
- assistantChat — chat com IA
- salvarSolicitacaoIA, getMarketingData, buscarImoveis — funcionalidades específicas
- mysqlIntegration — integração MySQL (ERP)

## Instruções para o Claude
1. No início de cada conversa, leia o arquivo de log em:
   C:\Users\FilipeOliveiraAPSISC\Conciencia_Obisidian\projetos\portal-apsis.md
2. Se não existir, crie-o.
3. Durante a conversa, salve incrementalmente nesse arquivo a cada bug corrigido, decisão tomada ou mudança relevante — sem eu precisar pedir.
4. Banco de dados sempre Supabase — nunca usar Base44 entities para persistência.
5. Ao criar novas funcionalidades, verificar se já existe uma Base44 Function equivalente antes de criar outra.
6. Integrações com ERP passam obrigatoriamente pelas funções erp*.
