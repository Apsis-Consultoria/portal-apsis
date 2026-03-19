import { Navigate } from 'react-router-dom';
import { useClientAuth } from '@/lib/ClientAuthContext';

export default function ClientProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useClientAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFA]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1A4731]/20 border-t-[#F47920] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5C7060]">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/ClientLogin" replace />;
  }

  return children;
}