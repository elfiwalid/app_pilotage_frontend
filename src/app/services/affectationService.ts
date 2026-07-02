export interface AffectationRequestDTO {
  projetId: number;
  collaborateurId: number;
  dateDebut: string; // yyyy-MM-dd
  dateFin: string;   // yyyy-MM-dd
  tauxAffectation: number;
  roleDansProjet?: string;
}

export interface AffectationResponseDTO {
  id: number;
  projetId: number;
  projetNom: string;
  collaborateurId: number;
  collaborateurNomComplet: string;
  dateDebut: string;
  dateFin: string;
  tauxAffectation: number;
  chargePrevue: number;
  roleDansProjet: string;
}

const LEGACY_AFFECTATION_MESSAGE =
  "Le service d'affectations legacy est désactivé : aucun endpoint backend /affectations n'existe. Les affectations sont gérées par l'import V2.";

/**
 * Crée une nouvelle affectation.
 */
export function creerAffectation(data: AffectationRequestDTO): Promise<AffectationResponseDTO> {
  void data;
  return Promise.reject(new Error(LEGACY_AFFECTATION_MESSAGE));
}

/**
 * Liste les affectations pour un projet donné.
 */
export function fetchAffectationsParProjet(projetId: number): Promise<AffectationResponseDTO[]> {
  void projetId;
  return Promise.reject(new Error(LEGACY_AFFECTATION_MESSAGE));
}

/**
 * Supprime une affectation.
 */
export function supprimerAffectation(id: number): Promise<void> {
  void id;
  return Promise.reject(new Error(LEGACY_AFFECTATION_MESSAGE));
}
