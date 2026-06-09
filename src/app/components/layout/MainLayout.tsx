import { Outlet, Navigate, useNavigate, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Toaster } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARDS } from '../../context/RoleContext';

/**
 * Détermine si une route est accessible pour un rôle donné.
 * - rm  : routes commençant par /pm ou /collab → interdit
 * - pm  : routes commençant par /collab ou pages RM uniquement → interdit
 * - collab : seulement les routes /collab
 */
function isRouteAllowed(pathname: string, role: 'rm' | 'pm' | 'collab'): boolean {
  if (role === 'rm') {
    return !pathname.startsWith('/pm') && !pathname.startsWith('/collab');
  }
  if (role === 'pm') {
    // Le PM peut accéder uniquement à /pm/*.
    if (pathname.startsWith('/pm')) return true;
    return false;
  }
  // collab : uniquement /collab/*
  return pathname.startsWith('/collab');
}

export function MainLayout() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show nothing while restoring session from localStorage
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F2F6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '36px', height: '36px', border: '3px solid #E5E7EB',
            borderTopColor: '#7B2CBF', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
          }} />
          <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Chargement…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Si l'utilisateur est connecté mais essaie d'accéder à une route hors de son rôle,
  // le rediriger vers son dashboard par défaut
  if (user && !isRouteAllowed(location.pathname, user.role)) {
    return <Navigate to={ROLE_DASHBOARDS[user.role]} replace />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#F0F2F6' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: '4px',
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          },
        }}
      />
    </div>
  );
}
