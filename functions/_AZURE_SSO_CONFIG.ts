/**
 * =====================================================
 * CONFIGURAÇÃO AZURE AD SSO - Documentação Completa
 * =====================================================
 * 
 * Este arquivo NÃO é uma função executável.
 * É documentação sobre a configuração atual do SSO e como replicá-la no NextAuth.
 * 
 * =====================================================
 */

/*

## 📋 CONFIGURAÇÃO ATUAL (Base44)

### Secrets Configurados:

```
AZ_CLIENT_ID=xxxxx
AZ_CLIENT_SECRET=xxxxx
AZ_TENANT_ID=xxxxx

sso_name=microsoft
sso_client_id=xxxxx
sso_client_secret=xxxxx
sso_tenant_id=xxxxx
sso_discovery_url=https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration
sso_scope=openid profile email
```

### Redirect URI Atual (Base44):
```
https://[seu-app].base44.com/auth/callback
```

---

## 🔄 MIGRAÇÃO PARA NEXTAUTH.JS

### 1. Atualizar Redirect URIs no Azure Portal

**Portal Azure**: https://portal.azure.com

1. Navegar: **Azure Active Directory** > **App registrations**
2. Selecionar sua aplicação
3. **Authentication** > **Platform configurations** > **Web**
4. Adicionar Redirect URIs:

```
# Desenvolvimento
http://localhost:3000/api/auth/callback/azure-ad

# Produção
https://[seu-dominio].com/api/auth/callback/azure-ad
https://[seu-dominio].vercel.app/api/auth/callback/azure-ad
```

### 2. Verificar Permissões API

Em **API permissions**, garantir:
- `openid` (delegated)
- `profile` (delegated)
- `email` (delegated)
- `User.Read` (delegated) - para Microsoft Graph

### 3. Client Secret

Se necessário criar novo:
1. **Certificates & secrets** > **Client secrets**
2. **New client secret**
3. Descrição: "Portal APSIS - Next.js"
4. Expiração: 24 meses (recomendado)
5. Copiar o **Value** (só aparece uma vez!)

---

## 🔐 IMPLEMENTAÇÃO NEXTAUTH.JS

### Arquivo: auth.config.ts

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
          prompt: 'select_account',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'user',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role || 'user';
      }

      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      // Buscar role do Colaborador
      if (token.email && !token.roleChecked) {
        const colaborador = await prisma.colaborador.findUnique({
          where: { email: token.email as string },
          select: { 
            paginas_permissoes: true,
            ativo: true,
          },
        });

        if (colaborador?.ativo) {
          token.paginas_permissoes = colaborador.paginas_permissoes;
          
          // Determinar role
          if (colaborador.paginas_permissoes) {
            const perms = JSON.parse(colaborador.paginas_permissoes);
            if (Object.keys(perms).length > 15) {
              token.role = 'admin';
            }
          }
        }
        
        token.roleChecked = true;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
        session.user.paginas_permissoes = token.paginas_permissoes as string;
      }
      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/auth');
      
      if (isAuthPage) return true;
      
      const publicPages = ['/'];
      if (publicPages.includes(nextUrl.pathname)) return true;

      if (!isLoggedIn) return false;

      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;
```

### Arquivo: auth.ts

```typescript
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
});
```

### Arquivo: middleware.ts

```typescript
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage = nextUrl.pathname.startsWith('/auth');
  const isPublicPage = ['/'].includes(nextUrl.pathname);

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/Dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  if (isPublicPage) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 🎨 PÁGINAS DE AUTENTICAÇÃO

### Login Customizado (app/auth/signin/page.tsx)

```typescript
'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F4]">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/logo-apsis.png" alt="APSIS" className="w-20 h-20 mx-auto mb-4"/>
          <h1 className="text-2xl font-bold text-[#1A4731]">Portal APSIS</h1>
          <p className="text-sm text-[#5C7060] mt-2">
            Faça login com sua conta Microsoft
          </p>
        </div>

        <Button
          onClick={() => signIn('azure-ad', { callbackUrl: '/Dashboard' })}
          className="w-full bg-[#F47920] hover:bg-[#D66A1A]"
          size="lg"
        >
          <LogIn className="mr-2" size={18} />
          Entrar com Microsoft
        </Button>

        <p className="text-xs text-center text-[#5C7060] mt-6">
          Apenas colaboradores APSIS têm acesso
        </p>
      </div>
    </div>
  );
}
```

---

## 📝 VARIÁVEIS DE AMBIENTE

### .env.local (Desenvolvimento)

```bash
# Azure AD OAuth
AZURE_AD_CLIENT_ID=xxxxx-xxxxx-xxxxx-xxxxx-xxxxx
AZURE_AD_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx
AZURE_AD_TENANT_ID=xxxxx-xxxxx-xxxxx-xxxxx-xxxxx

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portal_apsis
```

### Vercel (Produção)

```bash
AZURE_AD_CLIENT_ID=xxxxx-xxxxx-xxxxx-xxxxx-xxxxx
AZURE_AD_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx
AZURE_AD_TENANT_ID=xxxxx-xxxxx-xxxxx-xxxxx-xxxxx
NEXTAUTH_URL=https://portal-apsis.vercel.app
NEXTAUTH_SECRET=production-secret-different-from-dev
DATABASE_URL=postgresql://user:password@aws-rds:5432/portal_apsis
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 🔧 HOOKS UTILITÁRIOS

### useCurrentUser.ts

```typescript
'use client';

import { useSession } from 'next-auth/react';

export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    role: session?.user?.role || 'user',
    canView: (pageId: string) => {
      if (!session?.user) return false;
      if (session.user.role === 'admin') return true;

      if (session.user.paginas_permissoes) {
        try {
          const perms = JSON.parse(session.user.paginas_permissoes);
          return perms[pageId]?.view === true;
        } catch {
          return false;
        }
      }

      return false;
    },
  };
}
```

### Server-side Helper

```typescript
// lib/auth-helpers.ts
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/signin');
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') redirect('/AccessDenied');
  return user;
}
```

---

## ⚠️ TROUBLESHOOTING

### Erro: "redirect_uri_mismatch"
- Verificar redirect URI no Azure AD
- Formato: `https://[dominio]/api/auth/callback/azure-ad`

### Erro: "AADSTS50011"
- Verificar NEXTAUTH_URL
- Deve ser exatamente igual ao domínio

### Erro: "Application not found"
- CLIENT_ID incorreto
- Verificar no Azure Portal

### Erro: "Invalid client secret"
- CLIENT_SECRET incorreto ou expirado
- Gerar novo no Azure Portal

### Session não persiste
- Verificar cookies config
- Em produção: secure: true
- Verificar domain

---

Última atualização: 2026-03-12

*/

export default function() {
  throw new Error('Este arquivo é apenas documentação.');
}