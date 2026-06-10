import { useState, useEffect } from 'react';
import { Briefcase, Users, AlertTriangle, TrendingUp, ArrowUpRight, Activity, Calendar, RefreshCw, Sparkles } from 'lucide-react';
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
import { fetchResourceForecast, ResourceForecastResponse } from '../../services/mlForecastService';
import { fetchPmRapportsV2, PmRapportMensuelDTO } from '../../services/pmReportsService';

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

const ML_RISK_CFG: Record<ResourceForecastResponse['riskLevel'], { label: string; bg: string; text: string; dot: string }> = {
  LOW: { label: 'Faible', bg: '#ECFDF5', text: '#065F46', dot: C.green },
  MEDIUM: { label: 'Modéré', bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' },
  HIGH: { label: 'Élevé', bg: '#FEF2F2', text: '#B91C1C', dot: C.red },
};

/* ─── SELECT STYLE ─────────────────────────────────── */
const selectStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 600, color: C.text,
  border: `1px solid ${C.border}`, borderRadius: R,
  padding: '5px 8px', backgroundColor: C.white,
  cursor: 'pointer', outline: 'none',
};

const ALL_FORECAST_PROJECTS = '__ALL_PROJECTS__';

const normalizeProjectName = (value: string) => value.toLowerCase().trim();

const average = (values: number[], fallback: number) => (
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback
);

const projectMatches = (source: string, selected: string) => {
  const normalizedSource = normalizeProjectName(source);
  const normalizedSelected = normalizeProjectName(selected);
  return normalizedSource === normalizedSelected
    || normalizedSource.includes(normalizedSelected)
    || normalizedSelected.includes(normalizedSource);
};

const getProjectDurationDays = (dateDebut: string, dateFin: string) => {
  const start = new Date(dateDebut).getTime();
  const end = new Date(dateFin).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return Math.ceil((end - start) / 86400000);
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
  const [reportsV2, setReportsV2] = useState<PmRapportMensuelDTO[]>([]);
  const [selectedForecastProject, setSelectedForecastProject] = useState(ALL_FORECAST_PROJECTS);
  const [forecastSourceLabel, setForecastSourceLabel] = useState<string | null>(null);
  const [forecast, setForecast] = useState<ResourceForecastResponse | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, reports] = await Promise.all([
        fetchPmDashboard(selAnnee, selMois),
        fetchPmRapportsV2().catch(() => [] as PmRapportMensuelDTO[]),
      ]);
      setData(d);
      setReportsV2(reports);
    } catch (e: any) {
      setError(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selAnnee, selMois]);

  const forecastProjectOptions = Array.from(
    new Set(reportsV2.flatMap(report => report.projetsConcernes).map(project => project.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'fr'));

  useEffect(() => {
    if (selectedForecastProject !== ALL_FORECAST_PROJECTS && !forecastProjectOptions.includes(selectedForecastProject)) {
      setSelectedForecastProject(ALL_FORECAST_PROJECTS);
    }
  }, [reportsV2, selectedForecastProject]);

  useEffect(() => {
    if (!data) {
      setForecast(null);
      setForecastSourceLabel(null);
      return;
    }

    const selectedPeriodLabel = `${MOIS_OPTIONS.find(m => m.value === selMois)?.label || `Mois ${selMois}`} ${selAnnee}`;
    const isAllProjects = selectedForecastProject === ALL_FORECAST_PROJECTS;
    const selectedScopeLabel = isAllProjects ? 'Tous les projets' : selectedForecastProject;
    const report = reportsV2.find(r => r.annee === selAnnee && r.mois === selMois);

    if (!report) {
      setForecast(null);
      setForecastSourceLabel(`${selectedPeriodLabel} — ${selectedScopeLabel}`);
      setForecastError(`Aucune donnée V2 pour ${selectedPeriodLabel}`);
      setForecastLoading(false);
      return;
    }

    const scopedAnomalies = isAllProjects
      ? report.anomalies
      : report.anomalies.filter(anomaly => projectMatches(anomaly.projetsConcernes || '', selectedForecastProject));
    const scopedProjects = isAllProjects
      ? report.projetsConcernes
      : report.projetsConcernes.filter(project => projectMatches(project, selectedForecastProject));
    const collaboratorCount = isAllProjects
      ? report.nombreCollaborateursConcernes
      : new Set(scopedAnomalies.map(anomaly => anomaly.collaborateur).filter(Boolean)).size;
    const nbConflits = isAllProjects ? report.nombreConflits : scopedAnomalies.filter(anomaly => anomaly.typeAnomalie === 'CONFLIT').length;
    const nbSurcharges = isAllProjects ? report.nombreSurcharges : scopedAnomalies.filter(anomaly => anomaly.typeAnomalie === 'SURCHARGE').length;
    const nbSousCharges = isAllProjects ? report.nombreSousCharges : scopedAnomalies.filter(anomaly => anomaly.typeAnomalie === 'SOUS_CHARGE').length;
    const nbAnomaliesTotal = isAllProjects ? report.nombreTotalAnomalies : scopedAnomalies.length;

    if (collaboratorCount === 0 && nbAnomaliesTotal === 0) {
      setForecast(null);
      setForecastSourceLabel(`${report.libellePeriode} — ${selectedScopeLabel}`);
      setForecastError(isAllProjects ? 'Données V2 insuffisantes pour la période sélectionnée' : 'Données V2 insuffisantes pour ce projet sur la période sélectionnée');
      setForecastLoading(false);
      return;
    }

    const durationProjectNames = scopedProjects.length > 0 ? scopedProjects : report.projetsConcernes;
    const matchingProjects = data.performanceProjets.filter(project =>
      durationProjectNames.some(reportProject => projectMatches(project.nom, reportProject))
    );
    const durationSource = matchingProjects.length > 0 ? matchingProjects : data.performanceProjets;
    const avgDuration = Math.round(average(
      durationSource.map(project => getProjectDurationDays(project.dateDebut, project.dateFin)).filter((duration): duration is number => duration != null),
      180
    ));
    const realisticDuration = avgDuration > 0 ? avgDuration : 180;
    const anomalyRates = scopedAnomalies.map(anomaly => anomaly.tauxCharge).filter(value => Number.isFinite(value) && value > 0);
    const chargeMoyenne = isAllProjects && report.allocationMoyenne != null
      ? report.allocationMoyenne
      : average(anomalyRates, nbAnomaliesTotal > 0 ? 100 : 85);
    const chargeMax = anomalyRates.length > 0 ? Math.max(...anomalyRates, chargeMoyenne) : chargeMoyenne;
    const contextLabel = `${report.libellePeriode} — ${selectedScopeLabel}`;

    setForecastLoading(true);
    setForecastError(null);
    setForecastSourceLabel(contextLabel);
    fetchResourceForecast({
      mois: report.mois,
      annee: report.annee,
      dureeProjetJours: realisticDuration,
      nbCollaborateursActuels: collaboratorCount,
      chargeMoyenne: Math.round(chargeMoyenne * 100) / 100,
      chargeMax: Math.round(chargeMax * 100) / 100,
      nbConflits,
      nbSurcharges,
      nbSousCharges,
      nbAnomaliesTotal,
      nbCollaborateursConcernes: collaboratorCount,
    })
      .then(setForecast)
      .catch(e => {
        setForecast(null);
        setForecastError(e.message || 'Prévision indisponible');
      })
      .finally(() => setForecastLoading(false));
  }, [data, reportsV2, selAnnee, selMois, selectedForecastProject]);

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

      <SectionCard
        title="Prévision IA"
        subtitle={forecastSourceLabel ? `Estimation basée sur ${forecastSourceLabel}` : 'Estimation basée sur les rapports V2'}
        accent="#14B8A6"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <select
              value={selectedForecastProject}
              onChange={event => setSelectedForecastProject(event.target.value)}
              style={{ ...selectStyle, maxWidth: '220px' }}
            >
              <option value={ALL_FORECAST_PROJECTS}>Tous les projets</option>
              {forecastProjectOptions.map(project => <option key={project} value={project}>{project}</option>)}
            </select>
            {forecast && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: ML_RISK_CFG[forecast.riskLevel].text, backgroundColor: ML_RISK_CFG[forecast.riskLevel].bg, border: `1px solid ${ML_RISK_CFG[forecast.riskLevel].dot}30`, padding: '2px 8px', borderRadius: R, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ML_RISK_CFG[forecast.riskLevel].dot }} />
                Risque {ML_RISK_CFG[forecast.riskLevel].label}
              </span>
            )}
          </div>
        }
      >
        <p style={{ fontSize: '12px', color: C.textMuted, fontWeight: 600, marginBottom: '12px' }}>
          Prédiction calculée à partir des collaborateurs concernés et des anomalies V2 du mois sélectionné, selon le périmètre projet choisi.
        </p>
        {forecastLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: 58, backgroundColor: C.borderLight, borderRadius: R }} />)}
          </div>
        ) : forecastError ? (
          <div style={{ padding: '12px', borderRadius: R, backgroundColor: '#FFFBEB', color: '#92400E', fontSize: '12px', fontWeight: 600 }}>
            {forecastError}
          </div>
        ) : forecast ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {[
              { label: 'Collaborateurs concernés', value: forecast.currentResources, sub: 'rapport V2 du mois', color: C.blue },
              { label: 'Besoin estimé mois prochain', value: forecast.predictedResources, sub: 'prévision IA', color: '#14B8A6' },
              { label: 'Variation estimée', value: `${forecast.difference >= 0 ? '+' : ''}${forecast.difference}`, sub: forecast.difference >= 0 ? 'ressources à anticiper' : 'marge estimée', color: forecast.difference > 0 ? C.red : C.green },
              { label: 'Niveau de risque', value: ML_RISK_CFG[forecast.riskLevel].label, sub: 'modèle ML', color: ML_RISK_CFG[forecast.riskLevel].dot },
            ].map(item => (
              <div key={item.label} style={{ padding: '12px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: C.white, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: R, backgroundColor: `${item.color}14`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles style={{ width: '17px', height: '17px' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '11px', color: C.textMuted, fontWeight: 600 }}>{item.label}</p>
                  <p style={{ fontSize: '20px', color: C.text, fontWeight: 800, lineHeight: 1.1 }}>{item.value}</p>
                  <p style={{ fontSize: '10px', color: item.color, fontWeight: 700 }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '12px', borderRadius: R, backgroundColor: C.bg, color: C.textMuted, fontSize: '12px', fontWeight: 600 }}>
            Aucune donnée suffisante pour calculer une prévision IA.
          </div>
        )}
      </SectionCard>

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
