import { apiGet, apiPut } from './api';

export interface UserResponseDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  photoUrl?: string | null;
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

/**
 * Met à jour le profil de l'utilisateur actuellement connecté.
 */
export function updateMyProfile(data: {
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  photoUrl?: string | null;
}): Promise<UserResponseDTO> {
  return apiPut<UserResponseDTO>('/users/me', data);
}
