import { createContext, useContext, useState, useEffect } from 'react';

const ClientAuthContext = createContext();

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth deve ser usado dentro de ClientAuthProvider');
  }
  return context;
};

export const ClientAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restaurar sessão ao montar
  useEffect(() => {
    const sessionToken = localStorage.getItem('client_session_token');
    const sessionExpiry = localStorage.getItem('client_session_expiry');

    if (sessionToken && sessionExpiry) {
      if (new Date(sessionExpiry) > new Date()) {
        setUser({
          email: localStorage.getItem('client_email'),
          workspace_id: localStorage.getItem('client_workspace_id'),
          nome_cliente: localStorage.getItem('client_nome'),
        });
        setIsAuthenticated(true);
      } else {
        // Sessão expirada
        localStorage.removeItem('client_session_token');
        localStorage.removeItem('client_session_expiry');
        localStorage.removeItem('client_email');
        localStorage.removeItem('client_workspace_id');
        localStorage.removeItem('client_nome');
      }
    }

    setLoading(false);
  }, []);

  const login = (userData, sessionToken, expiresIn = 3600) => {
    const expiryTime = new Date(Date.now() + expiresIn * 1000);

    localStorage.setItem('client_session_token', sessionToken);
    localStorage.setItem('client_session_expiry', expiryTime.toISOString());
    localStorage.setItem('client_email', userData.email);
    localStorage.setItem('client_workspace_id', userData.workspace_id);
    localStorage.setItem('client_nome', userData.nome_cliente);

    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('client_session_token');
    localStorage.removeItem('client_session_expiry');
    localStorage.removeItem('client_email');
    localStorage.removeItem('client_workspace_id');
    localStorage.removeItem('client_nome');

    setUser(null);
    setIsAuthenticated(false);
  };

  const getSessionToken = () => localStorage.getItem('client_session_token');

  return (
    <ClientAuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, getSessionToken }}>
      {children}
    </ClientAuthContext.Provider>
  );
};