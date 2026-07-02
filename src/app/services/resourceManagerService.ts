import { apiDelete, apiGet, apiPost, apiFetch } from './api';

export interface ProjetAffecteDTO {
  projetId: number;
  projetNom: string;
  tauxAffectation: number;
  couleur: string;
}

export interface RmResourceDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  matricule: string;
  tauxUtilisation: number;
  disponible: boolean;
  projets: ProjetAffecteDTO[];
  heatmap: number[]; // 12 values (Jan-Dec)
}

export interface MembreEquipeDTO {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  tauxAffectation: number;
}

export interface RmProjetDTO {
  id: number;
  nom: string;
  description: string | null;
  dateDebut: string;
  dateFin: string;
  statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
  chefProjetNomComplet: string;
  avancement: number;
  equipe: MembreEquipeDTO[];
}

export function fetchRmResources(annee?: number, mois?: number): Promise<RmResourceDTO[]> {
  const params = new URLSearchParams();
  if (annee) params.append('annee', String(annee));
  if (mois) params.append('mois', String(mois));
  const query = params.toString();
  return apiGet<RmResourceDTO[]>(`/rm/resources${query ? '?' + query : ''}`);
}

export function supprimerRmResource(collaborateurId: number): Promise<void> {
  return apiDelete<void>(`/rm/resources/${collaborateurId}`);
}

/* ─── Dashboard RM ─── */

export interface AnomalieResumeDTO {
  id: number;
  type: string;
  collaborateur: string;
  projets: string;
  charge: number;
  severite: string;
}

export interface RmDashboardDTO {
  totalCollaborateurs: number;
  collaborateursActifs: number;
  tauxStaffingGlobal: number;
  conflitsDetectes: number;
  ressourcesSurchargees: number;
  ressourcesSousUtilisees: number;
  projetsEnCours: number;
  projetsPlanifies: number;
  projetsTermines: number;
  anomaliesActives: AnomalieResumeDTO[];
  staffingMensuel: { mois: string; tauxStaffing: number; objectif: number }[];
  anomaliesMensuelles: { mois: string; surcharge: number; sousUtilisation: number; conflit: number }[];
}

export function fetchRmDashboard(annee?: number, mois?: number): Promise<RmDashboardDTO> {
  const params = new URLSearchParams();
  if (annee) params.append('annee', String(annee));
  if (mois) params.append('mois', String(mois));
  const query = params.toString();
  return apiGet<RmDashboardDTO>(`/rm/dashboard${query ? '?' + query : ''}`);
}

export function fetchRmProjets(): Promise<RmProjetDTO[]> {
  return apiGet<RmProjetDTO[]>('/rm/projets');
}

/* ─── Conflits ─── */

export interface ProjetImplique {
  projetId: number;
  nom: string;
  chefProjet: string;
  charge: number;
  couleur: string;
}

export interface AlternativeDTO {
  collaborateurId: number;
  nom: string;
  prenom: string;
  poste: string;
  disponibilite: number;
}

export interface RmConflitDTO {
  id: number;
  collaborateur: string;
  collaborateurEmail: string;
  role: string;
  chefProjet: string;
  tauxCharge: number;
  type: 'surcharge' | 'sous-utilisation';
  severite: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  periode: string;
  projets: ProjetImplique[];
  alternatives: AlternativeDTO[];
}

export function fetchRmConflits(): Promise<RmConflitDTO[]> {
  return apiGet<RmConflitDTO[]>('/rm/conflits');
}

export function proposerAlternative(anomalieId: number, collaborateurId: number, projetId: number): Promise<void> {
  return apiPost<void>('/rm/propositions', { anomalieId, collaborateurId, projetId });
}


/* ─── Export V2 Consolidé ─── */

export async function exportV2Consolide(projetIds: number[]): Promise<void> {
  const token = localStorage.getItem('s2s_token');
  const response = await apiFetch('/rm/export-v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ projetIds }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || `Erreur serveur (${response.status})`);
  }

  // Télécharger le fichier
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const disposition = response.headers.get('Content-Disposition');
  const filename = disposition?.match(/filename="(.+)"/)?.[1] || `V2_Consolide_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
