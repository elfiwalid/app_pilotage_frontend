import { useState, useEffect } from 'react';
import { Briefcase, Clock, CheckSquare, ArrowUpRight, TrendingUp, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { C, S, R, PageHeader, SectionCard, KpiCard } from '../../components/ui/design-system';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { fetchCollabDashboard, type CollabDashboardDTO } from '../../services/collaborateurService';

const STATUS_LABEL: Record<string, string> = {
  EN_COURS: 'en-cours', PLANIFIE: 'planifié', TERMINE: 'terminé', SUSPENDU: 'suspendu',
};

function chargeColor(pct: number): string {
  if (pct > 100) return C.red;
  if (pct >= 80) return '#F59E0B';
  return C.green;
}

const TIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, padding: '8px 12px', boxShadow: S.elevated, fontSize: '11px' }}>
      <p style={{ fontWeight: 700, color: C.text, marginBottom: '4px' }}>{label}</p>
      {payload.map((e: any, i: number) => <p key={i} style={{ color: e.fill, margin: '1px 0' }}>{e.name}: <strong>{e.value}%</strong></p>)}
    </div>
  );
};

function formatDateFr(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

/* ─── COMPONENT ─────────────────────────────────── */
export function CollabDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<CollabDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const MOIS_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchCollabDashboard(currentYear, currentMonth);
      setData(d);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger le dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [currentYear, currentMonth]);

  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 style={{ width: '32px', height: '32px', color: C.green, animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: C.textMuted }}>Chargement du dashboard…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <AlertTriangle style={{ width: '32px', height: '32px', color: C.red }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>Erreur de chargement</p>
          <p style={{ fontSize: '12px', color: C.textSecondary, maxWidth: '320px' }}>{error}</p>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: R, border: 'none', backgroundColor: C.green, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
            <RefreshCw style={{ width: '12px', height: '12px' }} />Réessayer
          </button>
        </div>
      </div>
    );
  }

  const periodeLabel = `${MOIS_LABELS[currentMonth - 1]} ${currentYear}`;
  const projetsActifs = data.projets.filter(p => p.statut === 'EN_COURS');

  // KPIs
  const kpiData = [
    { title: 'Projets Assignés', value: String(data.projetsAssignes), trendPositive: true, icon: Briefcase, accent: C.green, sub: 'projets actifs' },
    { title: 'Charge de Travail', value: `${data.tauxCharge}%`, trendPositive: data.tauxCharge <= 100, icon: TrendingUp, accent: chargeColor(data.tauxCharge), sub: 'capacité allouée' },
    { title: 'Échéances Proches', value: String(data.projetsBientotTermines), trendPositive: true, icon: CheckSquare, accent: C.blue, sub: 'sous 30 jours' },
    { title: 'Avancement Moyen', value: `${data.avancementMoyen}%`, trendPositive: true, icon: ArrowUpRight, accent: C.purple, sub: 'projets actifs' },
  ];
  const taskKpis = [
    { title: 'Total Tâches', value: String(data.totalTaches ?? 0), trendPositive: true, icon: CheckSquare, accent: C.blue, sub: 'mois courant' },
    { title: 'Terminées', value: String(data.tachesTerminees ?? 0), trendPositive: true, icon: CheckSquare, accent: C.green, sub: 'tâches livrées' },
    { title: 'En Cours', value: String(data.tachesEnCours ?? 0), trendPositive: true, icon: Clock, accent: C.purple, sub: 'en progression' },
    { title: 'Bloquées', value: String(data.tachesBloquees ?? 0), trendPositive: (data.tachesBloquees ?? 0) === 0, icon: AlertTriangle, accent: C.red, sub: `${data.avancementGlobalTaches ?? 0}% global` },
  ];

  // Charge mensuelle → bar chart (6 prochains mois)
  void taskKpis;
  const visibleTaskKpis = [
    { title: 'Total Taches', value: String(data.totalTaches ?? 0), trendPositive: true, icon: CheckSquare, accent: C.blue, sub: `${data.avancementGlobalTaches ?? 0}% global` },
    { title: 'Terminees', value: String(data.tachesTerminees ?? 0), trendPositive: true, icon: CheckSquare, accent: C.green, sub: 'taches livrees' },
    { title: 'En Cours', value: String(data.tachesEnCours ?? 0), trendPositive: true, icon: Clock, accent: '#D97706', sub: 'en progression' },
    { title: 'Bloquees', value: String(data.tachesBloquees ?? 0), trendPositive: (data.tachesBloquees ?? 0) === 0, icon: AlertTriangle, accent: C.red, sub: 'a traiter' },
    { title: 'En attente', value: String(data.tachesEnAttente ?? 0), trendPositive: true, icon: Clock, accent: C.textMuted, sub: 'a demarrer' },
  ];

  const monthly = data.chargeMensuelle.slice(0, 6).map(m => ({
    mois: m.mois,
    charge: m.tauxCharge,
    projets: m.nombreProjets,
  }));

  const workloadData = [{ name: 'Charge', value: Math.min(data.tauxCharge, 100), fill: chargeColor(data.tauxCharge) }];

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Mon Dashboard" subtitle={`Vue personnelle de vos projets et tâches · ${periodeLabel}`} />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {kpiData.map(k => <KpiCard key={k.title} label={k.title} value={k.value} sub={k.sub} trendPositive={k.trendPositive} icon={k.icon} accent={k.accent} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px' }}>
        {visibleTaskKpis.map(k => <KpiCard key={k.title} label={k.title} value={k.value} sub={k.sub} trendPositive={k.trendPositive} icon={k.icon} accent={k.accent} />)}
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

        {/* Monthly workload chart */}
        <SectionCard title="Charge Mensuelle Prévue" subtitle="Taux d'affectation cumulé par mois (6 mois)" accent={C.green}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly} barSize={28} barCategoryGap="30%" margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={C.borderLight} vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} unit="%" domain={[0, 'dataMax + 20']} />
              <Tooltip content={<TIP />} />
              <Bar dataKey="charge" name="Charge" fill={C.green} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: C.textMuted }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: C.green }} />Charge cumulée mensuelle
            </div>
          </div>
        </SectionCard>

        {/* Workload gauge */}
        <SectionCard title="Mon Taux de Charge" subtitle="Allocation globale actuelle" accent={chargeColor(data.tauxCharge)}>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" barSize={12} data={workloadData} startAngle={180} endAngle={0}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" fill={chargeColor(data.tauxCharge)} cornerRadius={6} background={{ fill: C.borderLight }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: chargeColor(data.tauxCharge), lineHeight: 1 }}>{data.tauxCharge}%</p>
              <p style={{ fontSize: '10px', color: C.textMuted }}>Chargé</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
            {projetsActifs.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: p.couleur, flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: C.textSecondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: p.couleur }}>{p.tauxAffectation}%</span>
              </div>
            ))}
            <div style={{ height: '1px', backgroundColor: C.borderLight, margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: C.textMuted }}>Capacité restante</span>
              <span style={{ fontWeight: 700, color: data.capaciteRestante > 0 ? C.green : C.red }}>{data.capaciteRestante}%</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* My Projects */}
        <SectionCard title="Mes Projets" subtitle={`${projetsActifs.length} projet(s) actif(s)`} accent={C.green}
          actions={<button onClick={() => navigate('/collab/projects')} style={{ fontSize: '11px', fontWeight: 600, color: C.green, display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer' }}>Voir tout <ArrowUpRight style={{ width: '11px', height: '11px' }} /></button>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.projets.length === 0 ? (
              <p style={{ fontSize: '12px', color: C.textMuted, textAlign: 'center', padding: '20px 0' }}>Aucun projet assigné.</p>
            ) : data.projets.slice(0, 4).map(p => (
              <div key={p.id} onClick={() => navigate('/collab/projects')}
                style={{ padding: '12px', borderRadius: R, border: `1px solid ${C.border}`, borderLeft: `3px solid ${p.couleur}`, cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.white)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</p>
                    <p style={{ fontSize: '10px', color: C.textMuted }}>{p.role} · {p.tauxAffectation}% alloué</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: p.couleur }}>{p.avancement}%</p>
                    <p style={{ fontSize: '9px', color: C.textMuted }}>avancement</p>
                  </div>
                </div>
                <div style={{ height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '2px', backgroundColor: p.couleur, width: `${p.avancement}%` }} />
                </div>
                <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '5px' }}>Deadline : {formatDateFr(p.dateFin)}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Upcoming deadlines (échéances proches) */}
        <SectionCard title="Échéances à Venir" subtitle="Projets se terminant prochainement" accent={C.blue}
          actions={<button onClick={() => navigate('/collab/schedule')} style={{ fontSize: '11px', fontWeight: 600, color: C.blue, display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer' }}>Voir le planning <ArrowUpRight style={{ width: '11px', height: '11px' }} /></button>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(() => {
              const now = new Date();
              const upcoming = projetsActifs
                .filter(p => new Date(p.dateFin) >= now)
                .sort((a, b) => new Date(a.dateFin).getTime() - new Date(b.dateFin).getTime())
                .slice(0, 4);
              if (upcoming.length === 0) {
                return <p style={{ fontSize: '12px', color: C.textMuted, textAlign: 'center', padding: '20px 0' }}>Aucune échéance proche.</p>;
              }
              return upcoming.map(p => {
                const days = Math.ceil((new Date(p.dateFin).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const urgent = days <= 30;
                const bg = urgent ? '#FEF2F2' : '#EFF6FF';
                const dot = urgent ? C.red : C.blue;
                const txt = urgent ? '#B91C1C' : '#1D4ED8';
                return (
                  <div key={p.id} style={{ padding: '10px 12px', borderRadius: R, backgroundColor: bg, borderLeft: `3px solid ${dot}` }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '3px', lineHeight: 1.4 }}>{p.nom} — {p.role}</p>
                    <p style={{ fontSize: '10px', color: txt, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock style={{ width: '10px', height: '10px' }} />{formatDateFr(p.dateFin)} · dans {days} jour{days > 1 ? 's' : ''}
                    </p>
                  </div>
                );
              });
            })()}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
