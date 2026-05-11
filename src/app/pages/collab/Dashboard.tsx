import { Briefcase, Clock, CheckSquare, Bell, ArrowUpRight, AlertCircle, TrendingUp } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { C, S, R, PageHeader, SectionCard, KpiCard, cardStyle } from '../../components/ui/design-system';
import { useNavigate } from 'react-router';

/* ─── DATA ─────────────────────────────────────── */
const kpiData = [
  { title: 'Projets Assignés', value: '2', change: '+1', trendPositive: true, icon: Briefcase, accent: C.green, sub: 'projets actifs' },
  { title: 'Charge de Travail', value: '95%', change: '+5%', trendPositive: false, icon: TrendingUp, accent: '#F59E0B', sub: 'capacité allouée' },
  { title: 'Tâches à Venir', value: '3', change: '-1', trendPositive: true, icon: CheckSquare, accent: C.blue, sub: 'cette semaine' },
];

const workloadData = [{ name: 'Charge', value: 95, fill: '#F59E0B' }];

const weeklyData = [
  { day: 'Lun', alpha: 55, beta: 40 }, { day: 'Mar', alpha: 55, beta: 40 },
  { day: 'Mer', alpha: 55, beta: 0 }, { day: 'Jeu', alpha: 55, beta: 40 },
  { day: 'Ven', alpha: 55, beta: 40 },
];

const myProjects = [
  { id: 1, name: 'Projet Alpha', role: 'Architecte Solution', alloc: 55, completion: 65, status: 'en-cours', deadline: '30 Jun 2026', color: C.purple },
  { id: 2, name: 'Projet Beta', role: 'Tech Lead', alloc: 40, completion: 82, status: 'en-cours', deadline: '15 Mai 2026', color: C.blue },
];

const upcomingTasks = [
  { id: 1, title: 'Revue architecture microservices — Projet Alpha', date: 'Aujourd\'hui 14h00', priority: 'high' },
  { id: 2, title: 'Sprint planning Q2 — Projet Beta', date: 'Demain 10h00', priority: 'medium' },
  { id: 3, title: 'Documentation API v3 — Projet Alpha', date: '14/04/2026', priority: 'low' },
];

const PRIORITY_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: '#FEF2F2', text: '#B91C1C', dot: C.red },
  medium: { bg: '#FFF7ED', text: '#92400E', dot: '#F59E0B' },
  low: { bg: '#EFF6FF', text: '#1D4ED8', dot: C.blue },
};

const TIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, padding: '8px 12px', boxShadow: S.elevated, fontSize: '11px' }}>
      <p style={{ fontWeight: 700, color: C.text, marginBottom: '4px' }}>{label}</p>
      {payload.map((e: any, i: number) => <p key={i} style={{ color: e.fill, margin: '1px 0' }}>{e.name}: <strong>{e.value}%</strong></p>)}
    </div>
  );
};

/* ─── COMPONENT ─────────────────────────────────── */
export function CollabDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Mon Dashboard" subtitle="Vue personnelle de vos projets et tâches · Youssef El Amrani · 10 Avril 2026" />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {kpiData.map(k => <KpiCard key={k.title} label={k.title} value={k.value} sub={k.sub} trend={k.change} trendPositive={k.trendPositive} icon={k.icon} accent={k.accent} />)}
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

        {/* Weekly workload chart */}
        <SectionCard title="Charge Hebdomadaire" subtitle="Répartition par projet cette semaine" accent={C.green}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={18} barCategoryGap="30%" margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={C.borderLight} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} unit="%" domain={[0, 120]} />
              <Tooltip content={<TIP />} />
              <Bar dataKey="alpha" name="Projet Alpha" fill={C.purple} radius={[2, 2, 0, 0]} />
              <Bar dataKey="beta" name="Projet Beta" fill={C.blue} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
            {[{ c: C.purple, l: 'Projet Alpha (55%)' }, { c: C.blue, l: 'Projet Beta (40%)' }].map(i => (
              <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: C.textMuted }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: i.c }} />{i.l}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Workload gauge */}
        <SectionCard title="Mon Taux de Charge" subtitle="Allocation globale actuelle" accent='#F59E0B'>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" barSize={12} data={workloadData} startAngle={180} endAngle={0}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" fill="#F59E0B" cornerRadius={6} background={{ fill: C.borderLight }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', lineHeight: 1 }}>95%</p>
              <p style={{ fontSize: '10px', color: C.textMuted }}>Chargé</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
            {myProjects.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: C.textSecondary, flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: p.color }}>{p.alloc}%</span>
              </div>
            ))}
            <div style={{ height: '1px', backgroundColor: C.borderLight, margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: C.textMuted }}>Capacité restante</span>
              <span style={{ fontWeight: 700, color: C.green }}>5%</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* My Projects */}
        <SectionCard title="Mes Projets" subtitle="2 projets actifs" accent={C.green}
          actions={<button onClick={() => navigate('/collab/projects')} style={{ fontSize: '11px', fontWeight: 600, color: C.green, display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer' }}>Voir tout <ArrowUpRight style={{ width: '11px', height: '11px' }} /></button>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {myProjects.map(p => (
              <div key={p.id} onClick={() => navigate('/collab/projects')}
                style={{ padding: '12px', borderRadius: R, border: `1px solid ${C.border}`, borderLeft: `3px solid ${p.color}`, cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.white)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{p.name}</p>
                    <p style={{ fontSize: '10px', color: C.textMuted }}>{p.role} · {p.alloc}% alloué</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: p.color }}>{p.completion}%</p>
                    <p style={{ fontSize: '9px', color: C.textMuted }}>avancement</p>
                  </div>
                </div>
                <div style={{ height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '2px', backgroundColor: p.color, width: `${p.completion}%` }} />
                </div>
                <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '5px' }}>Deadline : {p.deadline}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Upcoming Tasks */}
        <SectionCard title="Tâches à Venir" subtitle="3 tâches cette semaine" accent={C.blue}
          actions={<button onClick={() => navigate('/collab/schedule')} style={{ fontSize: '11px', fontWeight: 600, color: C.blue, display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer' }}>Voir le planning <ArrowUpRight style={{ width: '11px', height: '11px' }} /></button>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {upcomingTasks.map(t => {
              const pc = PRIORITY_CFG[t.priority];
              return (
                <div key={t.id} style={{ padding: '10px 12px', borderRadius: R, backgroundColor: pc.bg, borderLeft: `3px solid ${pc.dot}` }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '3px', lineHeight: 1.4 }}>{t.title}</p>
                  <p style={{ fontSize: '10px', color: pc.text, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock style={{ width: '10px', height: '10px' }} />{t.date}
                  </p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}