import { apiGet, apiPut, apiDelete } from './api';

export interface NotificationResponseDTO {
  id: number;
  titre: string;
  message: string;
  type: 'ANOMALIE' | 'AFFECTATION' | 'PROJET' | 'SYSTEME';
  dateCreation: string; // ISO-8601
  lu: boolean;
  expediteurNomComplet: string;
}

export function fetchMesNotifications(): Promise<NotificationResponseDTO[]> {
  return apiGet<NotificationResponseDTO[]>('/notifications');
}

export function fetchNombreNonLues(): Promise<{ nonLues: number }> {
  return apiGet<{ nonLues: number }>('/notifications/count');
}

export function marquerCommeLue(id: number): Promise<void> {
  return apiPut<void>(`/notifications/${id}/lu`, {});
}

export function marquerToutesCommeLues(): Promise<void> {
  return apiPut<void>('/notifications/lu-toutes', {});
}

export function supprimerNotification(id: number): Promise<void> {
  return apiDelete<void>(`/notifications/${id}`);
}
