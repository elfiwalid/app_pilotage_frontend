/**
 * Prevision service — calls the backend prevision endpoints.
 *
 * Clean Code — Separation of Concerns:
 *   This module handles only prevision-related API interactions.
 */

import { apiDelete, apiGet, getToken, apiFetch } from './api';

/* ─── Response DTOs ───────────────────────────── */

export interface PrevisionResponseDTO {
  id: number;
  nomFichier: string;
  typePrevision: 'TRIMESTRIELLE' | 'ANNUELLE';
  periodeDebut: string;
  periodeFin: string;
  dateImport: string;
  active: boolean;
  importeParNomComplet: string;
  projetId: number;
  projetNom: string;
}

export interface PrevisionStatsDTO {
  nombreCollaborateurs: number;
  nombreMois: number;
  typePrevision: 'TRIMESTRIELLE' | 'ANNUELLE';
  dateImport: string;
}

/* ─── API Base URL ────────────────────────────── */

/* ─── Service Functions ───────────────────────── */

/**
 * Import a prevision file for a project.
 * Uses fetch directly with FormData (multipart/form-data) since apiPost
 * sets Content-Type to application/json which is incompatible with file uploads.
 */
export async function importerPrevision(
  projetId: number,
  file: File,
  typePrevision: string,
  periodeDebut: string,
  periodeFin: string
): Promise<PrevisionResponseDTO> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('typePrevision', typePrevision);
  formData.append('periodeDebut', periodeDebut);
  formData.append('periodeFin', periodeFin);

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await apiFetch(
    `/projets/${projetId}/previsions`,
    {
      method: 'POST',
      headers,
      body: formData,
    }
  );

  if (response.status === 401) {
    localStorage.removeItem('s2s_token');
    localStorage.removeItem('s2s_user');
    globalThis.location.href = '/login';
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error || `Erreur serveur (${response.status})`;
    throw new Error(message);
  }

  return response.json();
}

/**
 * Fetch the history of previsions for a project (sorted by dateImport desc).
 */
export function getHistorique(projetId: number): Promise<PrevisionResponseDTO[]> {
  return apiGet<PrevisionResponseDTO[]>(`/projets/${projetId}/previsions`);
}

/**
 * Fetch the active prevision for a project.
 * Returns null if no active prevision exists (HTTP 204).
 */
export async function getPrevisionActive(
  projetId: number
): Promise<PrevisionResponseDTO | null> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await apiFetch(
    `/projets/${projetId}/previsions/active`,
    {
      method: 'GET',
      headers,
    }
  );

  if (response.status === 401) {
    localStorage.removeItem('s2s_token');
    localStorage.removeItem('s2s_user');
    globalThis.location.href = '/login';
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error || `Erreur serveur (${response.status})`;
    throw new Error(message);
  }

  return response.json();
}

/**
 * Download a prevision file. Triggers a browser file download.
 */
export async function telechargerPrevision(previsionId: number): Promise<void> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await apiFetch(
    `/previsions/${previsionId}/download`,
    {
      method: 'GET',
      headers,
    }
  );

  if (response.status === 401) {
    localStorage.removeItem('s2s_token');
    localStorage.removeItem('s2s_user');
    globalThis.location.href = '/login';
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error || `Erreur serveur (${response.status})`;
    throw new Error(message);
  }

  // Extract filename from Content-Disposition header
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = 'prevision.xlsx';
  if (contentDisposition) {
    const match = new RegExp(/filename="?([^";\n]+)"?/).exec(contentDisposition);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  // Create blob and trigger download
  const blob = await response.blob();
  const url = globalThis.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  globalThis.URL.revokeObjectURL(url);
}

/**
 * Fetch statistics for a prevision.
 */
export function getStatistiques(previsionId: number): Promise<PrevisionStatsDTO> {
  return apiGet<PrevisionStatsDTO>(`/previsions/${previsionId}/stats`);
}

export function supprimerPrevision(previsionId: number): Promise<void> {
  return apiDelete<void>(`/previsions/${previsionId}`);
}
