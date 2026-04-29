# PORTAL APSIS — Contexto do Projeto

## O que é
Hub interno da APSIS Consultoria. Dashboards por área de negócio, projetos, financeiro, RH, marketing, onboarding, rateios, planejamento estratégico e ferramentas internas.

Repositório GitHub: Apsis-Consultoria/portal-apsis

## Stack
- Frontend: React 18 + Vite + TailwindCSS + shadcn/ui + Recharts + Lucide React
- Auth: Azure AD SSO (MSAL) — exclusivo @apsis.com.br
- Backend: Base44 Functions (Deno)
- Banco: Supabase (PostgreSQL) — projeto ybixbsfmxblaippubtvw
- ERP: MySQL via Base44 Functions (mysqlIntegration)
- Deploy: AWS Amplify

## Regras críticas
- Banco de dados: SEMPRE Supabase, nunca Base44 entities
- ERP: SEMPRE via functions erp* — nunca acesso direto ao MySQL
- Verificar functions existentes antes de criar novas

## Instruções para o Claude
No início de cada conversa leia OBRIGATORIAMENTE os dois arquivos abaixo via Filesystem MCP:

1. C:\Users\FilipeOliveiraAPSISC\Conciencia_Obisidian\projetos\Portal Apsis\Contexto.md
   (stack completa, arquitetura, componentes, tabelas Supabase, páginas, variáveis de ambiente)

2. C:\Users\FilipeOliveiraAPSISC\Conciencia_Obisidian\projetos\Portal Apsis\Decisoes Tecnicas.md
   (decisões arquiteturais DEV-001 a DEV-010, issues conhecidos)

Se os arquivos não existirem, crie-os com conteúdo vazio e avise.

Durante a conversa:
- Salve incrementalmente no arquivo portal-apsis.md (C:\Users\FilipeOliveiraAPSISC\Conciencia_Obisidian\projetos\Portal Apsis\portal-apsis.md) a cada bug corrigido, decisão tomada ou mudança relevante — sem precisar ser solicitado.
- Quando uma nova decisão técnica for tomada, adicione ao Decisoes Tecnicas.md no formato DEV-XXX.
- Quando a arquitetura mudar (novo componente, nova tabela, nova function), atualize o Contexto.md.
