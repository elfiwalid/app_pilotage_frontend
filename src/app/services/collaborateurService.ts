import { apiGet } from './api';

/* ─── Types alignés sur les DTO backend ─── */

export interface CollabProjetDTO {
  id: number;
  nom: string;
  description: string | null;
  role: string;
  tauxAffectation: number;
  dateDebut: string; // ISO yyyy-MM-dd
  dateFin: string;
  statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
  chefProjetNomComplet: string;
  couleur: string;
  avancement: number;
  tailleEquipe: number;
}

export interface ChargeMensuelleDTO {
  mois: string;
  annee: number;
  tauxCharge: number;
  nombreProjets: number;
}

export interface CollabDashboardDTO {
  projetsAssignes: number;
  tauxCharge: number;
  capaciteRestante: number;
  projetsBientotTermines: number;
  avancementMoyen: number;
  projets: CollabProjetDTO[];
  chargeMensuelle: ChargeMensuelleDTO[];
}

export interface SlotDTO {
  projetId: number;
  projet: string;
  couleur: string;
  alloc: number;
}

export interface TacheJourDTO {
  id: number;
  projetId: number;
  projet: string;
  tache: string;
  ordreJour: number;
}

export interface TacheCollaborateurDTO {
  id: number;
  projetId: number;
  projetNom: string;
  collaborateurId: number;
  collaborateurNomComplet: string;
  matricule: string | null;
  tache: string;
  dateTache: string;
  ordreJour: number;
  dateDebutV2: string;
  dateFinV2: string;
}

export interface CollabPlanningJourDTO {
  date: string; // ISO yyyy-MM-dd
  slots: SlotDTO[];
  taches: TacheJourDTO[];
}

/* ─── API calls ─── */

export function fetchCollabDashboard(annee?: number, mois?: number): Promise<CollabDashboardDTO> {
  const params = new URLSearchParams();
  if (annee) params.append('annee', String(annee));
  if (mois) params.append('mois', String(mois));
  const query = params.toString();
  return apiGet<CollabDashboardDTO>(`/collaborateur/dashboard${query ? '?' + query : ''}`);
}

export function fetchCollabProjets(): Promise<CollabProjetDTO[]> {
  return apiGet<CollabProjetDTO[]>('/collaborateur/projets');
}

export function fetchCollabPlanning(annee: number, mois: number): Promise<CollabPlanningJourDTO[]> {
  return apiGet<CollabPlanningJourDTO[]>(`/collaborateur/planning?annee=${annee}&mois=${mois}`);
}

export function fetchCollabTaches(annee?: number, mois?: number): Promise<TacheCollaborateurDTO[]> {
  const params = new URLSearchParams();
  if (annee) params.append('annee', String(annee));
  if (mois) params.append('mois', String(mois));
  const query = params.toString();
  return apiGet<TacheCollaborateurDTO[]>(`/collaborateur/taches${query ? '?' + query : ''}`);
}
