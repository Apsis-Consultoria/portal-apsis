import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import AuthGuard from "@/components/AuthGuard";

document.title = 'Portal Apsis';

async function bootstrap() {
  const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
  const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;

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