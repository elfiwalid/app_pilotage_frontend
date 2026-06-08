import { useState, useEffect } from 'react';
import { Briefcase, Users, AlertTriangle, TrendingUp, ArrowUpRight, BarChart2, DollarSign, Activity, Calendar, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { C, S, R, PageHeader, SectionCard, KpiCard, cardStyle } from '../../components/ui/design-system';
import { useNavigate } from 'react-router';
import {
  fetchPmDashboard,
  DashboardChefProjetDTO,
  AnomalieResumeeDTO,
  ProjetResumeeDTO,
  MoisAnomalieDTO,
  MoisCollabDTO,
} from '../../services/pmDashboardService';

/* ─── CONSTANTS ────────────────────────────────────── */
const MOIS_OPTIONS = [
  { value: 1,  label: 'Janvier' },   { value: 2,  label: 'Février' },
  { value: 3,  label: 'Mars' },      { value: 4,  label: 'Avril' },
  { value: 5,  label: 'Mai' },       { value: 6,  label: 'Juin' },
  { value: 7,  label: 'Juillet' },   { value: 8,  label: 'Août' },
  { value: 9,  label: 'Septembre' }, { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },  { value: 12, label: 'Décembre' },
];

const ANNEE_OPTIONS = [2024, 2025, 2026, 2027];

/* ─── TOOLTIP ──────────────────────────────────────── */
const TIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, padding: '8px 12px', boxShadow: S.elevated, fontSize: '11px' }}>
      <p style={{ fontWeight: 700, color: C.text, marginBottom: '4px' }}>{label}</p>
      {payload.map((e: any, i: number) => <p key={i} style={{ color: e.stroke || e.fill, margin: '1px 0' }}>{e.name}: <strong>{e.value}</strong></p>)}
    </div>
  );
};

/* ─── COLORS ───────────────────────────────────────── */
const SEV_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  SURCHARGE:   { bg: '#FEF2F2', text: '#B91C1C', bar: C.red },
  CONFLIT:     { bg: '#FFF7ED', text: '#92400E', bar: '#F59E0B' },
  SOUS_CHARGE: { bg: '#EFF6FF', text: '#1D4ED8', bar: C.blue },
  NON_STAFFE:  { bg: '#F5F3FF', text: '#6D28D9', bar: '#8B5CF6' },
};

const TYPE_LABELS: Record<string, string> = {
  SURCHARGE: 'Surcharge', CONFLIT: 'Conflit', SOUS_CHARGE: 'Sous-charge', NON_STAFFE: 'Non staffé',
};

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  EN_COURS: { bg: '#EFF6FF', text: '#1D4ED8', dot: C.blue, label: 'En cours' },
  PLANIFIE: { bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B', label: 'Planifié' },
  TERMINE:  { bg: '#ECFDF5', text: '#065F46', dot: C.green, label: 'Terminé' },
  SUSPENDU: { bg: '#F5F3FF', text: '#6D28D9', dot: '#8B5CF6', label: 'Suspendu' },
};

/* ─── SELECT STYLE ─────────────────────────────────── */
const selectStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 600, color: C.text,
  border: `1px solid ${C.border}`, borderRadius: R,
  padding: '5px 8px', backgroundColor: C.white,
  cursor: 'pointer', outline: 'none',
};

/* ─── COMPONENT ────────────────────────────────────── */
export function PmDashboard() {
  const navigate = useNavigate();

  /* ── Filtre période ── */
  const now = new Date();
  const [selAnnee, setSelAnnee] = useState(now.getFullYear());
  const [selMois,  setSelMois]  = useState(now.getMonth() + 1);

  /* ── Data ── */
  const [data, setData] = useState<DashboardChefProjetDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchPmDashboard(selAnnee, selMois);
      setData(d);
    } catch (e: any) {
      setError(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selAnnee, selMois]);

  /* ── Derived helpers ── */
  const moisLabel = MOIS_OPTIONS.find(m => m.value === selMois)?.label || '';
  const periodeLabel = `${moisLabel} ${selAnnee}`;

  /* ── KPIs ── */
  const kpiData = data ? [
    { title: 'Projets Actifs', value: String(data.projetsActifs), change: `+${data.projetsTermines}`, trendPositive: true, icon: Briefcase, accent: C.blue, sub: `sur ${data.totalProjets} au total` },
    { title: 'Collaborateurs', value: String(data.totalCollaborateurs), change: data.totalCollaborateurs > 0 ? 'actifs' : '—', trendPositive: data.totalCollaborateurs > 0, icon: Users, accent: C.purple, sub: 'assignés à mes projets' },
    { title: 'Anomalies', value: String(data.totalAnomaliesMoisCourant), change: `${data.anomaliesCritiques} critiques`, trendPositive: data.anomaliesCritiques === 0, icon: AlertTriangle, accent: C.red, sub: `${data.anomaliesActives} active${data.anomaliesActives > 1 ? 's' : ''}` },
    { title: 'Performance', value: data.performanceProjets.length > 0 ? `${Math.round(data.performanceProjets.filter(p => p.statut === 'EN_COURS').reduce((s, p) => s + p.avancementPct, 0) / Math.max(1, data.performanceProjets.filter(p => p.statut === 'EN_COURS').length))}%` : 'N/A', change: `${data.projetsActifs} projets`, trendPositive: true, icon: TrendingUp, accent: '#F59E0B', sub: 'avancement moyen' },
    { title: 'En Attente', value: String(data.projetsEnAttente), change: `${data.projetsTermines} terminé${data.projetsTermines > 1 ? 's' : ''}`, trendPositive: true, icon: Activity, accent: '#059669', sub: 'planifiés / suspendus' },
  ] : null;

  /* ── Evolution chart: collab + anomalies ── */
  const evolutionData = data ? data.evolutionCollaborateurs.map((c, i) => ({
    month: c.mois,
    collabs: c.collaborateurs,
    anomalies: data.tendanceAnomalies[i]?.total ?? 0,
  })) : [];

  /* ── RENDER ── */
  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Dashboard — Chef de Projet" subtitle={`Suivi de vos projets et gestion des anomalies · ${periodeLabel}`}>
        {/* Filtre Mois / Année */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar style={{ width: '14px', height: '14px', color: C.textMuted }} />
          <select value={selMois} onChange={e => setSelMois(Number(e.target.value))} style={selectStyle}>
            {MOIS_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={selAnnee} onChange={e => setSelAnnee(Number(e.target.value))} style={selectStyle}>
            {ANNEE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '5px 10px', borderRadius: R,
              border: `1px solid ${C.border}`, background: C.white,
              color: C.textMuted, fontSize: '11px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw style={{ width: '12px', height: '12px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </PageHeader>

      {/* Error */}
      {error && (
        <div style={{ padding: '10px 16px', borderRadius: R, backgroundColor: '#FEF2F2', border: `1px solid ${C.red}30`, color: '#B91C1C', fontSize: '12px', fontWeight: 600 }}>
          ⚠ {error} — <span onClick={loadData} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Réessayer</span>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px' }}>
        {loading || !kpiData
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ ...cardStyle, borderTop: `3px solid ${C.borderLight}`, padding: '16px' }}>
                <div style={{ height: 10, width: '50%', backgroundColor: C.borderLight, borderRadius: 3, marginBottom: 10 }} />
                <div style={{ height: 28, width: '35%', backgroundColor: C.borderLight, borderRadius: 3, marginBottom: 6 }} />
                <div style={{ height: 10, width: '70%', backgroundColor: C.borderLight, borderRadius: 3 }} />
              </div>
            ))
          : kpiData.map(k => <KpiCard key={k.title} label={k.title} value={k.value} sub={k.sub} trend={k.change} trendPositive={k.trendPositive} icon={k.icon} accent={k.accent} />)
        }
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Évolution — AreaChart (même design que l'original) */}
        <SectionCard title="Évolution Collaborateurs & Anomalies" subtitle={`6 derniers mois jusqu'à ${periodeLabel}`} accent={C.blue}
          actions={data && <span style={{ fontSize: '11px', fontWeight: 700, color: C.green, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: R, display: 'flex', alignItems: 'center', gap: '3px' }}><ArrowUpRight style={{ width: '11px', height: '11px' }} />{data.totalCollaborateurs} collabs</span>}>
          {loading ? (
            <div style={{ height: 220, backgroundColor: C.borderLight, borderRadius: R }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={evolutionData} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="collabGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.blue} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="anomGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.red} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={C.red} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={C.borderLight} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<TIP />} />
                <Area type="monotone" dataKey="collabs" stroke={C.blue} strokeWidth={2.5} fill="url(#collabGrad)" dot={{ r: 4, fill: C.blue, stroke: C.white, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Collaborateurs" />
                <Area type="monotone" dataKey="anomalies" stroke={C.red} strokeWidth={1.5} strokeDasharray="5 3" fill="url(#anomGrad)" dot={false} name="Anomalies" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Performance des projets (même design que l'original) */}
        <SectionCard title="Performance Projets" subtitle="Avancement vs. équipe" accent={C.purple}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 46, backgroundColor: C.borderLight, borderRadius: R }} />)}
            </div>
          ) : !data || data.performanceProjets.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center' }}>
              <p style={{ color: C.textMuted, fontSize: '12px' }}>Aucun projet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.performanceProjets.map(p => (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{p.nom}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: C.blue, backgroundColor: `${C.blue}10`, padding: '1px 5px', borderRadius: '3px' }}>Avr: {p.avancementPct}%</span>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: C.purple, backgroundColor: `${C.purple}10`, padding: '1px 5px', borderRadius: '3px' }}>👤 {p.collaborateurs}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {[
                      { v: p.avancementPct, c: C.blue, l: 'Avancement' },
                    ].map(row => (
                      <div key={row.l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '9px', color: C.textMuted, width: '70px' }}>{row.l}</span>
                        <div style={{ flex: 1, height: '5px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '2px', backgroundColor: row.c, width: `${row.v}%`, transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Anomalies Récentes */}
        <SectionCard title="Anomalies Récentes" subtitle={data ? `${data.totalAnomaliesMoisCourant} anomalie${data.totalAnomaliesMoisCourant !== 1 ? 's' : ''} — ${periodeLabel}` : '...'} accent={C.red}
          actions={<button onClick={() => navigate('/pm/anomalies')} style={{ fontSize: '11px', fontWeight: 600, color: C.blue, display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer' }}>Voir tout <ArrowUpRight style={{ width: '11px', height: '11px' }} /></button>}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[1,2].map(i => <div key={i} style={{ height: 56, backgroundColor: C.borderLight, borderRadius: R }} />)}
            </div>
          ) : !data || data.anomaliesRecentes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: '28px', marginBottom: 6 }}>✅</p>
              <p style={{ color: C.textMuted, fontSize: '12px', fontWeight: 600 }}>Aucune anomalie pour {periodeLabel}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.anomaliesRecentes.map(a => {
                const sc = SEV_COLORS[a.typeAnomalie] || SEV_COLORS.SURCHARGE;
                return (
                  <div key={a.id} onClick={() => navigate('/pm/anomalies')}
                    style={{ padding: '10px 12px', borderRadius: R, backgroundColor: sc.bg, borderLeft: `3px solid ${sc.bar}`, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: sc.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{TYPE_LABELS[a.typeAnomalie] || a.typeAnomalie}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: sc.bar }}>{a.tauxCharge.toFixed(0)}%</span>
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{a.collaborateurNom}</p>
                    <p style={{ fontSize: '10px', color: C.textMuted }}>{a.projetsConcernes}</p>
                  </div>
                );
              })}
              <button onClick={() => navigate('/pm/anomalies')}
                style={{ width: '100%', padding: '8px', borderRadius: R, border: `1px solid ${C.red}30`, backgroundColor: `${C.red}08`, color: C.red, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                Analyser toutes les anomalies →
              </button>
            </div>
          )}
        </SectionCard>

        {/* Mes Projets Récents */}
        <SectionCard title="Mes Projets Récents" subtitle={data ? `${data.totalProjets} projet${data.totalProjets > 1 ? 's' : ''} au total` : '...'} accent={C.blue}
          actions={<button onClick={() => navigate('/pm/projects')} style={{ fontSize: '11px', fontWeight: 600, color: C.blue, display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer' }}>Voir tout <ArrowUpRight style={{ width: '11px', height: '11px' }} /></button>}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 60, backgroundColor: C.borderLight, borderRadius: R }} />)}
            </div>
          ) : !data || data.projetsRecents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: '28px', marginBottom: 6 }}>📋</p>
              <p style={{ color: C.textMuted, fontSize: '12px', fontWeight: 600 }}>Aucun projet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.projetsRecents.map(p => {
                const sc = STATUS_CFG[p.statut] || STATUS_CFG.EN_COURS;
                return (
                  <div key={p.id} onClick={() => navigate('/pm/projects')}
                    style={{ padding: '10px 12px', borderRadius: R, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.white)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{p.nom}</p>
                        <p style={{ fontSize: '10px', color: C.textMuted }}>{p.collaborateurs} collaborateur{p.collaborateurs > 1 ? 's' : ''}</p>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'flex', alignItems: 'center', gap: '3px', height: 'fit-content' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot }} />
                        {sc.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '2px', backgroundColor: C.blue, width: `${p.avancementPct}%`, transition: 'width 0.5s ease' }} />
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: C.blue }}>{p.avancementPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
