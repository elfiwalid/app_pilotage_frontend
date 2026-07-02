import { apiGet } from './api';

export interface KPISummary {
  tauxOccupation: number;
  tnf: number;
  occupationParCollab: Record<string, number>;
  evolution: Record<string, number>;
}

interface RmDashboardKpiDTO {
  tauxStaffingGlobal: number;
  ressourcesSousUtilisees: number;
  staffingMensuel: { mois: string; tauxStaffing: number }[];
}

export async function fetchKPISummary(): Promise<KPISummary> {
  const dashboard = await apiGet<RmDashboardKpiDTO>('/rm/dashboard');
  return {
    tauxOccupation: dashboard.tauxStaffingGlobal,
    tnf: dashboard.ressourcesSousUtilisees,
    occupationParCollab: {},
    evolution: Object.fromEntries(
      dashboard.staffingMensuel.map(item => [item.mois, item.tauxStaffing])
    ),
  };
}
