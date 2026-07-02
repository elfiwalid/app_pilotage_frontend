import { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertTriangle, UserCheck, UserX, ArrowUpRight, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { C, S, R, PageHeader, SectionCard, KpiCard, cardStyle } from '../components/ui/design-system';
import { useNavigate } from 'react-router';
import { fetchRmDashboard, type RmDashboardDTO } from '../services/resourceManagerService';

/* TOOLTIP */
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, padding: '8px 12px', boxShadow: S.elevated, fontSize: '11px' }}>
      <p style={{ fontWeight: 700, color: C.text, marginBottom: '4px' }}>{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} style={{ color: e.stroke || e.fill, margin: '1px 0' }}>
          {e.name}: <strong>{e.value}{e.name?.toLowerCase().includes('taux') || e.name?.toLowerCase().includes('staffing') || e.name?.toLowerCase().includes('objectif') ? '%' : ''}</strong>
        </p>
      ))}
    </div>
  );
};

const SEV_CONFIG: Record<string, { bg: string; text: string; bar: string }> = {
  critical: { bg: '#FEF2F2', text: '#B91C1C', bar: '#EF4444' },
  high: { bg: '#FFF7ED', text: '#B45309', bar: '#F59E0B' },
  medium: { bg: '#FFFBEB', text: '#92400E', bar: '#F59E0B' },
};

const TYPE_LABELS: Record<string, string> = {
  SURCHARGE: 'Surcharge',
  CONFLIT_AFFECTATION: 'Conflit alloc.',
  DISPONIBILITE_INSUFFISANTE: 'Sous-util.',
};

/* COMPONENT */
export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<RmDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const d = await fetchRmDashboard();
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: C.magenta, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '14px', color: C.textMuted }}>Erreur de chargement du dashboard.</p>
      </div>
    );
  }

  const kpiData = [
    { title: 'Taux de Staffing', value: `${data.tauxStaffingGlobal}%`, trendPositive: data.tauxStaffingGlobal >= 90, icon: UserCheck, accent: C.purple, sub: 'moyenne globale' },
    { title: 'Collaborateurs Actifs', value: String(data.collaborateursActifs), trendPositive: true, icon: Users, accent: C.blue, sub: `sur ${data.totalCollaborateurs} total` },
    { title: 'Conflits Detectes', value: String(data.conflitsDetectes), trendPositive: data.conflitsDetectes === 0, icon: AlertTriangle, accent: C.red, sub: 'anomalies ouvertes' },
    { title: 'Ressources Surchargees', value: String(data.ressourcesSurchargees), trendPositive: data.ressourcesSurchargees === 0, icon: TrendingUp, accent: '#F59E0B', sub: '>100% allocation' },
    { title: 'Sous-utilisees', value: String(data.ressourcesSousUtilisees), trendPositive: data.ressourcesSousUtilisees === 0, icon: UserX, accent: C.cyan, sub: '<80% allocation' },
  ];

  const totalProjets = data.projetsEnCours + data.projetsPlanifies + data.projetsTermines;
  const projectDist = [
    { name: 'En cours', value: data.projetsEnCours, color: C.purple },
    { name: 'Planifies', value: data.projetsPlanifies, color: '#F59E0B' },
    { name: 'Termines', value: data.projetsTermines, color: C.green },
  ].filter(p => p.value > 0);

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Dashboard - Vue Globale" subtitle="Pilotage des ressources et detection des anomalies de staffing" />

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px' }}>
        {kpiData.map(k => <KpiCard key={k.title} label={k.title} value={k.value} sub={k.sub} trendPositive={k.trendPositive} icon={k.icon} accent={k.accent} />)}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

        {/* Staffing trend line chart */}
        <SectionCard title="Evolution du Taux de Staffing" subtitle="6 derniers mois - Objectif cible : 90%" accent={C.purple}
          actions={<span style={{ fontSize: '11px', fontWeight: 700, color: data.tauxStaffingGlobal >= 90 ? C.green : '#F59E0B', backgroundColor: data.tauxStaffingGlobal >= 90 ? '#ECFDF5' : '#FFF7ED', border: `1px solid ${data.tauxStaffingGlobal >= 90 ? '#A7F3D0' : '#FDE68A'}`, padding: '2px 8px', borderRadius: R, display: 'flex', alignItems: 'center', gap: '3px' }}><ArrowUpRight style={{ width: '11px', height: '11px' }} />{data.tauxStaffingGlobal}% ce mois</span>}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.staffingMensuel} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={C.borderLight} vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} domain={[0, 'dataMax + 20']} unit="%" />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine y={90} stroke={C.magenta} strokeDasharray="5 3" strokeWidth={1.5} />
              <Line type="monotone" dataKey="tauxStaffing" stroke={C.purple} strokeWidth={2.5} dot={{ r: 4, fill: C.purple, stroke: C.white, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Taux actuel" />
              <Line type="monotone" dataKey="objectif" stroke={C.magenta} strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="Objectif" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Project distribution pie */}
        <SectionCard title="Repartition Projets" subtitle={`${totalProjets} projets au total`} accent={C.magenta}>
          {totalProjets === 0 ? (
            <p style={{ fontSize: '12px', color: C.textMuted, textAlign: 'center', padding: '30px 0' }}>Aucun projet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={projectDist} cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={3} dataKey="value">
                    {projectDist.map((e) => <Cell key={`cell-${e.name}`} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {projectDist.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: item.color }} />
                      <span style={{ fontSize: '12px', color: C.textSecondary }}>{item.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '48px', height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '2px', backgroundColor: item.color, width: `${(item.value / totalProjets) * 100}%` }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: C.text, minWidth: '12px' }}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

        {/* Anomaly analysis bar chart */}
        <SectionCard title="Analyse des Anomalies de Staffing" subtitle="Evolution sur 6 mois" accent={'#F59E0B'}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.anomaliesMensuelles} barSize={10} barCategoryGap="35%" margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={C.borderLight} vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="surcharge" name="Surcharge" fill={C.red} radius={[2, 2, 0, 0]} />
              <Bar dataKey="sousUtilisation" name="Sous-utilisation" fill={'#F59E0B'} radius={[2, 2, 0, 0]} />
              <Bar dataKey="conflit" name="Conflits" fill={C.purple} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${C.borderLight}` }}>
            {[{ color: C.red, label: 'Surcharge' }, { color: '#F59E0B', label: 'Sous-utilisation' }, { color: C.purple, label: 'Conflits' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: l.color }} />
                <span style={{ fontSize: '11px', color: C.textMuted }}>{l.label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Anomaly list */}
        <SectionCard title="Anomalies Actives" subtitle={`${data.conflitsDetectes} conflit(s) en cours`} accent={C.red}
          actions={<a href="/conflicts" onClick={e => { e.preventDefault(); navigate('/conflicts'); }} style={{ fontSize: '11px', fontWeight: 600, color: C.magenta, display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', cursor: 'pointer' }}>Voir tout <ArrowUpRight style={{ width: '11px', height: '11px' }} /></a>}>
          {data.anomaliesActives.length === 0 ? (
            <p style={{ fontSize: '12px', color: C.textMuted, textAlign: 'center', padding: '20px 0' }}>Aucune anomalie active.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.anomaliesActives.map(a => {
                const sc = SEV_CONFIG[a.severite] || SEV_CONFIG.medium;
                return (
                  <div key={a.id} style={{ padding: '8px 10px', borderRadius: R, backgroundColor: sc.bg, borderLeft: `3px solid ${sc.bar}`, cursor: 'pointer' }}
                    onClick={() => navigate('/conflicts')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: sc.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{TYPE_LABELS[a.type] || a.type}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: sc.bar }}>{a.charge}%</span>
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '1px' }}>{a.collaborateur}</p>
                    <p style={{ fontSize: '10px', color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.projets}</p>
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
