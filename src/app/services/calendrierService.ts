import { apiGet } from './api';

export interface MoisOuvrableDTO {
  mois: number;
  label: string;
  joursTotal: number;
  weekends: number;
  joursFeries: number;
  joursOuvrablesAuto: number;
  joursOuvrablesManuel: number | null;
  valide: boolean;
}

export interface JourFerieDTO {
  date: string;
  nom: string;
  actif: boolean;
}

export interface CalendrierConfigDTO {
  pays: string;
  annee: number;
  mois: MoisOuvrableDTO[];
  joursFeries: JourFerieDTO[];
}

export function fetchCalendrier(pays: string, annee: number): Promise<CalendrierConfigDTO> {
  return apiGet<CalendrierConfigDTO>(`/rm/calendrier?pays=${pays}&annee=${annee}`);
}
