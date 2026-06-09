/**
 * Projet service — calls the backend projet endpoints.
 *
 * Clean Code — Separation of Concerns:
 *   This module handles only projet-related API interactions.
 */

import { apiDelete, apiGet, apiPost } from './api';

/* ─── Request DTO ─────────────────────────────── */
export interface ProjetRequestDTO {
  nom: string;
  description?: string;
  dateDebut: string; // ISO date (yyyy-MM-dd)
  dateFin: string;   // ISO date (yyyy-MM-dd)
  statut?: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
}

/* ─── Response DTO ────────────────────────────── */
export interface ProjetResponseDTO {
  id: number;
  nom: string;
  description: string | null;
  dateDebut: string;
  dateFin: string;
  statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
  chefProjetId: number;
  chefProjetNomComplet: string;
  dateCreation: string;
}

/**
 * Fetch all projects belonging to the authenticated Chef de Projet.
 */
export function fetchMesProjets(): Promise<ProjetResponseDTO[]> {
  return apiGet<ProjetResponseDTO[]>('/projets');
}

/**
 * Create a new project.
 */
export function creerProjet(data: ProjetRequestDTO): Promise<ProjetResponseDTO> {
  return apiPost<ProjetResponseDTO>('/projets', data);
}

export function supprimerProjet(projetId: number): Promise<void> {
  return apiDelete<void>(`/projets/${projetId}`);
}
