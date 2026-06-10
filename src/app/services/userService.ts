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
  return apiPut<UserResponseDTO>('/users/me', data).then(updated => {
    const stored = localStorage.getItem('s2s_user');
    if (stored) {
      try {
        const currentUser = JSON.parse(stored);
        const nextUser = {
          ...currentUser,
          nom: updated.nom,
          prenom: updated.prenom,
          email: updated.email,
          name: `${updated.prenom} ${updated.nom}`,
          initials: `${updated.prenom.charAt(0)}${updated.nom.charAt(0)}`.toUpperCase(),
          photoUrl: updated.photoUrl ?? null,
        };
        localStorage.setItem('s2s_user', JSON.stringify(nextUser));
        window.dispatchEvent(new CustomEvent('s2s_profile_updated', { detail: nextUser }));
      } catch {
        // Ignore local sync errors; the backend update already succeeded.
      }
    }
    return updated;
  });
}
