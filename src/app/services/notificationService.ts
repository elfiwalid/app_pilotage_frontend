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

function notifyNotificationsChanged(): void {
  window.dispatchEvent(new Event('s2s:notifications-changed'));
}

export async function marquerCommeLue(id: number): Promise<void> {
  await apiPut<void>(`/notifications/${id}/lu`, {});
  notifyNotificationsChanged();
}

export async function marquerToutesCommeLues(): Promise<void> {
  await apiPut<void>('/notifications/lu-toutes', {});
  notifyNotificationsChanged();
}

export async function supprimerNotification(id: number): Promise<void> {
  await apiDelete<void>(`/notifications/${id}`);
  notifyNotificationsChanged();
}
