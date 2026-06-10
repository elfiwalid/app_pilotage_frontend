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
  removeToken();
  localStorage.removeItem('s2s_user');
}

/**
 * Restore a previously saved session (if the token is still present).
 */
export function restoreSession(): AuthUser | null {
  const token = getToken();
  if (!token) return null;

  const stored = localStorage.getItem('s2s_user');
  if (!stored) {
    removeToken();
    return null;
  }

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    removeToken();
    localStorage.removeItem('s2s_user');
    return null;
  }
}
