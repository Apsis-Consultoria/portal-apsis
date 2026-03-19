import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Vendas from './pages/Vendas';
import RateioDespesas from './pages/RateioDespesas';
import NexusInicio from './pages/NexusInicio';
import NexusComunicacao from './pages/NexusComunicacao';
import NexusSolicitacoes from './pages/NexusSolicitacoes';
import NexusDocumentos from './pages/NexusDocumentos';
import NexusProjetos from './pages/NexusProjetos';
import NexusPortalCliente from './pages/NexusPortalCliente';
import NexusConfiguracoes from './pages/NexusConfiguracoes';
import CapitalHumano from './pages/CapitalHumano';
import RateiosCapitalHumano from './pages/RateiosCapitalHumano';
import FluxoCaixa from './pages/FluxoCaixa';
import PortalClienteLayout from './components/portal/PortalClienteLayout';
import PortalClienteInicio from './pages/portal/PortalClienteInicio';
import PortalClienteComunicacao from './pages/portal/PortalClienteComunicacao';
import PortalClienteDocumentos from './pages/portal/PortalClienteDocumentos';
import PortalClienteSolicitacoes from './pages/portal/PortalClienteSolicitacoes';
import PortalClienteProjetos from './pages/portal/PortalClienteProjetos';
import PortalClientePerfil from './pages/portal/PortalClientePerfil';
import ClientLogin from './pages/ClientLogin';
import ClientFirstAccess from './pages/ClientFirstAccess';
import ClientForgotPassword from './pages/ClientForgotPassword';
import ClientResetPassword from './pages/ClientResetPassword';
import ClientProtectedRoute from './components/ClientProtectedRoute';
import { ClientAuthProvider } from './lib/ClientAuthContext';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <ClientAuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <LayoutWrapper currentPageName={mainPageKey}>
                <MainPage />
              </LayoutWrapper>
            } />
            {Object.entries(Pages).map(([path, Page]) => (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  <LayoutWrapper currentPageName={path}>
                    <Page />
                  </LayoutWrapper>
                }
              />
            ))}
            <Route path="/Vendas" element={<LayoutWrapper currentPageName="Vendas"><Vendas /></LayoutWrapper>} />
            <Route path="/RateioDespesas" element={<LayoutWrapper currentPageName="RateioDespesas"><RateioDespesas /></LayoutWrapper>} />

            {/* APSIS Nexus Routes */}
            <Route path="/NexusInicio" element={<LayoutWrapper currentPageName="NexusInicio"><NexusInicio /></LayoutWrapper>} />
            <Route path="/NexusComunicacao" element={<LayoutWrapper currentPageName="NexusComunicacao"><NexusComunicacao /></LayoutWrapper>} />
            <Route path="/NexusSolicitacoes" element={<LayoutWrapper currentPageName="NexusSolicitacoes"><NexusSolicitacoes /></LayoutWrapper>} />
            <Route path="/NexusDocumentos" element={<LayoutWrapper currentPageName="NexusDocumentos"><NexusDocumentos /></LayoutWrapper>} />
            <Route path="/NexusProjetos" element={<LayoutWrapper currentPageName="NexusProjetos"><NexusProjetos /></LayoutWrapper>} />
            <Route path="/NexusPortalCliente" element={<LayoutWrapper currentPageName="NexusPortalCliente"><NexusPortalCliente /></LayoutWrapper>} />
            <Route path="/NexusConfiguracoes" element={<LayoutWrapper currentPageName="NexusConfiguracoes"><NexusConfiguracoes /></LayoutWrapper>} />
            <Route path="/CapitalHumano" element={<LayoutWrapper currentPageName="CapitalHumano"><CapitalHumano /></LayoutWrapper>} />
            <Route path="/RateiosCapitalHumano" element={<LayoutWrapper currentPageName="RateiosCapitalHumano"><RateiosCapitalHumano /></LayoutWrapper>} />
            <Route path="/FluxoCaixa" element={<LayoutWrapper currentPageName="FluxoCaixa"><FluxoCaixa /></LayoutWrapper>} />

            {/* Portal do Cliente Routes */}
            <Route path="/PortalClienteInicio" element={<PortalClienteLayout><ClientProtectedRoute><PortalClienteInicio /></ClientProtectedRoute></PortalClienteLayout>} />
            <Route path="/PortalClienteComunicacao" element={<PortalClienteLayout><ClientProtectedRoute><PortalClienteComunicacao /></ClientProtectedRoute></PortalClienteLayout>} />
            <Route path="/PortalClienteDocumentos" element={<PortalClienteLayout><ClientProtectedRoute><PortalClienteDocumentos /></ClientProtectedRoute></PortalClienteLayout>} />
            <Route path="/PortalClienteSolicitacoes" element={<PortalClienteLayout><ClientProtectedRoute><PortalClienteSolicitacoes /></ClientProtectedRoute></PortalClienteLayout>} />
            <Route path="/PortalClienteProjetos" element={<PortalClienteLayout><ClientProtectedRoute><PortalClienteProjetos /></ClientProtectedRoute></PortalClienteLayout>} />
            <Route path="/PortalClientePerfil" element={<PortalClienteLayout><ClientProtectedRoute><PortalClientePerfil /></ClientProtectedRoute></PortalClienteLayout>} />

            {/* Client Auth Routes */}
            <Route path="/ClientLogin" element={<ClientLogin />} />
            <Route path="/ClientFirstAccess" element={<ClientFirstAccess />} />
            <Route path="/ClientForgotPassword" element={<ClientForgotPassword />} />
            <Route path="/ClientResetPassword" element={<ClientResetPassword />} />

            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </ClientAuthProvider>
    </QueryClientProvider>
  )
}

export default App