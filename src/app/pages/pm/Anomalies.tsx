import { useState, useEffect } from 'react';
import { AlertTriangle, Search, TrendingUp, TrendingDown, UserX, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { C, R, PageHeader, cardStyle } from '../../components/ui/design-system';
import { fetchAnomaliesV2ParChef, fetchPeriodesChef, type AnomalieV2DTO } from '../../services/anomalieV2Service';

/* ─── CONFIG ─── */
const TYPE_CFG: Record<string, { label: string; bg: string; text: string; color: string; icon: any }> = {
  CONFLIT: { label: 'Conflit', bg: '#FEF2F2', text: '#B91C1C', color: C.red, icon: AlertTriangle },
  SURCHARGE: { label: 'Surcharge', bg: '#FFF7ED', text: '#92400E', color: '#F59E0B', icon: TrendingUp },
  SOUS_CHARGE: { label: 'Sous-charge', bg: '#EFF6FF', text: '#1D4ED8', color: C.blue, icon: TrendingDown },
  NON_STAFFE: { label: 'Non staffé', bg: '#F3F4F6', text: '#374151', color: '#6B7280', icon: UserX },
};

const STATUT_CFG: Record<string, { label: string; bg: string; text: string }> = {
  DETECTEE: { label: 'Détectée', bg: '#FEF2F2', text: '#B91C1C' },
  EN_COURS_TRAITEMENT: { label: 'En cours', bg: '#FFF7ED', text: '#92400E' },
  RESOLUE: { label: 'Résolue', bg: '#ECFDF5', text: '#065F46' },
  IGNOREE: { label: 'Ignorée', bg: '#F3F4F6', text: '#6B7280' },
};

const MOIS_LABELS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export function PmAnomalies() {
  const [annee, setAnnee] = useState<number | null>(null);
  const [mois, setMois] = useState<number | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalieV2DTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [periodes, setPeriodes] = useState<{ annee: number; mois: number }[]>([]);
  const [periodesLoaded, setPeriodesLoaded] = useState(false);

  // Charger les périodes disponibles au montage
  useEffect(() => {
    (async () => {
      try {
        const p = await fetchPeriodesChef();
        setPeriodes(p);
        // Auto-sélectionner la période la plus récente
        if (p.length > 0) {
          setAnnee(p[0].annee);
          setMois(p[0].mois);
        } else {
          // Pas de périodes, montrer le mois courant
          const now = new Date();
          setAnnee(now.getFullYear());
          setMois(now.getMonth() + 1);
        }
      } catch {
        const now = new Date();
        setAnnee(now.getFullYear());
        setMois(now.getMonth() + 1);
      } finally {
        setPeriodesLoaded(true);
      }
    })();
  }, []);

  // Charger les anomalies quand la période change
  useEffect(() => {
    if (annee === null || mois === null) return;
    loadAnomalies();
  }, [annee, mois, filterType]);

  const loadAnomalies = async () => {
    if (annee === null || mois === null) return;
    setLoading(true);
    try {
      setAnomalies(await fetchAnomaliesV2ParChef(annee, mois));
    } catch {
      setAnomalies([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = anomalies.filter(a => {
    if (filterType !== 'all' && a.typeAnomalie !== filterType) return false;
    if (!search) return true;
    return (a.collaborateurNom || '').toLowerCase().includes(search.toLowerCase()) ||
           (a.projetsConcernes || '').toLowerCase().includes(search.toLowerCase());
  });

  // KPIs
  const conflits = anomalies.filter(a => a.typeAnomalie === 'CONFLIT').length;
  const surcharges = anomalies.filter(a => a.typeAnomalie === 'SURCHARGE').length;
  const sousCharges = anomalies.filter(a => a.typeAnomalie === 'SOUS_CHARGE').length;
  const nonStaffes = anomalies.filter(a => a.typeAnomalie === 'NON_STAFFE').length;

  if (!periodesLoaded || loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '28px', height: '28px', color: C.blue, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <PageHeader title="Anomalies de Staffing" subtitle={`${MOIS_LABELS[mois || 1]} ${annee} · ${anomalies.length} anomalie(s) détectée(s)`} />

      {/* KPIs */}
      {anomalies.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { l: 'Conflits', v: conflits, c: C.red, icon: AlertTriangle },
            { l: 'Surcharges', v: surcharges, c: '#F59E0B', icon: TrendingUp },
            { l: 'Sous-charges', v: sousCharges, c: C.blue, icon: TrendingDown },
            { l: 'Non staffés', v: nonStaffes, c: '#6B7280', icon: UserX },
          ].map(k => (
            <div key={k.l} style={{ ...cardStyle, padding: '8px 14px', borderLeft: `3px solid ${k.c}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <k.icon style={{ width: '14px', height: '14px', color: k.c }} />
              <div>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: k.c, lineHeight: 1 }}>{k.v}</p>
                <p style={{ fontSize: '9px', color: C.textMuted }}>{k.l}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Period + Filters */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {periodes.length > 0 ? (
          <select
            value={`${annee}-${mois}`}
            onChange={e => {
              const [a, m] = e.target.value.split('-').map(Number);
              setAnnee(a);
              setMois(m);
            }}
            style={{ padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', cursor: 'pointer' }}
          >
            {periodes.map(p => (
              <option key={`${p.annee}-${p.mois}`} value={`${p.annee}-${p.mois}`}>
                {MOIS_LABELS[p.mois]} {p.annee}
              </option>
            ))}
          </select>
        ) : (
          <>
            <select value={mois || 1} onChange={e => setMois(Number(e.target.value))}
              style={{ padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', cursor: 'pointer' }}>
              {MOIS_LABELS.slice(1).map((l, i) => <option key={i + 1} value={i + 1}>{l}</option>)}
            </select>
            <select value={annee || 2026} onChange={e => setAnnee(Number(e.target.value))}
              style={{ padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', cursor: 'pointer' }}>
              {[2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </>
        )}
        <div style={{ position: 'relative', flex: 1, maxWidth: '240px' }}>
          <Search style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: C.textMuted, pointerEvents: 'none' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            style={{ width: '100%', paddingLeft: '28px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none' }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', cursor: 'pointer' }}>
          <option value="all">Tous types</option>
          <option value="CONFLIT">Conflit</option>
          <option value="SURCHARGE">Surcharge</option>
          <option value="SOUS_CHARGE">Sous-charge</option>
          <option value="NON_STAFFE">Non staffé</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
          <CheckCircle style={{ width: '36px', height: '36px', color: C.green, margin: '0 auto 10px' }} />
          <p style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>Aucune anomalie</p>
          <p style={{ fontSize: '12px', color: C.textMuted }}>
            {anomalies.length === 0
              ? 'Aucune anomalie détectée pour vos projets sur cette période. Importez un fichier V2 pour déclencher la détection automatique.'
              : 'Aucune anomalie ne correspond aux filtres.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(a => {
            const tc = TYPE_CFG[a.typeAnomalie] || TYPE_CFG.CONFLIT;
            const sc = STATUT_CFG[a.statut] || STATUT_CFG.DETECTEE;
            const Icon = tc.icon;
            const chargeColor = a.tauxCharge > 100 ? C.red : (a.tauxCharge >= 80 ? C.green : C.blue);
            return (
              <div key={a.id} style={{ ...cardStyle, borderLeft: `4px solid ${tc.color}` }}>
                <div style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: R, backgroundColor: `${tc.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: '15px', height: '15px', color: tc.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{a.collaborateurNom || a.numeroEmploye}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: tc.bg, color: tc.text }}>{tc.label}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text }}>{sc.label}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: C.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description}</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '3px' }}>
                      <span style={{ fontSize: '10px', color: C.textMuted }}>#{a.numeroEmploye}</span>
                      <span style={{ fontSize: '10px', color: C.textMuted }}>{a.totalJoursDemandes}/{a.capaciteMensuelle}j</span>
                      {a.joursEnConflit > 0 && <span style={{ fontSize: '10px', color: C.red, fontWeight: 600 }}>{a.joursEnConflit}j conflit</span>}
                    </div>
                    <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>Projets : {a.projetsConcernes || '—'}</p>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: chargeColor }}>{a.tauxCharge}%</p>
                    <p style={{ fontSize: '9px', color: C.textMuted }}>charge</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
