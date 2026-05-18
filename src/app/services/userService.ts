import { apiGet } from './api';

export interface UserResponseDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  matricule: string;
  tauxStaffing: number;
  disponible: boolean;
  role: string;
}

/**
 * Récupère la liste de tous les utilisateurs (collaborateurs).
 */
export function fetchUsers(): Promise<UserResponseDTO[]> {
  return apiGet<UserResponseDTO[]>('/users');
}

/**
 * Récupère le profil de l'utilisateur actuellement connecté.
 */
export function fetchMyProfile(): Promise<UserResponseDTO> {
  return apiGet<UserResponseDTO>('/users/me');
}
