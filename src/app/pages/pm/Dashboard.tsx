import { useState } from 'react';
import { Briefcase, Users, AlertTriangle, TrendingUp, ArrowUpRight, BarChart2, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { C, S, R, PageHeader, SectionCard, KpiCard, cardStyle } from '../../components/ui/design-system';
import { useNavigate } from 'react-router';

/* ─── DATA ────────────────────────────────────────── */
const kpiData = [
  { title: 'Projets Actifs', value: '3', change: '+1', trendPositive: true, icon: Briefcase, accent: C.blue, sub: 'sur 5 au total' },
  { title: 'Collaborateurs', value: '8', change: '+2', trendPositive: true, icon: Users, accent: C.purple, sub: 'assignés à mes projets' },
  { title: 'Anomalies', value: '2', change: '-1', trendPositive: true, icon: AlertTriangle, accent: C.red, sub: '1 critique active' },
  { title: 'CA Estimé', value: '450K€', change: '+12%', trendPositive: true, icon: DollarSign, accent: '#059669', sub: 'sur exercice 2026' },
  { title: 'Performance', value: '87%', change: '+5%', trendPositive: true, icon: TrendingUp, accent: '#F59E0B', sub: 'taux de livraison' },
];

const revenueData = [
  { month: 'Nov', ca: 310, prev: 280 }, { month: 'Déc', ca: 340, prev: 310 },
  { month: 'Jan', ca: 365, prev: 340 }, { month: 'Fév', ca: 370, prev: 365 },
  { month: 'Mar', ca: 415, prev: 370 }, { month: 'Avr', ca: 450, prev: 415 },
];

const projectPerf = [
  { name: 'Alpha', completion: 65, budget: 80, team: 4 },
  { name: 'Beta', completion: 82, budget: 90, team: 3 },
  { name: 'Delta', completion: 58, budget: 65, team: 3 },
];

const recentAnomalies = [
  { id: 1, resource: 'Youssef El Amrani', project: 'Projet Alpha', type: 'Surcharge', charge: '180%', sev: 'critical' },
  { id: 2, resource: 'Sara Benali', project: 'Projet Beta', type: 'Surcharge', charge: '200%', sev: 'critical' },
];

const recentProjects = [
  { id: 1, name: 'Projet Alpha', client: 'BCP Bank', status: 'en-cours', budget: '180K€', completion: 65 },
  { id: 2, name: 'Projet Beta', client: 'Attijariwafa', status: 'en-cours', budget: '150K€', completion: 82 },
  { id: 3, name: 'Projet Delta', client: 'BMCE Bank', status: 'en-cours', budget: '120K€', completion: 58 },
];

const TIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, padding: '8px 12px', boxShadow: S.elevated, fontSize: '11px' }}>
      <p style={{ fontWeight: 700, color: C.text, marginBottom: '4px' }}>{label}</p>
      {payload.map((e: any, i: number) => <p key={i} style={{ color: e.stroke || e.fill, margin: '1px 0' }}>{e.name}: <strong>{e.value}K€</strong></p>)}
    </div>
  );
};

const SEV_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  critical: { bg: '#FEF2F2', text: '#B91C1C', bar: C.red },
  high: { bg: '#FFF7ED', text: '#92400E', bar: '#F59E0B' },
};

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  'en-cours': { bg: '#EFF6FF', text: '#1D4ED8', dot: C.blue },
  planifie: { bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' },
  termine: { bg: '#ECFDF5', text: '#065F46', dot: C.green },
};

/* ─── COMPONENT ────────────────────────────────────── */
export function PmDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Dashboard — Chef de Projet" subtitle="Suivi de vos projets et gestion des anomalies · Khalid Bennani · 10 Avril 2026" />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px' }}>
        {kpiData.map(k => <KpiCard key={k.title} label={k.title} value={k.value} sub={k.sub} trend={k.change} trendPositive={k.trendPositive} icon={k.icon} accent={k.accent} />)}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Revenue chart */}
        <SectionCard title="Évolution du Chiffre d'Affaires" subtitle="6 derniers mois · en milliers d'euros" accent={C.blue}
          actions={<span style={{ fontSize: '11px', fontWeight: 700, color: C.green, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: R, display: 'flex', alignItems: 'center', gap: '3px' }}><ArrowUpRight style={{ width: '11px', height: '11px' }} />450K€ ce mois</span>}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.blue} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.purple} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={C.borderLight} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} unit="K" />
              <Tooltip content={<TIP />} />
              <Area type="monotone" dataKey="ca" stroke={C.blue} strokeWidth={2.5} fill="url(#caGrad)" dot={{ r: 4, fill: C.blue, stroke: C.white, strokeWidth: 2 }} activeDot={{ r: 6 }} name="CA 2026" />
              <Area type="monotone" dataKey="prev" stroke={C.purple} strokeWidth={1.5} strokeDasharray="5 3" fill="url(#prevGrad)" dot={false} name="CA 2025" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Project Performance */}
        <SectionCard title="Performance Projets" subtitle="Avancement vs. budget" accent={C.purple}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {projectPerf.map(p => (
              <div key={p.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{p.name}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: C.blue, backgroundColor: `${C.blue}10`, padding: '1px 5px', borderRadius: '3px' }}>Avr: {p.completion}%</span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: C.purple, backgroundColor: `${C.purple}10`, padding: '1px 5px', borderRadius: '3px' }}>Budget: {p.budget}%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {[{ v: p.completion, c: C.blue, l: 'Avancement' }, { v: p.budget, c: C.purple, l: 'Budget consommé' }].map(row => (
                    <div key={row.l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', color: C.textMuted, width: '70px' }}>{row.l}</span>
                      <div style={{ flex: 1, height: '5px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '2px', backgroundColor: row.c, width: `${row.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Recent Anomalies */}
        <SectionCard title="Anomalies Récentes" subtitle="2 anomalies actives" accent={C.red}
          actions={<button onClick={() => navigate('/pm/anomalies')} style={{ fontSize: '11px', fontWeight: 600, color: C.blue, display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer' }}>Voir tout <ArrowUpRight style={{ width: '11px', height: '11px' }} /></button>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentAnomalies.map(a => {
              const sc = SEV_COLORS[a.sev] || SEV_COLORS.high;
              return (
                <div key={a.id} onClick={() => navigate('/pm/anomalies')}
                  style={{ padding: '10px 12px', borderRadius: R, backgroundColor: sc.bg, borderLeft: `3px solid ${sc.bar}`, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: sc.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{a.type}</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: sc.bar }}>{a.charge}</span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{a.resource}</p>
                  <p style={{ fontSize: '10px', color: C.textMuted }}>{a.project}</p>
                </div>
              );
            })}
            <button onClick={() => navigate('/pm/anomalies')}
              style={{ width: '100%', padding: '8px', borderRadius: R, border: `1px solid ${C.red}30`, backgroundColor: `${C.red}08`, color: C.red, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
              Analyser toutes les anomalies →
            </button>
          </div>
        </SectionCard>

        {/* Recent Projects */}
        <SectionCard title="Mes Projets Récents" subtitle="3 projets actifs" accent={C.blue}
          actions={<button onClick={() => navigate('/pm/projects')} style={{ fontSize: '11px', fontWeight: 600, color: C.blue, display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer' }}>Voir tout <ArrowUpRight style={{ width: '11px', height: '11px' }} /></button>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentProjects.map(p => {
              const sc = STATUS_CFG[p.status] || STATUS_CFG['en-cours'];
              return (
                <div key={p.id} onClick={() => navigate('/pm/projects')}
                  style={{ padding: '10px 12px', borderRadius: R, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.white)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{p.name}</p>
                      <p style={{ fontSize: '10px', color: C.textMuted }}>{p.client} · {p.budget}</p>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'flex', alignItems: 'center', gap: '3px', height: 'fit-content' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot }} />
                      En cours
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '2px', backgroundColor: C.blue, width: `${p.completion}%` }} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: C.blue }}>{p.completion}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
