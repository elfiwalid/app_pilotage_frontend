/**
 * Authentication service — calls the backend auth endpoints.
 *
 * Clean Code — Separation of Concerns:
 *   This module handles only auth-related API interactions.
 *   State management stays in the AuthContext.
 */

import { apiPost, setToken, removeToken, getToken } from './api';

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
  nom: string;
  prenom: string;
  photoUrl?: string | null;
}

export interface AuthUser {
  email: string;
  role: 'rm' | 'pm' | 'collab';
  nom: string;
  prenom: string;
  name: string;
  initials: string;
  avatarGradient: string;
  photoUrl?: string | null;
}

/** Map backend role enum to frontend role key */
const ROLE_MAP: Record<string, 'rm' | 'pm' | 'collab'> = {
  RESOURCE_MANAGER: 'rm',
  CHEF_PROJET: 'pm',
  COLLABORATEUR: 'collab',
};

/** Gradient per role */
const GRADIENT_MAP: Record<string, string> = {
  rm: 'linear-gradient(135deg,#7B2CBF,#E600A9)',
  pm: 'linear-gradient(135deg,#1E40AF,#2D9CDB)',
  collab: 'linear-gradient(135deg,#065F46,#059669)',
};

const VALID_ROLES: AuthUser['role'][] = ['rm', 'pm', 'collab'];

function clearStoredSession(): void {
  removeToken();
  localStorage.removeItem('s2s_user');
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== 'number') return true;

  return exp * 1000 <= Date.now();
}

function isStoredAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false;
  const user = value as Partial<AuthUser>;
  return (
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    typeof user.initials === 'string' &&
    !!user.role &&
    VALID_ROLES.includes(user.role)
  );
}

/**
 * Build an AuthUser from the backend login response.
 */
function toAuthUser(data: LoginResponse): AuthUser {
  const frontendRole = ROLE_MAP[data.role] || 'collab';
  const fullName = `${data.prenom} ${data.nom}`;
  const initials = `${data.prenom.charAt(0)}${data.nom.charAt(0)}`.toUpperCase();

  return {
    email: data.email,
    role: frontendRole,
    nom: data.nom,
    prenom: data.prenom,
    name: fullName,
    initials,
    avatarGradient: GRADIENT_MAP[frontendRole],
    photoUrl: data.photoUrl,
  };
}

/**
 * Log in the user with email and password.
 * Stores the token and user info in localStorage.
 */
export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const data = await apiPost<LoginResponse>('/auth/login', { email, password });

  // Store token and user data
  setToken(data.token);
  const authUser = toAuthUser(data);
  localStorage.setItem('s2s_user', JSON.stringify(authUser));

  return authUser;
}

/**
 * Log the user out: clear all stored auth data.
 */
export function logoutUser(): void {
  clearStoredSession();
}

/**
 * Restore a previously saved session only if the JWT is still usable.
 */
export function restoreSession(): AuthUser | null {
  const token = getToken();
  if (!token) return null;

  if (isTokenExpired(token)) {
    clearStoredSession();
    return null;
  }

  const stored = localStorage.getItem('s2s_user');
  if (!stored) {
    clearStoredSession();
    return null;
  }

  try {
    const user = JSON.parse(stored);
    if (!isStoredAuthUser(user)) {
      clearStoredSession();
      return null;
    }
    return user;
  } catch {
    clearStoredSession();
    return null;
  }
}
