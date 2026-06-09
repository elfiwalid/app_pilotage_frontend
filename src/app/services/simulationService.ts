import { apiGet, apiPost } from './api';

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
  dateDebut?: string;
  dateFin?: string;
  projetsConflit?: string[];

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

export interface CollaborateurDisponibleConflit {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  matricule: string;
  tauxUtilisation: number;
  tauxApresSimulation: number;
  disponibilite: number;
  joursDisponibles: number;
}

export interface SimulationConflitContext {
  conflitId: number;
  collaborateurSourceId: number;
  collaborateurSourceNomComplet: string;
  matricule: string;
  dateDebut: string;
  dateFin: string;
  annee: number;
  mois: number;
  tauxCharge: number;
  joursEnConflit: number;
  description: string;
  projetsConflit: ProjetConflit[];
}

export interface ProjetConflit {
  projetId: number;
  projetNom: string;
  chefProjetNomComplet: string;
  dateDebut: string;
  dateFin: string;
  tauxAffectation: number;
  joursOuvrables: number;
}

export interface SimulationDepuisConflitRequest {
  conflitId: number;
  collaborateurCibleId: number;
  resourceManagerId: number;
  tauxAffectation?: number;
  pays?: string;
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

export function fetchSimulationConflitContext(conflitId: number): Promise<SimulationConflitContext> {
  return apiGet<SimulationConflitContext>(`/simulations/what-if/conflits/${conflitId}/context`);
}

export function fetchCollaborateursDisponiblesConflit(conflitId: number): Promise<CollaborateurDisponibleConflit[]> {
  return apiGet<CollaborateurDisponibleConflit[]>(`/simulations/what-if/conflits/${conflitId}/collaborateurs-disponibles`);
}

export function simulerDepuisConflit(request: SimulationDepuisConflitRequest): Promise<SimulationRemplacementResponse> {
  return apiPost<SimulationRemplacementResponse>('/simulations/what-if/from-conflit', request);
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
