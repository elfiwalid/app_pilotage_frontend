/**
 * Service for performance evaluation API calls.
 *
 * Clean Code — Separation of Concerns:
 *   This module handles only evaluation-related API interactions.
 */

import { apiGet, apiPost } from './api';

export interface EvaluationRequest {
  collaborateurId: number;
  mois: number;
  annee: number;
  qualiteTravail: number;
  respectDelais: number;
  travailEquipe: number;
  communication: number;
  commentaire: string;
}

export interface EvaluationResponse {
  id: number;
  collaborateurId: number;
  collaborateurNom: string;
  collaborateurPrenom: string;
  evaluateurId: number;
  evaluateurNom: string;
  evaluateurPrenom: string;
  mois: number;
  annee: number;
  qualiteTravail: number;
  respectDelais: number;
  travailEquipe: number;
  communication: number;
  moyenneGenerale: number;
  commentaire: string;
  dateCreation: string;
}

/**
 * Soumettre une évaluation de performance (Chef de Projet → Collaborateur).
 */
export function submitEvaluation(data: EvaluationRequest): Promise<EvaluationResponse> {
  return apiPost<EvaluationResponse>('/evaluations', data);
}

/**
 * Récupérer les évaluations reçues par le collaborateur connecté.
 */
export function fetchMesEvaluations(): Promise<EvaluationResponse[]> {
  return apiGet<EvaluationResponse[]>('/evaluations/mes-evaluations');
}

/**
 * Récupérer les évaluations données par le chef de projet connecté.
 */
export function fetchEvaluationsParChef(): Promise<EvaluationResponse[]> {
  return apiGet<EvaluationResponse[]>('/evaluations/par-chef');
}

/**
 * Récupérer les évaluations d'un collaborateur spécifique.
 */
export function fetchEvaluationsCollaborateur(collabId: number): Promise<EvaluationResponse[]> {
  return apiGet<EvaluationResponse[]>(`/evaluations/collaborateur/${collabId}`);
}
