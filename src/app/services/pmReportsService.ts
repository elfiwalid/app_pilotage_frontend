import { apiGet } from './api';

export interface PmRapportAnomalieDTO {
  idAnomalie: number;
  collaborateur: string;
  projetsConcernes: string;
  typeAnomalie: 'CONFLIT' | 'SURCHARGE' | 'SOUS_CHARGE' | 'NON_STAFFE';
  statutAnomalie: 'DETECTEE' | 'EN_COURS_TRAITEMENT' | 'RESOLUE' | 'IGNOREE';
  mois: number;
  annee: number;
  capaciteMensuelle: number;
  joursDemandes: number;
  tauxCharge: number;
  messageExplicatif: string;
}

export interface PmRapportMensuelDTO {
  annee: number;
  mois: number;
  libellePeriode: string;
  nombreTotalAnomalies: number;
  nombreConflits: number;
  nombreSurcharges: number;
  nombreSousCharges: number;
  nombreNonStaffes: number;
  nombreCollaborateursConcernes: number;
  nombreProjetsConcernes: number;
  projetsConcernes: string[];
  allocationMoyenne: number | null;
  statut: 'GENERE' | 'SANS_ANOMALIE';
  anomalies: PmRapportAnomalieDTO[];
}

export function fetchPmRapportsV2(): Promise<PmRapportMensuelDTO[]> {
  return apiGet<PmRapportMensuelDTO[]>('/projets/rapports-v2');
}
