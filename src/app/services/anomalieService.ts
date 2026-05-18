import { apiGet, apiPut } from './api';

export interface AnomalieResponseDTO {
  id: number;
  typeAnomalie: string;
  description: string;
  dateDetection: string;
  resolu: boolean;
  projetId?: number;
  projetNom: string;
  collaborateurId: number;
  collaborateurNomComplet: string;
}

export function fetchAnomalies(): Promise<AnomalieResponseDTO[]> {
  return apiGet<AnomalieResponseDTO[]>('/anomalies');
}

export function resoudreAnomalie(id: number): Promise<void> {
  return apiPut<void>(`/anomalies/${id}/resoudre`, {});
}
