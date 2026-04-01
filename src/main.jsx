import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import AuthGuard from "@/components/AuthGuard";
import { base44 } from "@/api/base44Client";

async function bootstrap() {
  let clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
  let tenantId = import.meta.env.VITE_AZURE_TENANT_ID;

  // Se não estiver disponível no frontend, busca via função backend
  if (!clientId || clientId === 'undefined' || !tenantId || tenantId === 'undefined') {
    try {
      const res = await base44.functions.invoke('getAzureConfig', {});
      clientId = res.data.clientId;
      tenantId = res.data.tenantId;
    } catch (e) {
      console.warn('Não foi possível buscar config Azure (usuário não autenticado ainda):', e);
    }
  }

  const msalConfig = {
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
      navigateToLoginRequestUrl: false,
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: true,
    },
  };

  const msalInstance = new PublicClientApplication(msalConfig);
  await msalInstance.initialize();
  // Processa o retorno do redirect após login (protegido para não derrubar o app)
  let redirectResult = null;
  try {
    redirectResult = await msalInstance.handleRedirectPromise();
  } catch (e) {
    console.warn('MSAL handleRedirectPromise error:', e);
    // Limpa estado corrompido do MSAL e continua renderizando
    localStorage.clear();
  }

  // Se acabou de fazer login com sucesso, força navegação para a tela principal
  if (redirectResult && redirectResult.account) {
    window.location.replace('/BoasVindas');
    return;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <MsalProvider instance={msalInstance}>
      <AuthGuard>
        <App />
      </AuthGuard>
    </MsalProvider>
  );
}

bootstrap();