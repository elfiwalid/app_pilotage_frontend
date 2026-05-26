/**
 * ActivePrevisionCard — Displays the active prevision for a project.
 *
 * Shows prevision details (nomFichier, typePrevision, période, dateImport)
 * or an empty state with an "Importer une prévision" button if none exists.
 *
 * Requirements: 8.1, 8.2
 */

import { useState, useEffect } from 'react';
import { FileSpreadsheet, Upload, Calendar, Tag, Clock } from 'lucide-react';
import { C, R, cardStyle, BtnPrimary, Badge } from '../ui/design-system';
import {
  getPrevisionActive,
  type PrevisionResponseDTO,
} from '../../services/previsionService';

interface ActivePrevisionCardProps {
  projetId: number;
  onImportClick: () => void;
  refreshTrigger?: number;
}

export function ActivePrevisionCard({
  projetId,
  onImportClick,
  refreshTrigger,
}: ActivePrevisionCardProps) {
  const [prevision, setPrevision] = useState<PrevisionResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchActive() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPrevisionActive(projetId);
        if (!cancelled) {
          setPrevision(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erreur lors du chargement'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchActive();
    return () => {
      cancelled = true;
    };
  }, [projetId, refreshTrigger]);

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div style={cardStyle}>
        <div
          style={{
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{ fontSize: '12px', color: C.textMuted }}>Chargement…</p>
        </div>
      </div>
    );
  }

  /* ─── Error State ─── */
  if (error) {
    return (
      <div style={cardStyle}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: C.red }}>{error}</p>
        </div>
      </div>
    );
  }

  /* ─── Empty State ─── */
  if (!prevision) {
    return (
      <div style={cardStyle}>
        <div
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: R,
              backgroundColor: `${C.purple}10`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileSpreadsheet
              style={{ width: '22px', height: '22px', color: C.purple }}
            />
          </div>
          <div>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: C.text,
                marginBottom: '4px',
              }}
            >
              Aucune prévision active
            </p>
            <p style={{ fontSize: '12px', color: C.textMuted }}>
              Importez un fichier Excel pour démarrer la prévision de ce projet.
            </p>
          </div>
          <BtnPrimary onClick={onImportClick}>
            <Upload style={{ width: '13px', height: '13px' }} />
            Importer une prévision
          </BtnPrimary>
        </div>
      </div>
    );
  }

  /* ─── Active Prevision Display ─── */
  const formattedDate = formatDate(prevision.dateImport);
  const periode = `${formatShortDate(prevision.periodeDebut)} → ${formatShortDate(prevision.periodeFin)}`;

  return (
    <div style={{ ...cardStyle, borderLeft: `3px solid ${C.green}` }}>
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${C.borderLight}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: R,
              backgroundColor: `${C.green}12`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileSpreadsheet
              style={{ width: '15px', height: '15px', color: C.green }}
            />
          </div>
          <div>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: C.text,
                lineHeight: 1.2,
              }}
            >
              {prevision.nomFichier}
            </p>
            <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>
              Prévision active
            </p>
          </div>
        </div>
        <Badge color={C.green}>Active</Badge>
      </div>

      {/* Details */}
      <div
        style={{
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        {/* Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag
            style={{ width: '13px', height: '13px', color: C.textMuted }}
          />
          <div>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: C.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Type
            </p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>
              {prevision.typePrevision}
            </p>
          </div>
        </div>

        {/* Période */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar
            style={{ width: '13px', height: '13px', color: C.textMuted }}
          />
          <div>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: C.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Période
            </p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>
              {periode}
            </p>
          </div>
        </div>

        {/* Date d'import */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            gridColumn: '1 / -1',
          }}
        >
          <Clock
            style={{ width: '13px', height: '13px', color: C.textMuted }}
          />
          <div>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: C.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Date d'import
            </p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>
              {formattedDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function formatShortDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
