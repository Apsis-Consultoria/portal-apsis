/**
 * =====================================================
 * GUIA COMPLETO DE MIGRAÇÃO - Base44 para Next.js
 * =====================================================
 * 
 * Este arquivo NÃO é uma função executável.
 * É documentação para facilitar a migração futura do Portal APSIS.
 * 
 * ÍNDICE:
 * 1. Visão Geral
 * 2. Stack Recomendada
 * 3. Migração de Autenticação SSO
 * 4. Migração de Banco de Dados
 * 5. Migração de Backend Functions
 * 6. Migração de Frontend
 * 7. Checklist Completo
 * 
 * =====================================================
 */

/*

## 🎯 1. VISÃO GERAL

**Objetivo**: Migrar o Portal APSIS da plataforma Base44 para uma stack independente baseada em Next.js.

**Estimativa de Tempo**: 2-3 semanas (desenvolvedor full-stack experiente)

**Complexidade**: Média-Alta

**Motivo**: Ter controle total sobre a infraestrutura e código, além de facilitar integrações futuras.

---

## 🛠 2. STACK RECOMENDADA

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI**: React 18+ com TypeScript
- **Styling**: Tailwind CSS (mantém compatibilidade 100%)
- **Components**: Shadcn/ui (já está usando, compatível)
- **State Management**: TanStack Query v5 (já está usando)
- **Charts**: Recharts (já está usando)
- **Icons**: Lucide React (já está usando)

### Backend & Autenticação
- **Auth**: NextAuth.js v5 (Auth.js) com Azure AD
- **Database**: Supabase (PostgreSQL + Auth integrado) OU Prisma + PostgreSQL
- **ORM**: Prisma (se não usar Supabase)
- **API**: Next.js API Routes ou Server Actions

### Deploy & Infraestrutura
- **Frontend Hosting**: Vercel (recomendado) ou Netlify
- **Database Hosting**: Supabase (gerenciado) ou Railway/Neon
- **File Storage**: Supabase Storage ou AWS S3
- **Environment Variables**: Vercel Environment Variables
- **Monitoring**: Sentry, Vercel Analytics
- **Cron Jobs**: Vercel Cron

---

## 🔐 3. MIGRAÇÃO DE AUTENTICAÇÃO SSO

### Configuração Atual (Base44)

Azure AD App Registration configurado com:
- Tenant ID: [definido em AZ_TENANT_ID]
- Client ID: [definido em AZ_CLIENT_ID]
- Client Secret: [definido em AZ_CLIENT_SECRET]
- Redirect URI Base44: https://[sua-app].base44.com/auth/callback

### Nova Configuração (NextAuth.js)

#### Passo 1: Instalar Dependências

```bash
npm install next-auth@beta @auth/prisma-adapter
```

#### Passo 2: Criar auth.config.ts

```typescript
import type { NextAuthConfig } from 'next-auth';
import AzureAD from 'next-auth/providers/azure-ad';

export const authConfig = {
  providers: [
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        token.email = user.email;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig;
```

#### Passo 3: Atualizar Azure AD Redirect URI

No Azure Portal > App Registrations:
- Adicionar: `https://[seu-dominio]/api/auth/callback/azure-ad`

#### Passo 4: Variáveis de Ambiente

```bash
# .env.local
AZURE_AD_CLIENT_ID=xxxxx
AZURE_AD_CLIENT_SECRET=xxxxx
AZURE_AD_TENANT_ID=xxxxx
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-random-secret-here
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

#### Passo 5: Substituir base44.auth.me()

**Antes (Base44):**
```typescript
const user = await base44.auth.me();
```

**Depois (NextAuth):**
```typescript
import { auth } from '@/auth';
const session = await auth();
const user = session?.user;
```

---

## 🗄️ 4. MIGRAÇÃO DE BANCO DE DADOS

### Opção A: Supabase (Recomendado)

**Vantagens:**
- Auth integrado (pode substituir NextAuth)
- Storage de arquivos
- Real-time subscriptions
- Interface administrativa
- Backup automático

**Setup:**
1. Criar projeto no Supabase
2. Usar Supabase Studio para criar tabelas
3. Exportar dados do Base44 (CSV/JSON)
4. Importar dados no Supabase

### Opção B: Prisma + PostgreSQL

**Vantagens:**
- Type-safe queries
- Migrations versionadas
- Melhor controle sobre schema

**Setup:**
```bash
npm install prisma @prisma/client
npx prisma init
```

**Schema Prisma (exemplo):**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  full_name   String?
  role        String   @default("user")
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  colaborador Colaborador?
  
  @@map("users")
}

model Colaborador {
  id                       String   @id @default(cuid())
  nome                     String
  cargo                    String?
  area                     String?
  departamento             String?
  departamentos            String?  // JSON
  capacidade_horas_mensais Float    @default(160)
  email                    String?  @unique
  ativo                    Boolean  @default(true)
  paginas_permissoes       String?  // JSON
  allow_print              Boolean  @default(false)
  allow_excel              Boolean  @default(false)
  created_at               DateTime @default(now())
  updated_at               DateTime @updatedAt
  created_by               String?
  
  user User? @relation(fields: [email], references: [email])
  
  @@map("colaboradores")
}

model Cliente {
  id             String   @id @default(cuid())
  nome           String
  cnpj           String?
  segmento       String?
  contato_nome   String?
  contato_email  String?
  ativo          Boolean  @default(true)
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt
  created_by     String?
  
  @@map("clientes")
}

model Proposta {
  id                   String    @id @default(cuid())
  numero_ap            String?
  cliente_nome         String
  departamento         String?
  natureza             String
  quantidade_laudos    Float     @default(0)
  quantidade_horas     Float     @default(0)
  taxa_media           Float     @default(0)
  desconto_percentual  Float     @default(0)
  valor_total          Float     @default(0)
  chance_conversao     Float     @default(50)
  temperatura          String    @default("Morna")
  status               String    @default("Em elaboração")
  data_envio           DateTime?
  ultimo_followup      DateTime?
  nivel_followup       String?
  observacoes          String?
  responsavel          String
  oap_origem           String?
  created_at           DateTime  @default(now())
  updated_at           DateTime  @updatedAt
  created_by           String?
  
  ordens_servico OrdemServico[]
  parcelas       Parcela[]
  
  @@map("propostas")
}

// ... repetir para todas as outras entidades
// Ver arquivo functions/_DATABASE_SCHEMAS.js para schema completo
```

### Exportar Dados do Base44

**Script Node.js:**

```javascript
// export-base44-data.js
const fs = require('fs');
const { base44 } = require('./src/api/base44Client');

const ENTITIES = [
  'Cliente', 'OAP', 'Proposta', 'OrdemServico', 'Parcela',
  'Colaborador', 'Departamento', 'Budget', 'BusinessUnit',
  'ServiceGroup', 'VendaMarketing', 'OrcamentoMarketing',
  'AlocacaoHoras', 'KnowledgeBase', 'IntegrationConfig'
];

async function exportEntity(entityName) {
  const data = await base44.entities[entityName].list();
  fs.writeFileSync(
    `./exports/${entityName.toLowerCase()}.json`,
    JSON.stringify(data, null, 2)
  );
  console.log(`✅ ${entityName}: ${data.length} registros`);
}

async function exportAll() {
  for (const entity of ENTITIES) {
    await exportEntity(entity);
  }
}

exportAll();
```

---

## ⚡ 5. MIGRAÇÃO DE BACKEND FUNCTIONS

### Funções Atuais:
- erpClient - Gateway API ERP
- erpDashboard - Dados dashboard
- erpProjetos - Dados projetos
- erpFinanceiro - Dados financeiros
- erpQualidade - Dados qualidade
- erpSync - Sincronização
- getAzureToken - Token OAuth
- assistantChat - Chat IA
- mysqlIntegration - MySQL

### Converter para Next.js

**Opção 1: API Routes**

```typescript
// app/api/erp/dashboard/route.ts
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { dataType } = await req.json();
  
  // Lógica...
  
  return NextResponse.json({ data });
}
```

**Opção 2: Server Actions (Recomendado)**

```typescript
// app/actions/erp.ts
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function getDashboardData(dataType: string) {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  // Lógica...
  
  return { data };
}
```

**Substituir Chamadas no Frontend:**

**Antes:**
```typescript
const response = await base44.functions.invoke('erpDashboard', { dataType: 'revenue' });
```

**Depois (API Route):**
```typescript
const response = await fetch('/api/erp/dashboard', {
  method: 'POST',
  body: JSON.stringify({ dataType: 'revenue' }),
});
```

**Depois (Server Action):**
```typescript
import { getDashboardData } from '@/app/actions/erp';
const data = await getDashboardData('revenue');
```

### Migrar Cron Jobs (erpSync)

**Vercel Cron:**

```typescript
// app/api/cron/erp-sync/route.ts
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Lógica de sync...
  
  return NextResponse.json({ success: true });
}
```

**vercel.json:**

```json
{
  "crons": [
    {
      "path": "/api/cron/erp-sync",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

---

## 🎨 6. MIGRAÇÃO DE FRONTEND

### Estrutura de Pastas

**Next.js (App Router):**

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── Dashboard/page.tsx
│   ├── Projetos/page.tsx
│   └── layout.tsx  (sidebar + header)
├── api/
│   └── erp/
├── actions/
└── layout.tsx  (root)

components/
├── ui/
├── charts/
└── dashboards/

lib/
├── prisma.ts
├── utils.ts
└── query-client.ts
```

### Migrar Páginas

**Antes (Base44):**
```typescript
// pages/Dashboard.js
export default function Dashboard() {
  return <div>...</div>;
}
```

**Depois (Next.js):**
```typescript
// app/(dashboard)/Dashboard/page.tsx
export default function DashboardPage() {
  return <div>...</div>;
}
```

### Migrar Layout

**Antes (Base44):**
```typescript
// layout.js
export default function Layout({ children, currentPageName }) {
  // ...
}
```

**Depois (Next.js):**
```typescript
// app/(dashboard)/layout.tsx
'use client';

import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPageName = pathname.split('/').pop() || 'Dashboard';
  
  return (
    <div className="flex">
      <Sidebar currentPage={currentPageName} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### Migrar Navegação

**Antes:**
```typescript
import { Link } from 'react-router-dom';
<Link to={createPageUrl('Dashboard')}>Dashboard</Link>
```

**Depois:**
```typescript
import Link from 'next/link';
<Link href="/Dashboard">Dashboard</Link>
```

### Migrar Data Fetching

**Antes (Base44 + React Query):**
```typescript
const { data } = useQuery({
  queryKey: ['clientes'],
  queryFn: () => base44.entities.Cliente.list(),
});
```

**Depois (Next.js - Server Component):**
```typescript
// app/Dashboard/page.tsx
import { prisma } from '@/lib/prisma';

async function getClientes() {
  return await prisma.cliente.findMany({
    where: { ativo: true },
  });
}

export default async function DashboardPage() {
  const clientes = await getClientes();
  return <ClientesList clientes={clientes} />;
}
```

---

## ✅ 7. CHECKLIST COMPLETO

### Preparação (1-2 dias)
- [ ] Criar projeto Next.js 14+
- [ ] Configurar TypeScript
- [ ] Instalar dependências (Tailwind, Shadcn, etc.)
- [ ] Configurar Supabase ou Prisma
- [ ] Configurar NextAuth.js
- [ ] Atualizar Azure AD redirect URI

### Banco de Dados (3-5 dias)
- [ ] Criar schema Prisma/Supabase
- [ ] Exportar dados do Base44
- [ ] Criar migrations
- [ ] Importar dados
- [ ] Validar integridade
- [ ] Criar seed script

### Autenticação (1-2 dias)
- [ ] Implementar NextAuth.js
- [ ] Configurar Azure AD provider
- [ ] Criar página de login
- [ ] Implementar middleware
- [ ] Migrar lógica de permissões
- [ ] Testar fluxo login/logout

### Backend Functions (3-5 dias)
- [ ] Converter erpClient
- [ ] Converter erpDashboard
- [ ] Converter erpProjetos
- [ ] Converter erpFinanceiro
- [ ] Converter erpQualidade
- [ ] Converter erpSync (Vercel Cron)
- [ ] Converter assistantChat
- [ ] Migrar MySQL integration
- [ ] Atualizar secrets
- [ ] Testar todas as funções

### Frontend (5-7 dias)
- [ ] Criar estrutura App Router
- [ ] Migrar componentes UI
- [ ] Migrar layout
- [ ] Migrar página Dashboard
- [ ] Migrar dashboards específicos
- [ ] Migrar página Projetos
- [ ] Migrar Pipeline, Budget
- [ ] Migrar Financeiro, Marketing
- [ ] Migrar Qualidade
- [ ] Migrar Configurações
- [ ] Testar todas as páginas

### Integrações (2-3 dias)
- [ ] Reconfigurar integração ERP
- [ ] Migrar sync logic
- [ ] Configurar webhooks
- [ ] Testar fluxo completo

### Deploy (1-2 dias)
- [ ] Configurar Vercel
- [ ] Configurar variáveis de ambiente
- [ ] Configurar domínio
- [ ] Deploy produção
- [ ] Configurar SSL
- [ ] Configurar monitoring

### Testes (2-3 dias)
- [ ] Testes de autenticação
- [ ] Testes CRUD
- [ ] Testes de permissões
- [ ] Testes integração ERP
- [ ] Testes performance
- [ ] UAT

---

## 🔧 COMANDOS ÚTEIS

### Setup Next.js Completo

```bash
# Criar projeto
npx create-next-app@latest portal-apsis --typescript --tailwind --app

# Instalar dependências
cd portal-apsis
npm install @auth/prisma-adapter next-auth@beta
npm install @prisma/client
npm install @tanstack/react-query
npm install recharts lucide-react date-fns lodash
npm install class-variance-authority clsx tailwind-merge

# Shadcn UI
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog table

# Prisma
npx prisma init
npx prisma generate
npx prisma db push
```

### Deploy Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## ⚠️ AVISOS IMPORTANTES

1. **NÃO delete nada do Base44** até validação completa
2. **Mantenha backup dos dados** em múltiplos locais
3. **Teste autenticação** extensivamente
4. **Valide permissões** antes de produção
5. **Configure monitoring** desde o início

---

Última atualização: 2026-03-12
Versão: 1.0

*/

// Este arquivo não deve ser executado, é apenas documentação
export default function() {
  throw new Error('Este arquivo é apenas documentação. Não deve ser executado como função.');
}