import { apiPost } from './api';

/* ─── REMPLACEMENT Types ─── */

export interface SimulationRemplacementRequest {
  anomalieId: number;
  collaborateurSourceId: number;
  collaborateurCibleId: number;
  projetId: number;
  dateDebut: string;
  dateFin: string;
  tauxAffectation: number;
  resourceManagerId: number;
  annee: number;
  mois: number;
  pays: string;
}

export interface SimulationRemplacementResponse {
  simulationId: number;
  typeSimulation: 'REMPLACEMENT';
  resultat: 'POSITIF' | 'NEGATIF' | 'NEUTRE';
  commentaire: string;

  collaborateurSource: string;
  joursSourceAvant: number;
  joursSourceApres: number;
  tauxSourceAvant: number;
  tauxSourceApres: number;
  etatSourceApres: string;

  collaborateurCible: string;
  joursCibleAvant: number;
  joursCibleApres: number;
  tauxCibleAvant: number;
  tauxCibleApres: number;
  etatCibleApres: string;

  conflitCorrige: boolean;
  nouvelleSurcharge: boolean;
  nouveauConflit: boolean;
  sousChargeReduite: boolean;
}

/* ─── SOUS_CHARGE Types ─── */

export interface SimulationSousChargeRequest {
  anomalieId: number;
  collaborateurCibleId: number;
  projetId: number;
  dateDebut: string;
  dateFin: string;
  tauxAffectation: number;
  resourceManagerId: number;
  annee: number;
  mois: number;
  pays: string;
}

export interface SimulationSousChargeResponse {
  simulationId: number;
  typeSimulation: 'SOUS_CHARGE';
  resultat: 'POSITIF' | 'NEGATIF' | 'NEUTRE';
  commentaire: string;

  collaborateurCible: string;

  joursCibleAvant: number;
  joursCibleApres: number;

  tauxCibleAvant: number;
  tauxCibleApres: number;

  etatCibleAvant: string;
  etatCibleApres: string;

  sousChargeReduite: boolean;
  nouvelleSurcharge: boolean;
  nouveauConflit: boolean;
}

/* ─── API Calls ─── */

/** Lancer une simulation de remplacement. */
export function simulerRemplacement(request: SimulationRemplacementRequest): Promise<SimulationRemplacementResponse> {
  return apiPost<SimulationRemplacementResponse>('/simulations/what-if/remplacement', request);
}

/** Lancer une simulation sous-charge. */
export function simulerSousCharge(request: SimulationSousChargeRequest): Promise<SimulationSousChargeResponse> {
  return apiPost<SimulationSousChargeResponse>('/simulations/what-if/sous-charge', request);
}

/** Valider une simulation (appliquer le remplacement/ajout réel). */
export function validerSimulation(simulationId: number): Promise<void> {
  return apiPost<void>(`/simulations/what-if/${simulationId}/valider`, {});
}

/** Annuler une simulation. */
export function annulerSimulation(simulationId: number): Promise<void> {
  return apiPost<void>(`/simulations/what-if/${simulationId}/annuler`, {});
}
