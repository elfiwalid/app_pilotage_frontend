/**
 * PrevisionStatsCard — Displays statistics for a given prevision.
 *
 * Fetches `getStatistiques(previsionId)` whenever `previsionId` changes
 * (and is not null). Renders nothing when `previsionId` is null,
 * skeleton placeholders while loading, an error message on failure,
 * or a card with four stats:
 *  - Collaborateurs (nombreCollaborateurs)
 *  - Mois couverts (nombreMois)
 *  - Type (typePrevision)
 *  - Date d'import (formatted)
 *
 * Requirements: 8.1, 8.2
 */

import { useEffect, useState } from 'react';
import { CalendarDays, Clock, Tag, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

import {
  getStatistiques,
  type PrevisionStatsDTO,
} from '../../services/previsionService';

/* ─── Props ─────────────────────────────────────── */
interface PrevisionStatsCardProps {
  readonly previsionId: number | null;
}

/* ─── Helpers ───────────────────────────────────── */
function formatStatsDate(isoString: string): string {
  try {
    return format(new Date(isoString), 'dd MMM yyyy', { locale: fr });
  } catch {
    return isoString;
  }
}

function formatTypePrevision(type: string): string {
  return type === 'TRIMESTRIELLE' ? 'Trimestrielle' : 'Annuelle';
}

/* ─── Component ─────────────────────────────────── */
export function PrevisionStatsCard({ previsionId }: PrevisionStatsCardProps) {
  const [stats, setStats] = useState<PrevisionStatsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (previsionId === null) {
      setStats(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchStats(id: number): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const data = await getStatistiques(id);
        if (!cancelled) {
          setStats(data);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des statistiques.';
        setError(message);
        setStats(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats(previsionId);
    return () => {
      cancelled = true;
    };
  }, [previsionId]);

  /* ─── No prevision selected ─── */
  if (previsionId === null) {
    return null;
  }

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  /* ─── Error State ─── */
  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  /* ─── No stats available ─── */
  if (!stats) {
    return null;
  }

  /* ─── Stats Display ─── */
  const statItems = [
    {
      key: 'collaborateurs',
      Icon: Users,
      label: 'Collaborateurs',
      value: String(stats.nombreCollaborateurs),
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      key: 'mois',
      Icon: CalendarDays,
      label: 'Mois couverts',
      value: String(stats.nombreMois),
      tone: 'bg-purple-50 text-purple-600',
    },
    {
      key: 'type',
      Icon: Tag,
      label: 'Type',
      value: formatTypePrevision(stats.typePrevision),
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      key: 'date',
      Icon: Clock,
      label: "Date d'import",
      value: formatStatsDate(stats.dateImport),
      tone: 'bg-emerald-50 text-emerald-600',
    },
  ] as const;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-sm font-semibold">
          Statistiques de la prévision
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
        {statItems.map(({ key, Icon, label, value, tone }) => (
          <div key={key} className="flex items-start gap-3">
            <div className={`flex size-8 items-center justify-center rounded-md shrink-0 ${tone}`}>
              <Icon className="size-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
