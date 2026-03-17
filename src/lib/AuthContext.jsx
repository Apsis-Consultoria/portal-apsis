import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMsal, useIsAuthenticated, useAccount } from '@azure/msal-react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = useAccount(accounts[0] || {});
  const [colaborador, setColaborador] = useState(null);
  const [loadingColaborador, setLoadingColaborador] = useState(false);

  useEffect(() => {
    if (isAuthenticated && account?.username) {
      setLoadingColaborador(true);
      base44.entities.Colaborador
        .filter({ email: account.username })
        .then(results => {
          if (results?.length > 0) setColaborador(results[0]);
        })
        .finally(() => setLoadingColaborador(false));
    }
  }, [isAuthenticated, account?.username]);

  const deriveRole = (col) => {
    if (!col) return 'analista';
    const cargo = (col.cargo || '').toLowerCase();
    const area = (col.area || '').toLowerCase();
    if (cargo.includes('diretor') || area.includes('diretor')) return 'diretor';
    if (cargo.includes('gerente') || area.includes('gerente')) return 'gerente';
    if (cargo.includes('admin') || area.includes('admin')) return 'admin';
    return 'analista';
  };

  const user = account ? {
    full_name: account.name || '',
    email: account.username || '',
    role: deriveRole(colaborador),
  } : null;

  const logout = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth: loadingColaborador,
      colaborador,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};