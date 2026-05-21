import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, AlertTriangle, UserCheck, UserX, Download, RefreshCw, ArrowUpRight, Activity, Loader2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { C, S, R, PageHeader, SectionCard, KpiCard, BtnPrimary, Badge } from '../components/ui/design-system';
import { fetchKPISummary, KPISummary } from '../services/kpiService';
import { fetchAnomalies, AnomalieResponseDTO } from '../services/anomalieService';
import { fetchMesProjets, ProjetResponseDTO } from '../services/projetService';

/* ─── TOOLTIP ────────────────────────────────────── */
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, padding: '8px 12px', boxShadow: S.elevated, fontSize: '11px' }}>
      <p style={{ fontWeight: 700, color: C.text, marginBottom: '4px' }}>{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} style={{ color: e.stroke || e.fill, margin: '1px 0' }}>
          {e.name}: <strong>{e.value}{String(e.name).toLowerCase().includes('taux') ? '%' : ''}</strong>
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
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalieResponseDTO[]>([]);
  const [projets, setProjets] = useState<ProjetResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [kData, aData, pData] = await Promise.all([
        fetchKPISummary(),
        fetchAnomalies(),
        fetchMesProjets()
      ]);
      setKpis(kData);
      setAnomalies(aData.filter(a => !a.resolu));
      setProjets(pData);
    } catch (err) {
      toast.error("Erreur de chargement du dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (loading || !kpis) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: C.bg }}>
        <Loader2 style={{ width: '40px', height: '40px', color: C.purple, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const evolutionData = Object.entries(kpis.evolution).map(([month, val]) => ({ month, staffing: val, target: 90 }));

  const projectDist = [
    { name: 'En cours', value: projets.filter(p => p.statut === 'en-cours').length, color: C.purple },
    { name: 'Planifiés', value: projets.filter(p => p.statut === 'planifie').length, color: C.yellow },
    { name: 'Terminés', value: projets.filter(p => p.statut === 'termine').length, color: C.green },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <PageHeader
        title="Dashboard — Vue Globale"
        subtitle={`Pilotage en temps réel · ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      {/* ── KPI Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px' }}>
        <KpiCard label="Taux de Staffing" value={`${kpis.tauxOccupation.toFixed(1)}%`} sub="Occupation globale" trend="+2.1%" trendPositive={true} icon={UserCheck} accent={C.purple} />
        <KpiCard label="TNF" value={`${kpis.tnf.toFixed(1)}%`} sub="Taux de Non Facturation" trend="-1.5%" trendPositive={true} icon={Activity} accent={C.blue} />
        <KpiCard label="Conflits Actifs" value={String(anomalies.length)} sub="Anomalies à résoudre" trend={anomalies.length > 0 ? "Attention" : "OK"} trendPositive={anomalies.length === 0} icon={AlertTriangle} accent={C.red} />
        <KpiCard label="Projets" value={String(projets.length)} sub="Portefeuille actif" trend="Stable" trendPositive={true} icon={Briefcase} accent={C.orange} />
        <KpiCard label="Collaborateurs" value={String(Object.keys(kpis.occupationParCollab).length)} sub="Ressources totales" trend="+1" trendPositive={true} icon={Users} accent={C.cyan} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <SectionCard title="Évolution de l'Occupation" subtitle="Historique mensuel · Objectif : 90%" accent={C.purple}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={evolutionData} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={C.borderLight} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine y={90} stroke={C.magenta} strokeDasharray="5 3" strokeWidth={1.5} />
              <Line type="monotone" dataKey="staffing" name="Taux d'occupation" stroke={C.purple} strokeWidth={2.5} dot={{ r: 4, fill: C.purple, stroke: C.white, strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Répartition Projets" subtitle={`${projets.length} projets total`} accent={C.magenta}>
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
                <span style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{item.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <SectionCard title="Dernières Anomalies" subtitle={`${anomalies.length} alertes en attente`} accent={C.red}
          actions={<a href="/conflicts" style={{ fontSize: '11px', fontWeight: 600, color: C.magenta, textDecoration: 'none' }}>Gérer tout →</a>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {anomalies.slice(0, 4).map(a => (
              <div key={a.id} style={{ padding: '10px', borderRadius: R, backgroundColor: '#FEF2F2', borderLeft: `3px solid ${C.red}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#B91C1C' }}>{a.typeAnomalie}</span>
                  <span style={{ fontSize: '10px', color: C.textMuted }}>{format(parseISO(a.dateDetection), 'dd MMM', { locale: fr })}</span>
                </div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{a.collaborateurNomComplet}</p>
                <p style={{ fontSize: '11px', color: C.textMuted }}>{a.description}</p>
              </div>
            ))}
            {anomalies.length === 0 && <p style={{ textAlign: 'center', color: C.textMuted, fontSize: '12px', padding: '20px' }}>Aucun conflit détecté ✨</p>}
          </div>
        </SectionCard>

        <SectionCard title="Occupation par Ressource" subtitle="Taux actuel (%)" accent={C.blue}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
            {Object.entries(kpis.occupationParCollab).map(([name, val]) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: C.text }}>{name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: val > 100 ? C.red : C.blue }}>{val.toFixed(0)}%</span>
                </div>
                <div style={{ height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '2px', backgroundColor: val > 100 ? C.red : val >= 80 ? C.purple : C.green, width: `${Math.min(val, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}