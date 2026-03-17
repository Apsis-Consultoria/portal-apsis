import { Toaster } from "@/components/ui/toaster"
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './lib/msalConfig';
import { AuthProvider, useAuth } from './lib/AuthContext';
import LoginScreen from './components/LoginScreen';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Login />;
  return children;
}

function App() {
  return (
    <MsalProvider instance={msalInstance}>
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AuthProvider>
          <AuthGuard>
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
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </AuthGuard>
        </AuthProvider>
        <Toaster />
      </Router>
    </QueryClientProvider>
    </MsalProvider>
  )
}

export default App