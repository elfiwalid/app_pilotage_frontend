import { getToken, apiFetch, apiGet } from './api';

export type StatutTache = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINEE' | 'BLOQUEE';

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
  statut: StatutTache;
  pourcentageAvancement: number;
}

export interface ImportTachesResponseDTO {
  lignesTraitees: number;
  tachesPlanifiees: number;
  collaborateursConcernes: number;
  taches: TacheCollaborateurDTO[];
}

export async function importerTachesProjet(
  projetId: number,
  file: File
): Promise<ImportTachesResponseDTO> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await apiFetch(`/projets/${projetId}/taches/import`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.status === 401) {
    localStorage.removeItem('s2s_token');
    localStorage.removeItem('s2s_user');
    globalThis.location.href = '/login';
    throw new Error('Session expiree. Veuillez vous reconnecter.');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error || `Erreur serveur (${response.status})`;
    throw new Error(message);
  }

  return response.json();
}

export function fetchTachesProjet(projetId: number): Promise<TacheCollaborateurDTO[]> {
  return apiGet<TacheCollaborateurDTO[]>(`/projets/${projetId}/taches`);
}
