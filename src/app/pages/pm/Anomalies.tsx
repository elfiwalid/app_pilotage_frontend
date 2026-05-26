import { useState, useEffect } from 'react';
import { AlertTriangle, Search, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  C, R, PageHeader, BtnPrimary,
  cardStyle, thStyle, tdStyle,
} from '../../components/ui/design-system';
import {
  fetchAnomalies,
  resoudreAnomalie,
  type AnomalieResponseDTO,
} from '../../services/anomalieService';

/* ─── TYPE BADGE CONFIG ─────────────────────────── */
const TYPE_BADGE: Record<string, { label: string; bg: string; text: string; border: string }> = {
  SURCHARGE: {
    label: 'Surcharge',
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FECACA',
  },
  CONFLIT_AFFECTATION: {
    label: 'Conflit d\'affectation',
    bg: '#FFF7ED',
    text: '#92400E',
    border: '#FDBA74',
  },
  DISPONIBILITE_INSUFFISANTE: {
    label: 'Disponibilité insuffisante',
    bg: '#FEFCE8',
    text: '#854D0E',
    border: '#FDE047',
  },
};

const STATUT_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  OUVERTE: { label: 'Ouverte', bg: '#FEF2F2', text: '#B91C1C' },
  RESOLUE: { label: 'Résolue', bg: '#ECFDF5', text: '#065F46' },
};

/* ─── HELPERS ───────────────────────────────────── */
function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return isoDate;
  }
}

/* ─── MAIN ─────────────────────────────────────── */
export function PmAnomalies() {
  const [anomalies, setAnomalies] = useState<AnomalieResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('OUVERTE');
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  /* ─── Fetch anomalies from API ─── */
  const loadAnomalies = async () => {
    setLoading(true);
    setError(null);
    try {
      const typeParam = filterType === 'all' ? undefined : filterType;
      const statutParam = filterStatut === 'all' ? undefined : filterStatut;
      const data = await fetchAnomalies(typeParam, statutParam);
      setAnomalies(data);
    } catch (err: any) {
      const msg = err.message || 'Impossible de charger les anomalies.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnomalies();
  }, [filterType, filterStatut]);

  /* ─── Résoudre une anomalie ─── */
  const handleResoudre = async (id: number) => {
    setResolvingId(id);
    try {
      await resoudreAnomalie(id);
      toast.success('Anomalie marquée comme résolue.');
      await loadAnomalies();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la résolution.');
    } finally {
      setResolvingId(null);
    }
  };

  /* ─── Client-side search filter ─── */
  const filtered = anomalies.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.collaborateurNomComplet.toLowerCase().includes(q) ||
      a.projetNom.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  });

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 style={{ width: '32px', height: '32px', color: C.red, animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: C.textMuted }}>Chargement des anomalies…</p>
        </div>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <AlertTriangle style={{ width: '32px', height: '32px', color: C.red }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>Erreur de chargement</p>
          <p style={{ fontSize: '12px', color: C.textSecondary, maxWidth: '320px' }}>{error}</p>
          <BtnPrimary onClick={loadAnomalies}>
            <RefreshCw style={{ width: '12px', height: '12px' }} />Réessayer
          </BtnPrimary>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Header ── */}
      <PageHeader
        title="Anomalies de Staffing"
        subtitle={`${anomalies.length} anomalie${anomalies.length > 1 ? 's' : ''} détectée${anomalies.length > 1 ? 's' : ''}`}
      />

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
          <Search style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: C.textMuted, pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            style={{
              width: '100%', paddingLeft: '28px', paddingRight: '10px',
              paddingTop: '6px', paddingBottom: '6px', fontSize: '12px',
              border: `1px solid ${C.border}`, borderRadius: R,
              backgroundColor: '#fff', outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = C.blue)}
            onBlur={e => (e.target.style.borderColor = C.border)}
          />
        </div>

        {/* Type filter */}
        <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden', backgroundColor: '#fff' }}>
          {[
            ['all', 'Tous types'],
            ['SURCHARGE', 'Surcharge'],
            ['CONFLIT_AFFECTATION', 'Conflit'],
            ['DISPONIBILITE_INSUFFISANTE', 'Sous-charge'],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilterType(v)}
              style={{
                padding: '5px 10px', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', border: 'none',
                backgroundColor: filterType === v ? C.red : '#fff',
                color: filterType === v ? '#fff' : C.textMuted,
                fontFamily: 'Inter',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Statut filter */}
        <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden', backgroundColor: '#fff' }}>
          {[
            ['all', 'Tous statuts'],
            ['OUVERTE', 'Ouverte'],
            ['RESOLUE', 'Résolue'],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilterStatut(v)}
              style={{
                padding: '5px 10px', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', border: 'none',
                backgroundColor: filterStatut === v ? C.purple : '#fff',
                color: filterStatut === v ? '#fff' : C.textMuted,
                fontFamily: 'Inter',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={cardStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Collaborateur', 'Type d\'anomalie', 'Description', 'Date de détection', 'Statut', 'Projet', 'Actions'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: C.textMuted }}>Aucune anomalie trouvée.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((a, idx) => {
                  const typeCfg = TYPE_BADGE[a.typeAnomalie] || TYPE_BADGE.SURCHARGE;
                  const statutCfg = STATUT_BADGE[a.statut] || STATUT_BADGE.OUVERTE;
                  const isResolving = resolvingId === a.id;

                  return (
                    <tr
                      key={a.id}
                      style={{ backgroundColor: 'transparent', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Collaborateur */}
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>
                          {a.collaborateurNomComplet}
                        </span>
                      </td>

                      {/* Type d'anomalie */}
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700,
                          padding: '2px 7px', borderRadius: '3px',
                          backgroundColor: typeCfg.bg,
                          color: typeCfg.text,
                          border: `1px solid ${typeCfg.border}`,
                        }}>
                          {typeCfg.label}
                        </span>
                      </td>

                      {/* Description */}
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none', maxWidth: '280px' }}>
                        <span style={{ fontSize: '11px', color: C.textSecondary, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.description}
                        </span>
                      </td>

                      {/* Date de détection */}
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <span style={{ fontSize: '11px', color: C.textMuted }}>
                          {formatDate(a.dateDetection)}
                        </span>
                      </td>

                      {/* Statut */}
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700,
                          padding: '2px 7px', borderRadius: '3px',
                          backgroundColor: statutCfg.bg,
                          color: statutCfg.text,
                        }}>
                          {statutCfg.label}
                        </span>
                      </td>

                      {/* Projet */}
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: C.text }}>
                          {a.projetNom}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        {a.statut === 'OUVERTE' ? (
                          <button
                            onClick={() => handleResoudre(a.id)}
                            disabled={isResolving}
                            style={{
                              padding: '4px 10px', borderRadius: R,
                              border: 'none',
                              backgroundColor: isResolving ? '#D1D5DB' : C.green,
                              color: '#fff',
                              cursor: isResolving ? 'not-allowed' : 'pointer',
                              fontSize: '10px', fontWeight: 700,
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                            }}
                            onMouseEnter={e => { if (!isResolving) e.currentTarget.style.opacity = '0.9'; }}
                            onMouseLeave={e => { if (!isResolving) e.currentTarget.style.opacity = '1'; }}
                          >
                            {isResolving ? (
                              <Loader2 style={{ width: '10px', height: '10px', animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <CheckCircle style={{ width: '10px', height: '10px' }} />
                            )}
                            Résoudre
                          </button>
                        ) : (
                          <span style={{ fontSize: '10px', color: C.green, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle style={{ width: '10px', height: '10px' }} />Résolue
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
