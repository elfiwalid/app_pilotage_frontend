import { apiGet } from './api';

export interface KPISummary {
  tauxOccupation: number;
  tnf: number;
  occupationParCollab: Record<string, number>;
  evolution: Record<string, number>;
}

export function fetchKPISummary(): Promise<KPISummary> {
  return apiGet<KPISummary>('/kpis/summary');
}
