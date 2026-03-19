import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Vendas from './pages/Vendas';
import RateioDespesas from './pages/RateioDespesas';
import MarketingIndicadores from './pages/MarketingIndicadores';
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
import Estoque from './pages/Estoque';
import TecnologiaInicio from './pages/TecnologiaInicio';
import EstoqueAtivos from './pages/EstoqueAtivos';
import AlocacaoEquipamentos from './pages/AlocacaoEquipamentos';
import MovimentacoesEquipamentos from './pages/MovimentacoesEquipamentos';
import DashboardTI from './pages/DashboardTI';
import AppAtivoFixo from './pages/AppAtivoFixo';
import AppConciliacao from './pages/AppConciliacao';
import AppImoveis from './pages/AppImoveis';
import AppCubus from './pages/AppCubus';
import AxonIA from './pages/AxonIA';
import IndicadoresTáticos from './pages/IndicadoresTáticos';
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
            <Route path="/" element={<Navigate to="/Dashboard" replace />} />
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
            <Route path="/Estoque" element={<LayoutWrapper currentPageName="Estoque"><Estoque /></LayoutWrapper>} />
            <Route path="/TecnologiaInicio" element={<LayoutWrapper currentPageName="TecnologiaInicio"><TecnologiaInicio /></LayoutWrapper>} />
            <Route path="/EstoqueAtivos" element={<LayoutWrapper currentPageName="EstoqueAtivos"><EstoqueAtivos /></LayoutWrapper>} />
            <Route path="/AlocacaoEquipamentos" element={<LayoutWrapper currentPageName="AlocacaoEquipamentos"><AlocacaoEquipamentos /></LayoutWrapper>} />
            <Route path="/MovimentacoesEquipamentos" element={<LayoutWrapper currentPageName="MovimentacoesEquipamentos"><MovimentacoesEquipamentos /></LayoutWrapper>} />
            <Route path="/DashboardTI" element={<LayoutWrapper currentPageName="DashboardTI"><DashboardTI /></LayoutWrapper>} />
            <Route path="/MarketingIndicadores" element={<LayoutWrapper currentPageName="MarketingIndicadores"><MarketingIndicadores /></LayoutWrapper>} />
            <Route path="/AppAtivoFixo" element={<LayoutWrapper currentPageName="AppAtivoFixo"><AppAtivoFixo /></LayoutWrapper>} />
            <Route path="/AppConciliacao" element={<LayoutWrapper currentPageName="AppConciliacao"><AppConciliacao /></LayoutWrapper>} />
            <Route path="/AppImoveis" element={<LayoutWrapper currentPageName="AppImoveis"><AppImoveis /></LayoutWrapper>} />
            <Route path="/AppCubus" element={<LayoutWrapper currentPageName="AppCubus"><AppCubus /></LayoutWrapper>} />
            <Route path="/AxonIA" element={<LayoutWrapper currentPageName="AxonIA"><AxonIA /></LayoutWrapper>} />
            <Route path="/IndicadoresTáticos" element={<LayoutWrapper currentPageName="IndicadoresTáticos"><IndicadoresTáticos /></LayoutWrapper>} />

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