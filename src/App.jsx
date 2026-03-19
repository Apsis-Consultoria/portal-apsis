import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Vendas from './pages/Vendas';
import NexusLayout from './components/nexus/NexusLayout';
import NexusInicio from './pages/NexusInicio';
import NexusComunicacao from './pages/NexusComunicacao';
import NexusSolicitacoes from './pages/NexusSolicitacoes';
import NexusDocumentos from './pages/NexusDocumentos';
import NexusProjetos from './pages/NexusProjetos';
import NexusPortalCliente from './pages/NexusPortalCliente';
import NexusConfiguracoes from './pages/NexusConfiguracoes';
const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
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

          {/* APSIS Nexus Routes */}
          <Route path="/NexusInicio" element={<NexusLayout currentPageName="NexusInicio"><NexusInicio /></NexusLayout>} />
          <Route path="/NexusComunicacao" element={<NexusLayout currentPageName="NexusComunicacao"><NexusComunicacao /></NexusLayout>} />
          <Route path="/NexusSolicitacoes" element={<NexusLayout currentPageName="NexusSolicitacoes"><NexusSolicitacoes /></NexusLayout>} />
          <Route path="/NexusDocumentos" element={<NexusLayout currentPageName="NexusDocumentos"><NexusDocumentos /></NexusLayout>} />
          <Route path="/NexusProjetos" element={<NexusLayout currentPageName="NexusProjetos"><NexusProjetos /></NexusLayout>} />
          <Route path="/NexusPortalCliente" element={<NexusLayout currentPageName="NexusPortalCliente"><NexusPortalCliente /></NexusLayout>} />
          <Route path="/NexusConfiguracoes" element={<NexusLayout currentPageName="NexusConfiguracoes"><NexusConfiguracoes /></NexusLayout>} />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  )
}

export default App