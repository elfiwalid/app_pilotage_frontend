/**
 * PM Dashboard service — calls GET /api/projets/dashboard
 * Returns all KPIs for the Chef de Projet dashboard in a single request.
 */

import { apiGet } from './api';

export type StatutProjet = 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU';


/* ─── Nested DTOs ─────────────────────────────── */

export interface MoisCollabDTO {
  mois: string;
  annee: number;
  moisNum: number;
  collaborateurs: number;
}

export interface ProjetPerfDTO {
  id: number;
  nom: string;
  avancementPct: number;
  collaborateurs: number;
  statut: StatutProjet;
  dateDebut: string;
  dateFin: string;
}

export interface MoisAnomalieDTO {
  mois: string;
  annee: number;
  moisNum: number;
  total: number;
  surcharges: number;
  conflits: number;
  sousCharges: number;
}

export interface AnomalieResumeeDTO {
  id: number;
  collaborateurNom: string;
  typeAnomalie: 'CONFLIT' | 'SURCHARGE' | 'SOUS_CHARGE' | 'NON_STAFFE';
  statut: 'DETECTEE' | 'EN_COURS_TRAITEMENT' | 'RESOLUE' | 'IGNOREE';
  tauxCharge: number;
  projetsConcernes: string;
  annee: number;
  mois: number;
  dateDetection: string | null;
}

export interface ProjetResumeeDTO {
  id: number;
  nom: string;
  statut: StatutProjet;
  dateDebut: string;
  dateFin: string;
  avancementPct: number;
  collaborateurs: number;
}

/* ─── Main Dashboard DTO ──────────────────────── */

export interface DashboardChefProjetDTO {
  totalProjets: number;
  projetsActifs: number;
  projetsTermines: number;
  projetsEnAttente: number;
  totalCollaborateurs: number;
  totalAnomaliesMoisCourant: number;
  anomaliesCritiques: number;
  anomaliesActives: number;
  evolutionCollaborateurs: MoisCollabDTO[];
  performanceProjets: ProjetPerfDTO[];
  tendanceAnomalies: MoisAnomalieDTO[];
  anomaliesRecentes: AnomalieResumeeDTO[];
  projetsRecents: ProjetResumeeDTO[];
}

/* ─── API Call ────────────────────────────────── */

/**
 * Fetch all dashboard KPIs for the authenticated Chef de Projet.
 * @param annee optional year filter
 * @param mois  optional month filter (1-12)
 */
export function fetchPmDashboard(annee?: number, mois?: number): Promise<DashboardChefProjetDTO> {
  const params = new URLSearchParams();
  if (annee != null) params.append('annee', String(annee));
  if (mois  != null) params.append('mois',  String(mois));
  const qs = params.toString();
  return apiGet<DashboardChefProjetDTO>(`/projets/dashboard${qs ? '?' + qs : ''}`);
}
