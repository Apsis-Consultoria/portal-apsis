/**
 * =====================================================
 * MIGRAÇÃO DE BACKEND FUNCTIONS - Guia Completo
 * =====================================================
 * 
 * Este arquivo documenta como migrar cada função backend
 * do Portal APSIS de Deno (Base44) para Next.js.
 * 
 * =====================================================
 */

/*

## 📋 FUNÇÕES ATUAIS

1. erpClient - Gateway central de API
2. erpDashboard - Dados do dashboard
3. erpProjetos - Dados de projetos
4. erpFinanceiro - Dados financeiros
5. erpQualidade - Dados de qualidade
6. erpSync - Sincronização automática
7. getAzureToken - Token OAuth Azure
8. assistantChat - Chat com assistente IA
9. mysqlIntegration - Integração MySQL

---

## 🎯 ESTRATÉGIAS

### API Routes
- Aceita GET, POST, PUT, DELETE
- Familiar para quem vem do Express
- Útil para webhooks/integrações externas

### Server Actions (Recomendado)
- Type-safe end-to-end
- Menos código boilerplate
- Otimizações automáticas
- Apenas POST

**Recomendação**: Server Actions para CRUD, API Routes para webhooks.

---

## 1️⃣ MIGRAR ERPCLIENT

### Next.js - Server Action

```typescript
// app/actions/erp-client.ts
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function erpRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const API_BASE = process.env.ERP_API_URL;
  const API_KEY = process.env.ERP_API_KEY;

  if (!API_BASE || !API_KEY) {
    throw new Error('ERP configuration missing');
  }

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`ERP API error: ${response.statusText}`);
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    await prisma.integrationLog.create({
      data: {
        integration_name: 'ERP Client',
        operation_type: method.toLowerCase(),
        entity_name: endpoint,
        status: 'success',
        execution_time_ms: executionTime,
        created_by: session.user.id,
      },
    });

    return { success: true, data };
  } catch (error) {
    const executionTime = Date.now() - startTime;

    await prisma.integrationLog.create({
      data: {
        integration_name: 'ERP Client',
        operation_type: method.toLowerCase(),
        entity_name: endpoint,
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        execution_time_ms: executionTime,
        created_by: session.user.id,
      },
    });

    throw error;
  }
}
```

---

## 2️⃣ MIGRAR ERPDASHBOARD

```typescript
// app/actions/erp-dashboard.ts
'use server';

import { erpRequest } from './erp-client';

type DashboardDataType = 'revenue' | 'proposals' | 'kpis';

export async function getDashboardData(dataType: DashboardDataType) {
  let endpoint = '';
  
  switch (dataType) {
    case 'revenue':
      endpoint = '/api/v1/financial/revenue';
      break;
    case 'proposals':
      endpoint = '/api/v1/commercial/proposals';
      break;
    case 'kpis':
      endpoint = '/api/v1/dashboard/kpis';
      break;
    default:
      throw new Error('Invalid dataType');
  }
  
  return erpRequest(endpoint, 'GET');
}

export async function getRevenue() {
  return getDashboardData('revenue');
}

export async function getProposals() {
  return getDashboardData('proposals');
}

export async function getKPIs() {
  return getDashboardData('kpis');
}
```

**Uso no Frontend:**

```typescript
// app/(dashboard)/Dashboard/page.tsx
import { getRevenue, getKPIs } from '@/app/actions/erp-dashboard';

export default async function DashboardPage() {
  const [revenueData, kpiData] = await Promise.all([
    getRevenue(),
    getKPIs(),
  ]);

  return <DashboardClient revenue={revenueData.data} kpis={kpiData.data} />;
}
```

---

## 3️⃣ MIGRAR ERPSYNC (Cron Job)

### API Route

```typescript
// app/api/cron/erp-sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { erpRequest } from '@/app/actions/erp-client';

export async function GET(request: NextRequest) {
  // Validar token do Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const data = await erpRequest('/api/v1/sync/full', 'GET');

    // Processar dados
    if (data.data.propostas) {
      for (const proposta of data.data.propostas) {
        await prisma.proposta.upsert({
          where: { numero_ap: proposta.numero_ap },
          update: {
            status: proposta.status,
            valor_total: proposta.valor_total,
            updated_at: new Date(),
          },
          create: {
            numero_ap: proposta.numero_ap,
            cliente_nome: proposta.cliente_nome,
            natureza: proposta.natureza,
            responsavel: proposta.responsavel,
            status: proposta.status,
            valor_total: proposta.valor_total,
          },
        });
      }
    }

    const executionTime = Date.now() - startTime;

    await prisma.integrationLog.create({
      data: {
        integration_name: 'ERP Sync',
        operation_type: 'sync',
        status: 'success',
        records_processed: data.data.propostas?.length || 0,
        execution_time_ms: executionTime,
      },
    });

    return NextResponse.json({
      success: true,
      records_processed: data.data.propostas?.length || 0,
      execution_time_ms: executionTime,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;

    await prisma.integrationLog.create({
      data: {
        integration_name: 'ERP Sync',
        operation_type: 'sync',
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Sync failed',
        execution_time_ms: executionTime,
      },
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
```

### Configurar Vercel Cron

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

**Schedule examples:**
- `0 */6 * * *` = A cada 6 horas
- `0 0 * * *` = Diariamente à meia-noite
- `0 9 * * 1-5` = Dias úteis às 9h

**Environment Variable:**
```bash
CRON_SECRET=xxxxx  # gerar com: openssl rand -base64 32
```

---

## 4️⃣ MIGRAR ASSISTANTCHAT

```typescript
// app/api/assistant/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, context } = await request.json();

  try {
    // Buscar knowledge base
    const knowledgeDocs = await prisma.knowledgeBase.findMany({
      where: {
        module: context,
        ativo: true,
        OR: [
          { sensitivity: 'PUBLICO' },
          { sensitivity: 'INTERNO' },
          {
            AND: [
              { sensitivity: 'RESTRITO' },
              { allowed_roles: { has: session.user.role } },
            ],
          },
        ],
      },
      select: {
        title: true,
        content: true,
      },
      take: 5,
    });

    const contextText = knowledgeDocs
      .map(doc => `${doc.title}\n${doc.content}`)
      .join('\n\n');

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Você é o assistente do Portal APSIS.\n\nContexto:\n${contextText}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;

    // Log
    await prisma.assistantLog.create({
      data: {
        user_email: session.user.email!,
        user_role: session.user.role,
        modulo: context,
        status: 'success',
        sources_count: knowledgeDocs.length,
      },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    await prisma.assistantLog.create({
      data: {
        user_email: session.user.email!,
        user_role: session.user.role,
        modulo: context,
        status: 'error',
      },
    });

    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
```

---

## 5️⃣ SUBSTITUIR CHAMADAS NO FRONTEND

### Antes (Base44):

```typescript
const response = await base44.functions.invoke('erpDashboard', {
  dataType: 'revenue',
});
```

### Depois (Server Action):

```typescript
import { getDashboardData } from '@/app/actions/erp-dashboard';

const response = await getDashboardData('revenue');
```

### Depois (API Route):

```typescript
const response = await fetch('/api/dashboard/revenue');
const data = await response.json();
```

---

## 📦 RESUMO

| Função Base44 | Next.js | Tipo | Arquivo |
|---------------|---------|------|---------|
| erpClient | erpRequest() | Server Action | app/actions/erp-client.ts |
| erpDashboard | getDashboardData() | Server Action | app/actions/erp-dashboard.ts |
| erpProjetos | getProjetosData() | Server Action | app/actions/erp-projetos.ts |
| erpFinanceiro | getFinanceiroData() | Server Action | app/actions/erp-financeiro.ts |
| erpQualidade | getQualidadeData() | Server Action | app/actions/erp-qualidade.ts |
| erpSync | /api/cron/erp-sync | API Route | app/api/cron/erp-sync/route.ts |
| getAzureToken | NextAuth callback | Auth | auth.config.ts |
| assistantChat | /api/assistant/chat | API Route | app/api/assistant/chat/route.ts |
| mysqlIntegration | mysqlQuery() | Server Action | app/actions/mysql.ts |

---

## ⚙️ VARIÁVEIS DE AMBIENTE

```bash
# ERP Integration
ERP_API_URL=https://erp.empresa.com
ERP_API_KEY=xxxxx

# Cron Jobs
CRON_SECRET=xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# MySQL (se aplicável)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=xxxxx
MYSQL_DATABASE=portal_apsis
```

---

Última atualização: 2026-03-12

*/

export default function() {
  throw new Error('Este arquivo é apenas documentação.');
}