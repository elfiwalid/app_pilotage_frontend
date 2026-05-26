/**
 * PrevisionActiveCard — Displays the active prevision for a project.
 *
 * Fetches the active prevision via `getPrevisionActive(projetId)` on mount
 * and whenever `refreshTrigger` changes. Renders one of three states:
 *  - Loading: skeleton placeholders
 *  - Empty (no active prevision): message + "Importer une prévision" button
 *  - Active: file name, type (badge), period range, date d'import
 *
 * Optionally notifies parents of the resolved active prevision (or null) via
 * `onActivePrevisionLoaded`, allowing them to wire up dependent components
 * such as the statistics card.
 *
 * Requirements: 8.1, 8.2
 */

import { useEffect, useState } from 'react';
import { Calendar, Clock, FileSpreadsheet, Tag, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

import {
  getPrevisionActive,
  type PrevisionResponseDTO,
} from '../../services/previsionService';

/* ─── Props ─────────────────────────────────────── */
interface PrevisionActiveCardProps {
  readonly projetId: number;
  readonly onImportClick: () => void;
  readonly refreshTrigger?: number;
  readonly onActivePrevisionLoaded?: (prevision: PrevisionResponseDTO | null) => void;
}

/* ─── Helpers ───────────────────────────────────── */
function formatDateTime(isoDate: string): string {
  try {
    return format(new Date(isoDate), "dd MMM yyyy 'à' HH:mm", { locale: fr });
  } catch {
    return isoDate;
  }
}

function formatDate(isoDate: string): string {
  try {
    return format(new Date(isoDate), 'dd MMM yyyy', { locale: fr });
  } catch {
    return isoDate;
  }
}

function formatTypePrevision(type: string): string {
  return type === 'TRIMESTRIELLE' ? 'Trimestrielle' : 'Annuelle';
}

/* ─── Component ─────────────────────────────────── */
export function PrevisionActiveCard({
  projetId,
  onImportClick,
  refreshTrigger,
  onActivePrevisionLoaded,
}: PrevisionActiveCardProps) {
  const [prevision, setPrevision] = useState<PrevisionResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchActive(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const data = await getPrevisionActive(projetId);
        if (cancelled) return;
        setPrevision(data);
        onActivePrevisionLoaded?.(data);
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error
          ? err.message
          : 'Erreur lors du chargement de la prévision active.';
        setError(message);
        onActivePrevisionLoaded?.(null);
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
    // onActivePrevisionLoaded is intentionally excluded to avoid re-fetching
    // when the parent passes an inline callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projetId, refreshTrigger]);

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
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

  /* ─── Empty State ─── */
  if (!prevision) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-md bg-muted">
            <FileSpreadsheet className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Aucune prévision active pour ce projet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Importez un fichier Excel pour démarrer la prévision.
            </p>
          </div>
          <Button onClick={onImportClick} size="sm">
            <Upload className="size-3.5" />
            Importer une prévision
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ─── Active Prevision Display ─── */
  const periode = `${formatDate(prevision.periodeDebut)} → ${formatDate(prevision.periodeFin)}`;

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex size-9 items-center justify-center rounded-md bg-emerald-50 shrink-0">
              <FileSpreadsheet className="size-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-sm font-semibold">
                {prevision.nomFichier}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Prévision active</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
        {/* Type */}
        <div className="flex items-start gap-2">
          <Tag className="mt-0.5 size-3.5 text-muted-foreground" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Type
            </p>
            <p className="text-xs font-semibold">
              {formatTypePrevision(prevision.typePrevision)}
            </p>
          </div>
        </div>

        {/* Période */}
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 size-3.5 text-muted-foreground" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Période
            </p>
            <p className="text-xs font-semibold">{periode}</p>
          </div>
        </div>

        {/* Date d'import */}
        <div className="flex items-start gap-2 sm:col-span-2">
          <Clock className="mt-0.5 size-3.5 text-muted-foreground" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Date d'import
            </p>
            <p className="text-xs font-semibold">{formatDateTime(prevision.dateImport)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
