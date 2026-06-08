import { useState, useEffect } from 'react';
import { Play, RefreshCw, TrendingUp, TrendingDown, CheckCircle, ArrowRight, AlertCircle, AlertTriangle, XCircle, Loader2, UserPlus, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { toast } from 'sonner';
import { C, R, S, SectionLabel, SectionCard, cardStyle } from '../../components/ui/design-system';
import { fetchAffectationsCollab } from '../../services/anomalieV2Service';
import type { SimulationSousChargeResponse } from '../../services/simulationService';
import type { AnomalieV2DTO } from '../../services/anomalieV2Service';
import type { RmProjetDTO, RmResourceDTO } from '../../services/resourceManagerService';
import type { SimulationSousChargeRequest } from '../../services/simulationService';

interface Props {
  sousCharges: AnomalieV2DTO[];
  projets: RmProjetDTO[];
  collaborateurs: RmResourceDTO[];
  rmId: number | null;
  annee: number;
  mois: number;
  loading: boolean;
  result: SimulationSousChargeResponse | null;
  running: boolean;
  validated: boolean;
  error: string | null;
  onRun: (req: SimulationSousChargeRequest) => Promise<void>;
  onValidate: (id: number) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
  onReset: () => void;
}

const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, padding: '8px 12px', boxShadow: S.elevated, fontSize: '11px' }}>
      <p style={{ fontWeight: 700, color: C.text, marginBottom: '4px' }}>{label}</p>
      {payload.map((e: any, i: number) => <p key={i} style={{ color: e.fill, margin: '1px 0' }}>{e.name}: <strong>{e.value}%</strong></p>)}
    </div>
  );
};

export function SousChargePanel({ sousCharges, projets, collaborateurs, rmId, annee, mois, loading, result, running, validated, error, onRun, onValidate, onCancel, onReset }: Props) {
  const [anomalieId, setAnomalieId] = useState('');
  const [projId, setProjId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [affectations, setAffectations] = useState<{ projetNom: string; dateDebut: string; dateFin: string; tauxAffectation: number }[]>([]);

  useEffect(() => { if (sousCharges.length && !anomalieId) setAnomalieId(String(sousCharges[0].id)); }, [sousCharges]);

  const selectedAnomalie = sousCharges.find(a => String(a.id) === anomalieId);
  const cibleCollab = selectedAnomalie ? collaborateurs.find(c => c.matricule === selectedAnomalie.numeroEmploye) : null;

  useEffect(() => {
    if (cibleCollab?.matricule) {
      fetchAffectationsCollab(cibleCollab.matricule, annee, mois)
        .then(setAffectations)
        .catch(() => setAffectations([]));
    } else {
      setAffectations([]);
    }
  }, [cibleCollab, annee, mois]);

  // Calendar calculations
  const daysInMonth = new Date(annee, mois, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const isWknd = (d: number) => [0, 6].includes(new Date(annee, mois - 1, d).getDay());
  const firstDayIndex = (new Date(annee, mois - 1, 1).getDay() + 6) % 7;
  const paddingCells = Array.from({ length: firstDayIndex }, (_, i) => i);

  const dailyLoad: Record<number, number> = {};
  affectations.forEach(aff => {
    const debut = new Date(aff.dateDebut);
    const fin = new Date(aff.dateFin);
    const monthStart = new Date(annee, mois - 1, 1);
    const monthEnd = new Date(annee, mois - 1, daysInMonth);
    const effectiveStart = debut < monthStart ? monthStart : debut;
    const effectiveEnd = fin > monthEnd ? monthEnd : fin;
    const startDay = effectiveStart.getDate();
    const endDay = effectiveEnd.getDate();
    for (let d = startDay; d <= endDay; d++) {
      if (!isWknd(d)) {
        dailyLoad[d] = (dailyLoad[d] || 0) + aff.tauxAffectation;
      }
    }
  });

  const startDayNum = start ? Number(start.split('-')[2]) : null;
  const endDayNum = end ? Number(end.split('-')[2]) : null;

  const formatDateStr = (dayNum: number) => {
    const mm = String(mois).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${annee}-${mm}-${dd}`;
  };

  const handleDayClick = (d: number) => {
    if (isWknd(d)) return;
    const dateStr = formatDateStr(d);
    if (!start || (start && end)) {
      setStart(dateStr);
      setEnd('');
    } else {
      const startDate = new Date(start);
      const clickedDate = new Date(dateStr);
      if (clickedDate >= startDate) {
        setEnd(dateStr);
      } else {
        setStart(dateStr);
        setEnd('');
      }
    }
  };

  const getDayStyle = (d: number) => {
    const isWeekend = isWknd(d);
    const load = dailyLoad[d] || 0;
    const avail = Math.max(0, 100 - load);
    const isSelected = startDayNum && (
      endDayNum ? (d >= startDayNum && d <= endDayNum) : (d === startDayNum)
    );

    const baseStyle: React.CSSProperties = {
      aspectRatio: '1',
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: 700,
      cursor: isWeekend ? 'not-allowed' : 'pointer',
      transition: 'all 0.15s',
      userSelect: 'none',
      border: isSelected ? `2px solid ${C.blue}` : '1px solid transparent',
    };

    if (isWeekend) {
      return {
        ...baseStyle,
        backgroundColor: '#F3F4F6',
        color: '#9CA3AF',
      };
    }

    if (avail === 100) {
      return {
        ...baseStyle,
        backgroundColor: '#ECFDF5',
        color: '#065F46',
        border: isSelected ? `2px solid ${C.blue}` : '1px solid #A7F3D0',
      };
    } else if (avail > 0) {
      return {
        ...baseStyle,
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
        border: isSelected ? `2px solid ${C.blue}` : '1px solid #BFDBFE',
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: '#FEF2F2',
        color: '#B91C1C',
        border: isSelected ? `2px solid ${C.blue}` : '1px solid #FECACA',
      };
    }
  };

  const run = () => {
    if (!selectedAnomalie || !cibleCollab || !projId || !start || !end || !rmId) {
      toast.error('Veuillez remplir tous les champs'); return;
    }
    toast.loading('Simulation en cours…', { id: 'sim-sc' });
    onRun({
      anomalieId: selectedAnomalie.id,
      collaborateurCibleId: cibleCollab.id,
      projetId: Number(projId),
      dateDebut: start, dateFin: end,
      tauxAffectation: 100, // Fixed 100% allocation rate as requested
      resourceManagerId: rmId,
      annee, mois, pays: 'ma',
    }).then(() => toast.success('Simulation terminée !', { id: 'sim-sc' }))
      .catch((e: any) => toast.error(e.message || 'Erreur', { id: 'sim-sc' }));
  };

  const handleValidate = () => {
    if (!result) return;
    toast.loading('Validation…', { id: 'val-sc' });
    onValidate(result.simulationId)
      .then(() => toast.success('Scénario validé et appliqué !', { id: 'val-sc' }))
      .catch((e: any) => toast.error(e.message, { id: 'val-sc' }));
  };

  const handleCancel = () => {
    if (!result) return;
    onCancel(result.simulationId).then(() => toast.info('Simulation annulée.')).catch((e: any) => toast.error(e.message));
  };

  const handleReset = () => {
    onReset();
    setAnomalieId(sousCharges.length ? String(sousCharges[0].id) : '');
    setStart('');
    setEnd('');
    toast.info('Réinitialisé.');
  };

  const chartData = result ? [
    { name: result.collaborateurCible.split(' ')[0], Avant: result.tauxCibleAvant, Après: result.tauxCibleApres },
  ] : [];

  const inputStyle = { width: '100%', padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter' };

  const isPositif = result?.resultat === 'POSITIF';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '16px', alignItems: 'start' }}>
      {/* LEFT CONFIG */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={cardStyle}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.borderLight}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus style={{ width: '14px', height: '14px', color: C.blue }} />
              <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>Affecter un Sous-Chargé</p>
            </div>
            <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>Ajouter un collaborateur sous-chargé à un projet</p>
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Anomalie selection */}
            <div>
              <SectionLabel>Anomalie (Collaborateur sous-chargé)</SectionLabel>
              {loading ? <p style={{ fontSize: '11px', color: C.textMuted }}>Chargement…</p> : (
                <Select value={anomalieId} onValueChange={val => { setAnomalieId(val); setStart(''); setEnd(''); }}>
                  <SelectTrigger style={{ fontSize: '12px', borderRadius: R, height: '32px' }}><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {sousCharges.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: a.typeAnomalie === 'NON_STAFFE' ? C.textMuted : C.orange, backgroundColor: a.typeAnomalie === 'NON_STAFFE' ? '#F3F4F6' : '#FFF7ED', padding: '1px 5px', borderRadius: '3px' }}>{a.typeAnomalie}</span>
                          {a.collaborateurNom}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedAnomalie && (
                <div style={{ marginTop: '6px', padding: '8px 10px', borderRadius: R, backgroundColor: '#FFF7ED', border: '1px solid #FDE68A', borderLeft: `3px solid ${C.orange}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div><p style={{ fontSize: '11px', fontWeight: 700, color: '#92400E' }}>{selectedAnomalie.collaborateurNom}</p><p style={{ fontSize: '10px', color: C.orange }}>{selectedAnomalie.typeAnomalie === 'NON_STAFFE' ? 'Aucun projet' : selectedAnomalie.projetsConcernes}</p></div>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: C.orange }}>{selectedAnomalie.tauxCharge}%</span>
                  </div>
                  <div style={{ height: '3px', borderRadius: '2px', backgroundColor: '#FDE68A', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: C.orange, width: `${Math.min(Math.max(selectedAnomalie.tauxCharge, 2), 100)}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Projet */}
            <div>
              <SectionLabel>Projet à affecter</SectionLabel>
              <Select value={projId} onValueChange={setProjId}>
                <SelectTrigger style={{ fontSize: '12px', borderRadius: R, height: '32px' }}><SelectValue placeholder="Sélectionner un projet" /></SelectTrigger>
                <SelectContent>{projets.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nom}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Calendar Availability Grid */}
            {cibleCollab && (
              <div>
                <SectionLabel>Jours disponibles ce mois (Cliquer pour définir la période)</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', margin: '8px 0' }}>
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
                    <div key={idx} style={{ textAlign: 'center', fontSize: '9px', fontWeight: 800, color: C.textMuted, paddingBottom: '2px' }}>{day}</div>
                  ))}
                  {paddingCells.map(idx => (
                    <div key={`pad-${idx}`} style={{ backgroundColor: 'transparent' }} />
                  ))}
                  {days.map(d => {
                    const style = getDayStyle(d);
                    const load = dailyLoad[d] || 0;
                    const avail = Math.max(0, 100 - load);
                    const label = isWknd(d) ? '' : `${avail}%`;
                    return (
                      <div
                        key={d}
                        onClick={() => handleDayClick(d)}
                        style={style}
                        title={isWknd(d) ? 'Weekend' : `Disponibilité: ${avail}%`}
                      >
                        <span>{d}</span>
                        {label && <span style={{ fontSize: '7px', opacity: 0.85, fontWeight: 600 }}>{label}</span>}
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', fontSize: '9px', color: C.textMuted }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }} />100% Libre</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }} />Partiel</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }} />Occupé</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F3F4F6' }} />W.E.</div>
                </div>
              </div>
            )}

            {/* Period Inputs */}
            <div>
              <SectionLabel>Période d'application</SectionLabel>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="date" value={start} onChange={e => setStart(e.target.value)} style={inputStyle} />
                <ArrowRight style={{ width: '12px', height: '12px', color: C.textMuted, flexShrink: 0 }} />
                <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px', borderTop: `1px solid ${C.borderLight}` }}>
              <button onClick={run} disabled={running || validated || loading}
                style={{ width: '100%', padding: '9px', borderRadius: R, border: 'none', background: running || validated ? C.borderLight : `linear-gradient(135deg, ${C.blue}, ${C.cyan})`, color: running || validated ? C.textMuted : '#fff', cursor: running || validated ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: running || validated ? 'none' : `0 2px 8px ${C.blue}40` }}>
                {running ? <><Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />Simulation…</> : <><Play style={{ width: '13px', height: '13px' }} />Lancer la simulation</>}
              </button>
              {error && <p style={{ fontSize: '11px', color: C.red, padding: '4px 8px', backgroundColor: '#FEF2F2', borderRadius: R }}>{error}</p>}
              <div style={{ display: 'flex', gap: '6px' }}>
                {result && !validated && (
                  <button onClick={handleValidate} disabled={result.resultat === 'NEGATIF'} style={{ flex: 1, padding: '7px', borderRadius: R, border: 'none', backgroundColor: result.resultat === 'NEGATIF' ? '#D1D5DB' : C.green, color: '#fff', cursor: result.resultat === 'NEGATIF' ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <CheckCircle style={{ width: '12px', height: '12px' }} />Valider
                  </button>
                )}
                {result && !validated && (
                  <button onClick={handleCancel} style={{ flex: 1, padding: '7px', borderRadius: R, border: `1px solid ${C.red}`, backgroundColor: '#FEF2F2', color: C.red, cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <XCircle style={{ width: '12px', height: '12px' }} />Annuler
                  </button>
                )}
                <button onClick={handleReset} style={{ flex: 1, padding: '7px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.textSecondary, cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <RefreshCw style={{ width: '12px', height: '12px' }} />Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '10px 12px', borderRadius: R, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderLeft: `3px solid ${C.blue}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertCircle style={{ width: '13px', height: '13px', color: C.blue, flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', marginBottom: '5px' }}>Module Sous-Charge</p>
              <ul style={{ fontSize: '11px', color: '#1E40AF', lineHeight: 1.6, paddingLeft: '12px' }}>
                <li>Affiche les jours disponibles restants</li>
                <li>Cliquez sur les jours du calendrier pour définir les dates</li>
                <li>Pas de saisie manuelle de taux (100% par défaut)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT RESULTS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {!result && !running && (
          <div style={{ ...cardStyle, padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: R, backgroundColor: `${C.blue}10`, border: `1px solid ${C.blue}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <UserPlus style={{ width: '26px', height: '26px', color: C.blue }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>Aucune simulation lancée</p>
            <p style={{ fontSize: '12px', color: C.textMuted, maxWidth: '300px', margin: '0 auto' }}>Sélectionnez un collaborateur sous-chargé, un projet et une période (via le calendrier), puis lancez la simulation.</p>
          </div>
        )}

        {running && (
          <div style={{ ...cardStyle, padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `4px solid ${C.borderLight}`, borderTop: `4px solid ${C.blue}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Simulation en cours…</p>
            <p style={{ fontSize: '12px', color: C.textMuted }}>Calcul de l'impact de l'affectation</p>
          </div>
        )}

        {result && !running && (
          <>
            {/* Status Banner */}
            <div style={{ padding: '12px 16px', borderRadius: R, backgroundColor: isPositif ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${isPositif ? '#A7F3D0' : '#FECACA'}`, borderLeft: `4px solid ${isPositif ? C.green : C.red}`, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: R, backgroundColor: isPositif ? '#D1FAE5' : '#FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isPositif ? <CheckCircle style={{ width: '18px', height: '18px', color: C.green }} /> : <AlertTriangle style={{ width: '18px', height: '18px', color: C.red }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: isPositif ? '#065F46' : '#991B1B' }}>
                    {isPositif ? '✓ Affectation recommandée' : '✗ Affectation déconseillée'}
                  </p>
                  {validated && <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', backgroundColor: C.green, padding: '1px 8px', borderRadius: '3px' }}>Validé &amp; Appliqué</span>}
                </div>
                <p style={{ fontSize: '12px', color: isPositif ? '#047857' : '#B91C1C' }}>{result.commentaire}</p>
              </div>
            </div>

            {/* Before/After Card */}
            <SectionCard title="Impact sur le Collaborateur" subtitle="Comparaison Avant / Après affectation" accent={C.blue}>
              <div style={{ maxWidth: '360px', margin: '0 auto 20px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', marginBottom: '8px' }}>{result.collaborateurCible}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '12px', borderRadius: R, backgroundColor: '#FFF7ED', border: '1px solid #FDE68A', textAlign: 'center' }}>
                    <p style={{ fontSize: '10px', color: C.orange, marginBottom: '2px' }}>Avant</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: C.orange, lineHeight: 1 }}>{Math.round(result.tauxCibleAvant)}%</p>
                    <p style={{ fontSize: '9px', color: C.textMuted, marginTop: '2px' }}>{result.joursCibleAvant}j · {result.etatCibleAvant}</p>
                  </div>
                  <div style={{ padding: '12px', borderRadius: R, backgroundColor: isPositif ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${isPositif ? '#A7F3D0' : '#FECACA'}`, textAlign: 'center' }}>
                    <p style={{ fontSize: '10px', color: isPositif ? C.green : C.red, marginBottom: '2px' }}>Après</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: isPositif ? C.green : C.red, lineHeight: 1 }}>{Math.round(result.tauxCibleApres)}%</p>
                    <p style={{ fontSize: '9px', color: C.textMuted, marginTop: '2px' }}>{result.joursCibleApres}j · {result.etatCibleApres}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '8px' }}>
                  <TrendingUp style={{ width: '12px', height: '12px', color: C.blue }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: C.blue }}>+{Math.round(result.tauxCibleApres - result.tauxCibleAvant)}% de charge</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barSize={40} margin={{ top: 4, right: 40, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke={C.borderLight} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip content={<CT />} />
                  <ReferenceLine y={100} stroke={C.red} strokeDasharray="4 3" strokeWidth={1} label={{ value: '100%', position: 'right', fontSize: 9, fill: C.red }} />
                  <Bar dataKey="Avant" fill={C.orange} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Après" fill={isPositif ? C.green : C.red} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
                {[{ c: C.orange, l: 'Avant' }, { c: isPositif ? C.green : C.red, l: 'Après' }].map(i => <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: C.textMuted }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: i.c }} />{i.l}</div>)}
              </div>
            </SectionCard>

            {/* Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              {[
                { l: 'Sous-charge réduite', v: result.sousChargeReduite ? '✓ Oui' : '✗ Non', good: result.sousChargeReduite },
                { l: 'Nouvelle surcharge', v: result.nouvelleSurcharge ? '✗ Oui' : '✓ Non', good: !result.nouvelleSurcharge },
                { l: 'Nouveau conflit', v: result.nouveauConflit ? '✗ Oui' : '✓ Non', good: !result.nouveauConflit },
              ].map((ind, i) => (
                <div key={i} style={{ ...cardStyle, borderLeft: `3px solid ${ind.good ? C.green : C.red}`, padding: '12px 14px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{ind.l}</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: ind.good ? C.green : C.red }}>{ind.v}</p>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div style={{ padding: '12px 16px', borderRadius: R, backgroundColor: isPositif ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${isPositif ? '#A7F3D0' : '#FECACA'}`, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle style={{ width: '14px', height: '14px', color: isPositif ? C.green : C.red, flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: isPositif ? '#065F46' : '#991B1B', marginBottom: '3px' }}>Recommandation du système</p>
                <p style={{ fontSize: '12px', color: isPositif ? '#047857' : '#B91C1C', marginBottom: '8px' }}>{result.commentaire}</p>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px', backgroundColor: isPositif ? '#D1FAE5' : '#FECACA', color: isPositif ? '#065F46' : '#991B1B' }}>
                  Résultat : {result.resultat} · Simulation #{result.simulationId}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
