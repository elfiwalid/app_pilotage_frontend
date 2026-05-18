import { apiGet, apiPost, apiDelete } from './api';

export interface AffectationRequestDTO {
  projetId: number;
  collaborateurId: number;
  dateDebut: string; // yyyy-MM-dd
  dateFin: string;   // yyyy-MM-dd
  tauxAffectation: number;
  roleDansProjet?: string;
}

export interface AffectationResponseDTO {
  id: number;
  projetId: number;
  projetNom: string;
  collaborateurId: number;
  collaborateurNomComplet: string;
  dateDebut: string;
  dateFin: string;
  tauxAffectation: number;
  chargePrevue: number;
  roleDansProjet: string;
}

/**
 * Crée une nouvelle affectation.
 */
export function creerAffectation(data: AffectationRequestDTO): Promise<AffectationResponseDTO> {
  return apiPost<AffectationResponseDTO>('/affectations', data);
}

/**
 * Liste les affectations pour un projet donné.
 */
export function fetchAffectationsParProjet(projetId: number): Promise<AffectationResponseDTO[]> {
  return apiGet<AffectationResponseDTO[]>(`/affectations/projet/${projetId}`);
}

/**
 * Supprime une affectation.
 */
export function supprimerAffectation(id: number): Promise<void> {
  return apiDelete<void>(`/affectations/${id}`);
}
