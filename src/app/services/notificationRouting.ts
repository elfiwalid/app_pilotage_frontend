import type { NotificationResponseDTO } from './notificationService';

export type AppRole = 'rm' | 'pm' | 'collab' | string;

function textOf(notification: NotificationResponseDTO): string {
  return `${notification.type} ${notification.titre || ''} ${notification.message || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getNotificationTarget(notification: NotificationResponseDTO, role: AppRole): string {
  const text = textOf(notification);

  if (role === 'rm') {
    if (notification.type === 'ANOMALIE' || text.includes('conflit') || text.includes('anomalie')) return '/conflicts';
    if (text.includes('conversation') || text.includes('message') || text.includes('what-if propose')) return '/conversations';
    if (text.includes('simulation') || text.includes('what-if')) return '/simulation';
    if (notification.type === 'PROJET' || text.includes('projet')) return '/projects';
    if (notification.type === 'AFFECTATION' || text.includes('ressource') || text.includes('collaborateur')) return '/resources';
    return '/rm/notifications';
  }

  if (role === 'pm') {
    if (text.includes('conversation') || text.includes('message') || text.includes('simulation') || text.includes('what-if')) return '/pm/conversations';
    if (notification.type === 'ANOMALIE' || text.includes('anomalie') || text.includes('conflit')) return '/pm/anomalies';
    if (text.includes('rapport')) return '/pm/reports';
    if (notification.type === 'PROJET' || notification.type === 'AFFECTATION' || text.includes('import') || text.includes('tache') || text.includes('tâche')) return '/pm/projects';
    return '/pm/notifications';
  }

  if (role === 'collab') {
    if (text.includes('tache') || text.includes('tâche') || text.includes('planning') || notification.type === 'AFFECTATION') return '/collab/schedule';
    if (notification.type === 'PROJET' || text.includes('projet')) return '/collab/projects';
    return '/collab/notifications';
  }

  return '/';
}
