/**
 * PrevisionStatsCard — Displays statistics for a prevision.
 *
 * Shows: nombre de collaborateurs, nombre de mois, type, date d'import.
 * Fetches stats from the API using the previsionId.
 *
 * Requirements: 8.1, 8.2
 */

import { useState, useEffect } from 'react';
import { Users, CalendarDays, Tag, Clock } from 'lucide-react';
import { C, R, cardStyle } from '../ui/design-system';
import {
  getStatistiques,
  type PrevisionStatsDTO,
} from '../../services/previsionService';

interface PrevisionStatsCardProps {
  previsionId: number | null;
  refreshTrigger?: number;
}

export function PrevisionStatsCard({
  previsionId,
  refreshTrigger,
}: PrevisionStatsCardProps) {
  const [stats, setStats] = useState<PrevisionStatsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!previsionId) {
      setStats(null);
      return;
    }

    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const data = await getStatistiques(previsionId);
        if (!cancelled) {
          setStats(data);
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

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [previsionId, refreshTrigger]);

  /* ─── No prevision selected ─── */
  if (!previsionId) {
    return null;
  }

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
          <p style={{ fontSize: '12px', color: C.textMuted }}>
            Chargement des statistiques…
          </p>
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

  /* ─── No stats available ─── */
  if (!stats) {
    return null;
  }

  /* ─── Stats Display ─── */
  const statItems = [
    {
      icon: Users,
      label: 'Collaborateurs',
      value: String(stats.nombreCollaborateurs),
      accent: C.blue,
    },
    {
      icon: CalendarDays,
      label: 'Mois couverts',
      value: String(stats.nombreMois),
      accent: C.purple,
    },
    {
      icon: Tag,
      label: 'Type',
      value: stats.typePrevision,
      accent: C.orange,
    },
    {
      icon: Clock,
      label: "Date d'import",
      value: formatStatsDate(stats.dateImport),
      accent: C.green,
    },
  ];

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${C.borderLight}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '3px',
            height: '16px',
            backgroundColor: C.blue,
            borderRadius: '2px',
            flexShrink: 0,
          }}
        />
        <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>
          Statistiques de la prévision
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
        }}
      >
        {statItems.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: R,
                backgroundColor: `${item.accent}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <item.icon
                style={{ width: '14px', height: '14px', color: item.accent }}
              />
            </div>
            <div>
              <p
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: C.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '2px',
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function formatStatsDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
