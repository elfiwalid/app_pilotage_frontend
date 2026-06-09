import { apiGet, apiPost } from './api';

export type ConversationStatus = 'ACTIVE' | 'CLOSED';
export type MessageType = 'USER' | 'SYSTEM';
export type DecisionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NOT_REQUIRED';

export interface SimulationDecisionDto {
  id: number;
  chefProjetId: number;
  chefProjetNomComplet: string;
  projetId: number;
  projetNom: string;
  status: DecisionStatus;
  commentaire?: string | null;
  dateDecision?: string | null;
}

export interface ConversationParticipantDto {
  userId: number;
  nomComplet: string;
  role: string;
  projetId?: number | null;
  projetNom?: string | null;
  chefProjetConcerne: boolean;
}

export interface ConversationSimulationDto {
  id: number;
  simulationId: number;
  status: ConversationStatus;
  dateCreation: string;
  createdByNomComplet: string;
  collaborateurSource: string;
  collaborateurCible: string;
  dateDebut: string;
  dateFin: string;
  projetsConflit: string[];
  resultat: 'POSITIF' | 'NEGATIF' | 'NEUTRE';
  statutSimulation: 'TERMINEE' | 'VALIDEE' | 'ANNULEE';
  tauxSourceAvant: number;
  tauxSourceApres: number;
  tauxCibleAvant: number;
  tauxCibleApres: number;
  participants: ConversationParticipantDto[];
  decisions: SimulationDecisionDto[];
}

export interface MessageConversationDto {
  id: number;
  auteurId?: number | null;
  auteurNomComplet: string;
  type: MessageType;
  contenu: string;
  dateEnvoi: string;
}

export function createConversationFromSimulation(simulationId: number): Promise<ConversationSimulationDto> {
  return apiPost<ConversationSimulationDto>(`/conversations/from-simulation/${simulationId}`, {});
}

export function fetchMyConversations(): Promise<ConversationSimulationDto[]> {
  return apiGet<ConversationSimulationDto[]>('/conversations/my');
}

export function fetchConversation(id: number): Promise<ConversationSimulationDto> {
  return apiGet<ConversationSimulationDto>(`/conversations/${id}`);
}

export function fetchConversationMessages(id: number): Promise<MessageConversationDto[]> {
  return apiGet<MessageConversationDto[]>(`/conversations/${id}/messages`);
}

export function sendConversationMessage(id: number, contenu: string): Promise<MessageConversationDto> {
  return apiPost<MessageConversationDto>(`/conversations/${id}/messages`, { contenu });
}

export function acceptSimulation(simulationId: number, commentaire = ''): Promise<ConversationSimulationDto> {
  return apiPost<ConversationSimulationDto>(`/simulations/what-if/${simulationId}/accept`, { commentaire });
}

export function rejectSimulation(simulationId: number, commentaire = ''): Promise<ConversationSimulationDto> {
  return apiPost<ConversationSimulationDto>(`/simulations/what-if/${simulationId}/reject`, { commentaire });
}
