/**
 * PrevisionHistoryView — Displays the history of previsions for a project.
 *
 * Shows a list sorted by dateImport descending with:
 * - Visual status badge: "Active" (green) or "Archivée" (grey)
 * - Download button for each prevision
 * - Fields: nomFichier, typePrevision, periodeDebut, periodeFin, dateImport
 *
 * Requirements: 8.4, 8.5
 */

import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, Loader2, History, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  C, R, cardStyle, thStyle, tdStyle,
  Modal, ModalHeader, Badge as DsBadge, EmptyState,
} from '../ui/design-system';
import {
  getHistorique,
  supprimerPrevision,
  telechargerPrevision,
  type PrevisionResponseDTO,
} from '../../services/previsionService';

/* ─── Props ─────────────────────────────────────── */
interface PrevisionHistoryViewProps {
  projetId: number;
  isOpen: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

/* ─── Helpers ───────────────────────────────────── */
function formatDate(isoDate: string): string {
  try {
    return format(new Date(isoDate), 'dd MMM yyyy', { locale: fr });
  } catch {
    return isoDate;
  }
}

function formatDateTime(isoDate: string): string {
  try {
    return format(new Date(isoDate), 'dd MMM yyyy à HH:mm', { locale: fr });
  } catch {
    return isoDate;
  }
}

function formatTypePrevision(type: string): string {
  return type === 'TRIMESTRIELLE' ? 'Trimestrielle' : 'Annuelle';
}

/* ─── Component ─────────────────────────────────── */
export function PrevisionHistoryView({ projetId, isOpen, onClose, onChanged }: PrevisionHistoryViewProps) {
  const [previsions, setPrevisions] = useState<PrevisionResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistorique();
    }
  }, [isOpen, projetId]);

  async function loadHistorique() {
    try {
      setLoading(true);
      const data = await getHistorique(projetId);
      setPrevisions(data);
    } catch (err: any) {
      toast.error(err.message || 'Impossible de charger l\'historique des prévisions.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(prevision: PrevisionResponseDTO) {
    try {
      setDownloadingId(prevision.id);
      await telechargerPrevision(prevision.id);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du téléchargement.');
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete(prevision: PrevisionResponseDTO) {
    const confirmed = window.confirm(
      `Supprimer la prévision "${prevision.nomFichier}" ?\n\nSi elle est active, ses affectations, tâches et anomalies V2 liées à la période seront supprimées.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(prevision.id);
      await supprimerPrevision(prevision.id);
      toast.success('Prévision supprimée.');
      await loadHistorique();
      onChanged?.();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de supprimer la prévision.');
    } finally {
      setDeletingId(null);
    }
  }

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} maxWidth="720px" accentColor={C.purple}>
      <ModalHeader
        title="Historique des prévisions"
        subtitle={`Projet #${projetId} — Toutes les prévisions importées`}
        onClose={onClose}
      />
      <div style={{ padding: '16px 20px' }}>
        {/* Loading state */}
        {loading && (
          <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Loader2 style={{ width: '28px', height: '28px', color: C.purple, animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '12px', color: C.textMuted }}>Chargement de l'historique…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && previsions.length === 0 && (
          <EmptyState
            icon={History}
            title="Aucune prévision"
            subtitle="Aucune prévision n'a encore été importée pour ce projet."
          />
        )}

        {/* Prevision list */}
        {!loading && previsions.length > 0 && (
          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Fichier</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Période</th>
                  <th style={thStyle}>Date d'import</th>
                  <th style={thStyle}>Statut</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {previsions.map((prevision) => (
                  <tr
                    key={prevision.id}
                    style={{ transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Nom fichier */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: R,
                          backgroundColor: `${C.green}12`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <FileSpreadsheet style={{ width: '14px', height: '14px', color: C.green }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: C.text, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {prevision.nomFichier}
                        </span>
                      </div>
                    </td>

                    {/* Type prévision */}
                    <td style={tdStyle}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: C.purple }}>
                        {formatTypePrevision(prevision.typePrevision)}
                      </span>
                    </td>

                    {/* Période */}
                    <td style={tdStyle}>
                      <span style={{ fontSize: '11px', color: C.textSecondary }}>
                        {formatDate(prevision.periodeDebut)} — {formatDate(prevision.periodeFin)}
                      </span>
                    </td>

                    {/* Date d'import */}
                    <td style={tdStyle}>
                      <span style={{ fontSize: '11px', color: C.textMuted }}>
                        {formatDateTime(prevision.dateImport)}
                      </span>
                    </td>

                    {/* Statut badge */}
                    <td style={tdStyle}>
                      {prevision.active ? (
                        <DsBadge color={C.green} bg={`${C.green}14`} border={`${C.green}30`}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: C.green, display: 'inline-block' }} />{' '}
                          {'Active'}
                        </DsBadge>
                      ) : (
                        <DsBadge color={C.textMuted} bg="#F3F4F6" border={C.border}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: C.textMuted, display: 'inline-block' }} />{' '}
                          {'Archivée'}
                        </DsBadge>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => handleDownload(prevision)}
                        disabled={downloadingId === prevision.id || deletingId === prevision.id}
                        title={`Télécharger ${prevision.nomFichier}`}
                        style={{
                          width: '30px', height: '30px', borderRadius: R,
                          border: `1px solid ${C.border}`,
                          backgroundColor: '#fff',
                          cursor: downloadingId === prevision.id ? 'not-allowed' : 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          if (downloadingId !== prevision.id) {
                            e.currentTarget.style.backgroundColor = `${C.blue}10`;
                            e.currentTarget.style.borderColor = C.blue;
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '#fff';
                          e.currentTarget.style.borderColor = C.border;
                        }}
                      >
                        {downloadingId === prevision.id ? (
                          <Loader2 style={{ width: '14px', height: '14px', color: C.blue, animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Download style={{ width: '14px', height: '14px', color: C.blue }} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(prevision)}
                        disabled={deletingId === prevision.id || downloadingId === prevision.id}
                        title={`Supprimer ${prevision.nomFichier}`}
                        style={{
                          width: '30px', height: '30px', borderRadius: R,
                          border: `1px solid ${C.red}30`,
                          backgroundColor: '#fff',
                          cursor: deletingId === prevision.id ? 'not-allowed' : 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                          opacity: deletingId === prevision.id ? 0.6 : 1,
                        }}
                        onMouseEnter={e => {
                          if (deletingId !== prevision.id && downloadingId !== prevision.id) {
                            e.currentTarget.style.backgroundColor = '#FEF2F2';
                            e.currentTarget.style.borderColor = C.red;
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '#fff';
                          e.currentTarget.style.borderColor = `${C.red}30`;
                        }}
                      >
                        {deletingId === prevision.id ? (
                          <Loader2 style={{ width: '14px', height: '14px', color: C.red, animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Trash2 style={{ width: '14px', height: '14px', color: C.red }} />
                        )}
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        {!loading && previsions.length > 0 && (
          <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '12px', textAlign: 'right' }}>
            {previsions.length} prévision{previsions.length > 1 ? 's' : ''} au total
          </p>
        )}
      </div>
    </Modal>
  );
}
