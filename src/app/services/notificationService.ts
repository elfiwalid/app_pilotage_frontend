import { apiGet, apiPut } from './api';

export interface NotificationResponseDTO {
  id: number;
  message: string;
  dateNotification: string;
  lu: boolean;
}

export function fetchMesNotifications(): Promise<NotificationResponseDTO[]> {
  return apiGet<NotificationResponseDTO[]>('/notifications');
}

export function marquerCommeLue(id: number): Promise<void> {
  return apiPut<void>(`/notifications/${id}/lu`, {});
}
