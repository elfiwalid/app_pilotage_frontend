import { apiGet, apiPost, apiPut } from './api';

/* ─── Types ─── */

export interface AnomalieV2DTO {
  id: number;
  typeAnomalie: 'CONFLIT' | 'SURCHARGE' | 'SOUS_CHARGE' | 'NON_STAFFE';
  statut: 'DETECTEE' | 'EN_COURS_TRAITEMENT' | 'RESOLUE' | 'IGNOREE';
  dateDetection: string;
  collaborateurNom: string;
  numeroEmploye: string;
  annee: number;
  mois: number;
  capaciteMensuelle: number;
  totalJoursDemandes: number;
  joursDepassement: number;
  joursDisponibles: number;
  tauxCharge: number;
  conflitDateDebut: string | null;
  conflitDateFin: string | null;
  joursEnConflit: number;
  projetsConcernes: string;
  clientsConcernes: string | null;
  description: string;
}

/* ─── API Calls ─── */

/** Lancer la détection pour un mois/année. */
export function lancerDetectionV2(annee: number, mois: number, pays = 'ma'): Promise<AnomalieV2DTO[]> {
  return apiPost<AnomalieV2DTO[]>(`/rm/anomalies-v2/detecter?annee=${annee}&mois=${mois}&pays=${pays}`, {});
}

/** Lister les anomalies d'une période (avec filtre optionnel par type). */
export function fetchAnomaliesV2(annee: number, mois: number, type?: string): Promise<AnomalieV2DTO[]> {
  const params = new URLSearchParams({ annee: String(annee), mois: String(mois) });
  if (type) params.append('type', type);
  return apiGet<AnomalieV2DTO[]>(`/rm/anomalies-v2?${params}`);
}

/** Lister les anomalies filtrées par chef de projet (seulement ses collaborateurs). */
export function fetchAnomaliesV2ParChef(annee: number, mois: number): Promise<AnomalieV2DTO[]> {
  const params = new URLSearchParams({ annee: String(annee), mois: String(mois) });
  return apiGet<AnomalieV2DTO[]>(`/rm/anomalies-v2/par-chef?${params}`);
}

/** Récupérer les périodes disponibles (pour le RM). */
export function fetchPeriodesDisponibles(): Promise<{ annee: number; mois: number }[]> {
  return apiGet<{ annee: number; mois: number }[]>(`/rm/anomalies-v2/periodes`);
}

/** Récupérer les périodes disponibles pour le chef de projet connecté. */
export function fetchPeriodesChef(): Promise<{ annee: number; mois: number }[]> {
  return apiGet<{ annee: number; mois: number }[]>(`/rm/anomalies-v2/periodes-chef`);
}

/** Détail d'une anomalie. */
export function fetchAnomalieV2Detail(id: number): Promise<AnomalieV2DTO> {
  return apiGet<AnomalieV2DTO>(`/rm/anomalies-v2/${id}`);
}

/** Changer le statut d'une anomalie. */
export function changerStatutAnomalieV2(id: number, statut: string): Promise<void> {
  return apiPut<void>(`/rm/anomalies-v2/${id}/statut`, { statut });
}

/** Taux de charge d'un collaborateur pour un mois. */
export function fetchTauxCharge(collaborateurId: number, annee: number, mois: number): Promise<{ tauxCharge: number }> {
  return apiGet<{ tauxCharge: number }>(`/rm/anomalies-v2/taux-charge?collaborateurId=${collaborateurId}&annee=${annee}&mois=${mois}`);
}

/** Affectations d'un collaborateur pour un mois (dates exactes par projet). */
export interface AffectationDetailDTO {
  projetNom: string;
  dateDebut: string;  // "yyyy-MM-dd"
  dateFin: string;    // "yyyy-MM-dd"
  tauxAffectation: number;
}

export function fetchAffectationsCollab(matricule: string, annee: number, mois: number): Promise<AffectationDetailDTO[]> {
  const params = new URLSearchParams({ matricule, annee: String(annee), mois: String(mois) });
  return apiGet<AffectationDetailDTO[]>(`/rm/anomalies-v2/affectations?${params}`);
}
