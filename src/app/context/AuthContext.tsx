import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Role } from './RoleContext';
import { loginUser, logoutUser, restoreSession, type AuthUser } from '../services/authService';

/**
 * Authentication context — fully dynamic, backed by the backend API.
 *
 * No more static credentials. Login calls the backend which validates
 * against the database with BCrypt-hashed passwords and returns a JWT.
 */

interface AuthCtx {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => ({ ok: false }),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount (from localStorage)
  useEffect(() => {
    const restored = restoreSession();
    if (restored) {
      setUser(restored);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const authUser = await loginUser(email, password);
      setUser(authUser);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Erreur de connexion.' };
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
