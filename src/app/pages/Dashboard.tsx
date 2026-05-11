import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, AlertTriangle, UserCheck, UserX, Download, RefreshCw, ArrowUpRight, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { C, S, R, PageHeader, SectionCard, KpiCard, BtnPrimary, Badge } from '../components/ui/design-system';

/* ─── DATA ─────────────────────────────────────────────────── */
const kpiData = [
  { title: 'Taux de Staffing', value: '92%', change: '+4.5%', trendPositive: true, icon: UserCheck, accent: C.purple, sub: 'vs mois précédent' },
  { title: 'Collaborateurs Actifs', value: '48', change: '+3', trendPositive: true, icon: Users, accent: C.blue, sub: 'sur 52 total' },
  { title: 'Conflits Détectés', value: '5', change: '-2', trendPositive: false, icon: AlertTriangle, accent: C.red, sub: '2 critiques actifs' },
  { title: 'Ressources Surchargées', value: '3', change: '+1', trendPositive: false, icon: TrendingUp, accent: C.orange, sub: ">100% allocation" },
  { title: 'Sous-utilisées', value: '4', change: '-1', trendPositive: true, icon: UserX, accent: C.cyan, sub: "<70% allocation" },
];

const staffingTrend = [
  { month: 'Nov', staffing: 84, target: 90 },
  { month: 'Déc', staffing: 86, target: 90 },
  { month: 'Jan', staffing: 88, target: 90 },
  { month: 'Fév', staffing: 87, target: 90 },
  { month: 'Mar', staffing: 90, target: 90 },
  { month: 'Avr', staffing: 92, target: 90 },
];

const anomalyTrend = [
  { month: 'Nov', surcharge: 4, sous: 3, conflit: 2 },
  { month: 'Déc', surcharge: 5, sous: 4, conflit: 3 },
  { month: 'Jan', surcharge: 3, sous: 5, conflit: 2 },
  { month: 'Fév', surcharge: 4, sous: 3, conflit: 4 },
  { month: 'Mar', surcharge: 3, sous: 4, conflit: 3 },
  { month: 'Avr', surcharge: 3, sous: 4, conflit: 2 },
];

const projectDist = [
  { name: 'En cours', value: 4, color: C.purple },
  { name: 'Planifiés', value: 2, color: C.yellow },
  { name: 'Terminés', value: 1, color: C.green },
];

const anomalies = [
  { id: 1, type: 'Surcharge', employee: 'Youssef El Amrani', projects: 'Alpha, Beta, Gamma', charge: '180%', sev: 'critical' },
  { id: 2, type: 'Conflit alloc.', employee: 'Sara Benali', projects: 'Delta, Epsilon', charge: '200%', sev: 'critical' },
  { id: 3, type: 'Sous-util.', employee: 'Hamza Lahlou', projects: 'Zeta', charge: '30%', sev: 'medium' },
  { id: 4, type: 'Surcharge', employee: 'Salma Idrissi', projects: 'Eta, Theta', charge: '150%', sev: 'high' },
  { id: 5, type: 'Conflit alloc.', employee: 'Ahmed Chafik', projects: 'Iota, Kappa', charge: '180%', sev: 'critical' },
];

/* ─── TOOLTIP ────────────────────────────────────── */
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

/* ─── COMPONENT ─────────────────────────────────── */
export function Dashboard() {
  const [exporting, setExporting] = useState(false);

  const doExport = () => {
    setExporting(true);
    toast.loading('Génération du rapport PDF…', { id: 'pdf' });
    setTimeout(() => { setExporting(false); toast.success('Rapport PDF exporté !', { id: 'pdf' }); }, 2000);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Page Header — no export button ── */}
      <PageHeader
        title="Dashboard — Vue Globale"
        subtitle="Pilotage des ressources et détection des anomalies de staffing · 10 Avril 2026"
      />

      {/* ── KPI Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px' }}>
        {kpiData.map(k => <KpiCard key={k.title} label={k.title} value={k.value} sub={k.sub} trend={k.change} trendPositive={k.trendPositive} icon={k.icon} accent={k.accent} />)}
      </div>

      {/* ── Charts Row 1 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

        {/* Staffing trend */}
        <SectionCard title="Évolution du Taux de Staffing" subtitle="6 derniers mois · Objectif cible : 90%" accent={C.purple}
          actions={<span style={{ fontSize: '11px', fontWeight: 700, color: C.green, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: R, display: 'flex', alignItems: 'center', gap: '3px' }}><ArrowUpRight style={{ width: '11px', height: '11px' }} />92% ce mois</span>}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={staffingTrend} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={C.borderLight} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} domain={[75, 100]} unit="%" />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine y={90} stroke={C.magenta} strokeDasharray="5 3" strokeWidth={1.5} />
              <Line type="monotone" dataKey="staffing" stroke={C.purple} strokeWidth={2.5} dot={{ r: 4, fill: C.purple, stroke: C.white, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Taux actuel" />
              <Line type="monotone" dataKey="target" stroke={C.magenta} strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="Objectif" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Project distribution */}
        <SectionCard title="Répartition Projets" subtitle="7 projets au total" accent={C.magenta}>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={projectDist} cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={3} dataKey="value">
                {projectDist.map((e) => <Cell key={`cell-${e.name}`} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v} projets`, '']} content={<ChartTip />} />
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
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: item.color, width: `${(item.value / 7) * 100}%` }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: C.text, minWidth: '12px' }}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Charts Row 2 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

        {/* Anomaly analysis */}
        <SectionCard title="Analyse des Anomalies de Staffing" subtitle="Évolution sur 6 mois" accent={C.orange}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={anomalyTrend} barSize={10} barCategoryGap="35%" margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={C.borderLight} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="surcharge" name="Surcharge" fill={C.red} radius={[2, 2, 0, 0]} />
              <Bar dataKey="sous" name="Sous-utilisation" fill={C.orange} radius={[2, 2, 0, 0]} />
              <Bar dataKey="conflit" name="Conflits" fill={C.purple} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${C.borderLight}` }}>
            {[{ color: C.red, label: 'Surcharge' }, { color: C.orange, label: 'Sous-utilisation' }, { color: C.purple, label: 'Conflits' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: l.color }} />
                <span style={{ fontSize: '11px', color: C.textMuted }}>{l.label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Anomaly list */}
        <SectionCard title="Anomalies Actives" subtitle="5 conflits en cours" accent={C.red}
          actions={<a href="/conflicts" style={{ fontSize: '11px', fontWeight: 600, color: C.magenta, display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}>Voir tout <ArrowUpRight style={{ width: '11px', height: '11px' }} /></a>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {anomalies.map(a => {
              const sc = SEV_CONFIG[a.sev] || SEV_CONFIG.medium;
              return (
                <div key={a.id} style={{
                  padding: '8px 10px', borderRadius: R,
                  backgroundColor: sc.bg,
                  borderLeft: `3px solid ${sc.bar}`,
                  cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: sc.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{a.type}</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: sc.bar }}>{a.charge}</span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '1px' }}>{a.employee}</p>
                  <p style={{ fontSize: '10px', color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.projects}</p>
                </div>
              );
            })}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}