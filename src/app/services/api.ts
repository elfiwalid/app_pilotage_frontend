/**
 * Centralized API client for communicating with the Spring Boot backend.
 *
 * Clean Code — Single point of configuration for base URL, headers, and
 * error handling. All HTTP calls go through this module so that adding
 * auth headers or logging is done in one place.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';
const API_FALLBACK_BASE_URL = 'http://localhost:8080/api';

export function buildApiUrl(endpoint: string, baseUrl = API_BASE_URL): string {
  return `${baseUrl}${endpoint}`;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(buildApiUrl(endpoint), options);
  } catch (error) {
    if (API_BASE_URL !== '/api') throw error;
    return fetch(buildApiUrl(endpoint, API_FALLBACK_BASE_URL), options);
  }
}

/**
 * Get the stored JWT token from localStorage.
 */
export function getToken(): string | null {
  return localStorage.getItem('s2s_token');
}

/**
 * Store the JWT token in localStorage.
 */
export function setToken(token: string): void {
  localStorage.setItem('s2s_token', token);
}

/**
 * Remove the JWT token from localStorage.
 */
export function removeToken(): void {
  localStorage.removeItem('s2s_token');
}

/**
 * Check if a token exists.
 */
export function hasToken(): boolean {
  return !!getToken();
}

/**
 * Build headers with optional Authorization.
 */
function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Generic API request handler.
 * Automatically attaches the JWT token and handles 401 responses.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const requestOptions: RequestInit = {
    ...options,
    headers: buildHeaders(options.headers as Record<string, string>),
  };

  let response: Response;
  try {
    response = await apiFetch(endpoint, requestOptions);
  } catch (error) {
    throw error;
  }

  // If unauthorized, clear token and redirect to login
  if (response.status === 401) {
    removeToken();
    localStorage.removeItem('s2s_user');
    window.location.href = '/login';
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error || `Erreur serveur (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();
  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}

/**
 * Shorthand for GET requests.
 */
export function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * Shorthand for POST requests.
 */
export function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Shorthand for PUT requests.
 */
export function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Shorthand for DELETE requests.
 */
export function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}
