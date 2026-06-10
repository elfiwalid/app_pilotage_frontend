import { apiPost } from './api';

export interface ResourceForecastRequest {
  mois: number;
  annee: number;
  dureeProjetJours: number;
  nbCollaborateursActuels: number;
  chargeMoyenne: number;
  chargeMax: number;
  nbConflits: number;
  nbSurcharges: number;
  nbSousCharges: number;
  nbAnomaliesTotal: number;
  nbCollaborateursConcernes: number;
}

export interface ResourceForecastResponse {
  currentResources: number;
  predictedResources: number;
  difference: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function fetchResourceForecast(
  request: ResourceForecastRequest
): Promise<ResourceForecastResponse> {
  return apiPost<ResourceForecastResponse>('/ml/resource-forecast', request);
}
