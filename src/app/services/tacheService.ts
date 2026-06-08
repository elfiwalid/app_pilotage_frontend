import { getToken } from './api';

const API_BASE_URL = '/api';

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

  const response = await fetch(`${API_BASE_URL}/projets/${projetId}/taches/import`, {
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
