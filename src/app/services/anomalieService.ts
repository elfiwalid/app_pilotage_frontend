import { apiGet, apiPut } from './api';

export interface AnomalieResponseDTO {
  id: number;
  titre: string;
  description: string;
  typeAnomalie: string;
  statut: string;
  dateDetection: string;
  resolu: boolean;
  projetId: number;
  projetNom: string;
  collaborateurId: number;
  collaborateurNomComplet: string;
}

export function fetchAnomalies(
  typeAnomalie?: string,
  statut?: string
): Promise<AnomalieResponseDTO[]> {
  const params = new URLSearchParams();
  if (typeAnomalie) {
    params.append('typeAnomalie', typeAnomalie);
  }
  if (statut) {
    params.append('statut', statut);
  }
  const query = params.toString();
  const endpoint = query ? `/anomalies?${query}` : '/anomalies';
  return apiGet<AnomalieResponseDTO[]>(endpoint);
}

export function resoudreAnomalie(id: number): Promise<void> {
  return apiPut<void>(`/anomalies/${id}/resoudre`, {});
}
