import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Play, RefreshCw, TrendingUp, TrendingDown, AlertCircle, CheckCircle, ArrowRight, BarChart2, AlertTriangle, ChevronRight, XCircle, Loader2, RefreshCw as ResetIcon, UserMinus, UserPlus, MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { toast } from 'sonner';
import { C, R, S, PageHeader, SectionCard, SectionLabel, cardStyle } from '../components/ui/design-system';
import { useSimulationData } from './simulation/useSimulationData';
import { SousChargePanel } from './simulation/SousChargePanel';
import {
  fetchCollaborateursDisponiblesConflit,
  fetchSimulationConflitContext,
  type CollaborateurDisponibleConflit,
  type SimulationConflitContext,
  type SimulationRemplacementResponse,
  type SimulationSousChargeResponse,
} from '../services/simulationService';
import { createConversationFromSimulation } from '../services/conversationService';

const MOIS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, padding: '8px 12px', boxShadow: S.elevated, fontSize: '11px' }}>
      <p style={{ fontWeight: 700, color: C.text, marginBottom: '4px' }}>{label}</p>
      {payload.map((e: any, i: number) => <p key={i} style={{ color: e.fill, margin: '1px 0' }}>{e.name}: <strong>{e.value}%</strong></p>)}
    </div>
  );
};

export function Simulation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conflitIdParam = searchParams.get('conflitId');
  const conflitId = conflitIdParam ? Number(conflitIdParam) : null;
  const isConflictMode = !!conflitId;
  const {
    mode, switchMode,
    state, result, running, validated, error,
    setPeriod,
    runRemplacementSimulation,
    runConflitSimulation,
    runSousChargeSimulation,
    validate, cancel, reset,
  } = useSimulationData();

  const { conflits, sousCharges, projets, collaborateurs, rmId, loading, annee, mois } = state;

  const [anomalieId, setAnomalieId] = useState('');
  const [cibleId, setCibleId] = useState('');
  const [projId, setProjId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [alloc, setAlloc] = useState(100);
  const [conflictContext, setConflictContext] = useState<SimulationConflitContext | null>(null);
  const [availableCandidats, setAvailableCandidats] = useState<CollaborateurDisponibleConflit[]>([]);
  const [conflictLoading, setConflictLoading] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);

  // Auto-select first values when data loads for Remplacement
  useEffect(() => {
    if (mode === 'REMPLACEMENT' && conflits.length && !anomalieId) {
      setAnomalieId(String(conflits[0].id));
    }
  }, [conflits, mode]);

  useEffect(() => {
    if (mode === 'REMPLACEMENT' && collaborateurs.length && !cibleId) {
      const sous = collaborateurs.filter(c => c.tauxUtilisation < 80);
      if (sous.length) setCibleId(String(sous[0].id));
      else if (collaborateurs.length) setCibleId(String(collaborateurs[0].id));
    }
  }, [collaborateurs, mode]);

  useEffect(() => {
    if (!isConflictMode || !conflitId) return;

    setConflictLoading(true);
    switchMode('REMPLACEMENT');
    setAnomalieId(String(conflitId));
    setCibleId('');
    setProjId('');

    Promise.all([
      fetchSimulationConflitContext(conflitId),
      fetchCollaborateursDisponiblesConflit(conflitId),
    ])
      .then(([context, candidats]) => {
        setConflictContext(context);
        setAvailableCandidats(candidats);
        setStart(context.dateDebut);
        setEnd(context.dateFin);
        setAnomalieId(String(context.conflitId));
        if (candidats.length > 0) {
          setCibleId(String(candidats[0].id));
        }
        setPeriod(context.annee, context.mois);
      })
      .catch((e: any) => {
        toast.error(e.message || 'Impossible de charger le conflit');
        setConflictContext(null);
        setAvailableCandidats([]);
      })
      .finally(() => setConflictLoading(false));
  }, [conflitId]);

  const selectedAnomalie = conflits.find(a => String(a.id) === anomalieId);
  const selectedCandidatConflit = availableCandidats.find(c => String(c.id) === cibleId);
  const selectedCible = isConflictMode
    ? selectedCandidatConflit
    : collaborateurs.find(c => String(c.id) === cibleId);
  const sourceCollab = isConflictMode && conflictContext
    ? { id: conflictContext.collaborateurSourceId, matricule: conflictContext.matricule }
    : selectedAnomalie ? collaborateurs.find(c => c.matricule === selectedAnomalie.numeroEmploye) : null;

  // Auto-set project from anomalie's projects
  useEffect(() => {
    if (isConflictMode) return;
    if (selectedAnomalie && projets.length) {
      const projetNames = (selectedAnomalie.projetsConcernes || '').split(' | ').map(p => p.replace(/\s*\(\d+j\)/, '').trim());
      const match = projets.find(p => projetNames.includes(p.nom));
      if (match) setProjId(String(match.id));
    }
  }, [anomalieId, projets, isConflictMode]);

  // Auto-set dates from anomalie
  useEffect(() => {
    if (isConflictMode) return;
    if (selectedAnomalie?.conflitDateDebut) setStart(selectedAnomalie.conflitDateDebut);
    if (selectedAnomalie?.conflitDateFin) setEnd(selectedAnomalie.conflitDateFin);
  }, [anomalieId, isConflictMode]);

  const selectedProjet = projets.find(p => String(p.id) === projId);

  const runRemplacement = () => {
    if (isConflictMode) {
      if (!conflitId || !cibleId || !rmId) {
        toast.error('Veuillez choisir un remplaçant'); return;
      }
      toast.loading('Simulation du conflit en cours...', { id: 'sim' });
      runConflitSimulation({
        conflitId,
        collaborateurCibleId: Number(cibleId),
        resourceManagerId: rmId,
        pays: 'ma',
      }).then(() => toast.success('Simulation terminée !', { id: 'sim' }))
        .catch((e: any) => toast.error(e.message || 'Erreur', { id: 'sim' }));
      return;
    }

    if (!selectedAnomalie || !sourceCollab || !cibleId || !projId || !start || !end || !rmId) {
      toast.error('Veuillez remplir tous les champs'); return;
    }
    toast.loading('Simulation en cours…', { id: 'sim' });
    runRemplacementSimulation({
      anomalieId: selectedAnomalie.id,
      collaborateurSourceId: sourceCollab.id,
      collaborateurCibleId: Number(cibleId),
      projetId: Number(projId),
      dateDebut: start, dateFin: end,
      tauxAffectation: alloc,
      resourceManagerId: rmId,
      annee, mois, pays: 'ma',
    }).then(() => toast.success('Simulation terminée !', { id: 'sim' }))
      .catch((e: any) => toast.error(e.message || 'Erreur', { id: 'sim' }));
  };

  const handleValidate = () => {
    if (!result) return;
    if (isConflictMode) {
      toast.error('Une simulation issue d un conflit doit etre envoyee aux chefs de projet.');
      return;
    }
    toast.loading('Validation en cours…', { id: 'val' });
    validate(result.simulationId)
      .then(() => toast.success('Scénario validé et appliqué !', { id: 'val' }))
      .catch((e: any) => toast.error(e.message, { id: 'val' }));
  };

  const handleCancel = () => {
    if (!result) return;
    cancel(result.simulationId)
      .then(() => toast.info('Simulation annulée.'))
      .catch((e: any) => toast.error(e.message));
  };

  const handleReset = () => {
    reset();
    setAnomalieId(conflits.length ? String(conflits[0].id) : '');
    toast.info('Paramètres réinitialisés.');
  };

  const handleCreateConversation = async () => {
    if (!result) return;
    setCreatingConversation(true);
    try {
      const conversation = await createConversationFromSimulation(result.simulationId);
      toast.success('Proposition envoyee aux chefs de projet');
      navigate(`/conversations?conversationId=${conversation.id}`);
    } catch (e: any) {
      toast.error(e.message || 'Impossible de creer la conversation');
    } finally {
      setCreatingConversation(false);
    }
  };

  const isRemplacementResult = (res: any): res is SimulationRemplacementResponse => {
    return res && res.typeSimulation === 'REMPLACEMENT';
  };

  const chartData = isRemplacementResult(result) ? [
    { name: result.collaborateurSource.split(' ')[0], Avant: result.tauxSourceAvant, Après: result.tauxSourceApres },
    { name: result.collaborateurCible.split(' ')[0], Avant: result.tauxCibleAvant, Après: result.tauxCibleApres },
  ] : [];

  const inputStyle = { width: '100%', padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter' };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Simulation What-If" subtitle="Simulez des changements d'affectation pour résoudre les anomalies de staffing">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', backgroundColor: `${C.purple}10`, border: `1px solid ${C.purple}30`, borderRadius: R }}>
          <BarChart2 style={{ width: '13px', height: '13px', color: C.purple }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: C.purple }}>Module What-If</span>
        </div>
      </PageHeader>

      {/* Period & Tab selectors */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={mois} onChange={e => setPeriod(annee, Number(e.target.value))}
            style={{ padding: '6px 12px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', cursor: 'pointer' }}>
            {MOIS.slice(1).map((l, i) => <option key={i + 1} value={i + 1}>{l}</option>)}
          </select>
          <select value={annee} onChange={e => setPeriod(Number(e.target.value), mois)}
            style={{ padding: '6px 12px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', cursor: 'pointer' }}>
            {[2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {loading && <Loader2 style={{ width: '16px', height: '16px', color: C.purple, animation: 'spin 1s linear infinite' }} />}
          <span style={{ fontSize: '11px', color: C.textMuted }}>
            {mode === 'REMPLACEMENT' ? `${conflits.length} conflits/surcharges` : `${sousCharges.length} sous-charges/non-staffés`}
          </span>
        </div>

        {/* Tab switch buttons */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: C.borderLight, padding: '3px', borderRadius: R, border: `1px solid ${C.border}` }}>
          <button
            onClick={() => switchMode('REMPLACEMENT')}
            style={{
              padding: '6px 14px', fontSize: '11px', fontWeight: 700, borderRadius: R, border: 'none', cursor: 'pointer',
              backgroundColor: mode === 'REMPLACEMENT' ? C.white : 'transparent',
              color: mode === 'REMPLACEMENT' ? C.purple : C.textSecondary,
              boxShadow: mode === 'REMPLACEMENT' ? S.card : 'none',
              display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
            }}
          >
            <UserMinus style={{ width: '12px', height: '12px' }} />
            Remplacement Collaborateur
          </button>
          <button
            onClick={() => switchMode('SOUS_CHARGE')}
            style={{
              padding: '6px 14px', fontSize: '11px', fontWeight: 700, borderRadius: R, border: 'none', cursor: 'pointer',
              backgroundColor: mode === 'SOUS_CHARGE' ? C.white : 'transparent',
              color: mode === 'SOUS_CHARGE' ? C.blue : C.textSecondary,
              boxShadow: mode === 'SOUS_CHARGE' ? S.card : 'none',
              display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
            }}
          >
            <UserPlus style={{ width: '12px', height: '12px' }} />
            Staffer un Sous-Chargé
          </button>
        </div>
      </div>

      {mode === 'SOUS_CHARGE' ? (
        <SousChargePanel
          sousCharges={sousCharges}
          projets={projets}
          collaborateurs={collaborateurs}
          rmId={rmId}
          annee={annee}
          mois={mois}
          loading={loading}
          result={isRemplacementResult(result) ? null : (result as SimulationSousChargeResponse)}
          running={running}
          validated={validated}
          error={error}
          onRun={runSousChargeSimulation}
          onValidate={validate}
          onCancel={cancel}
          onReset={reset}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'start' }}>

          {/* ── LEFT CONFIG ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              {['Sélection', 'Projet', 'Période', 'Allocation'].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: R, backgroundColor: i === 0 ? C.purple : C.borderLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: i === 0 ? '#fff' : C.textMuted }}>{i + 1}</div>
                  <span style={{ fontSize: '10px', color: i === 0 ? C.purple : C.textMuted, fontWeight: i === 0 ? 700 : 400 }}>{s}</span>
                  {i < 3 && <ChevronRight style={{ width: '11px', height: '11px', color: C.textMuted }} />}
                </div>
              ))}
            </div>

            {/* Config card */}
            <div style={cardStyle}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.borderLight}` }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>Remplacement de Collaborateur</p>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Anomalie / Collaborateur source */}
                <div>
                  <SectionLabel>Anomalie (Collaborateur source)</SectionLabel>
                  {isConflictMode ? (
                    <div style={{ marginTop: '6px', padding: '8px 10px', borderRadius: R, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderLeft: `3px solid ${C.red}` }}>
                      {conflictLoading ? <p style={{ fontSize: '11px', color: C.textMuted }}>Chargement du conflit...</p> : conflictContext ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', gap: '8px' }}>
                            <div>
                              <p style={{ fontSize: '11px', fontWeight: 700, color: '#B91C1C' }}>{conflictContext.collaborateurSourceNomComplet}</p>
                              <p style={{ fontSize: '10px', color: '#DC2626' }}>#{conflictContext.matricule} · {conflictContext.joursEnConflit} jours en conflit</p>
                            </div>
                            <span style={{ fontSize: '15px', fontWeight: 800, color: C.red }}>{conflictContext.tauxCharge}%</span>
                          </div>
                          <p style={{ fontSize: '10px', color: '#991B1B', lineHeight: 1.4 }}>{conflictContext.description}</p>
                        </>
                      ) : <p style={{ fontSize: '11px', color: C.red }}>Conflit introuvable</p>}
                    </div>
                  ) : loading ? <p style={{ fontSize: '11px', color: C.textMuted }}>Chargement…</p> : (
                    <Select value={anomalieId} onValueChange={setAnomalieId}>
                      <SelectTrigger style={{ fontSize: '12px', borderRadius: R, height: '32px' }}><SelectValue placeholder="Sélectionner une anomalie" /></SelectTrigger>
                      <SelectContent>
                        {conflits.map(a => <SelectItem key={a.id} value={String(a.id)}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '10px', fontWeight: 700, color: C.red, backgroundColor: '#FEF2F2', padding: '1px 5px', borderRadius: '3px' }}>{a.typeAnomalie}</span>{a.collaborateurNom}</span></SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {!isConflictMode && selectedAnomalie && (
                    <div style={{ marginTop: '6px', padding: '8px 10px', borderRadius: R, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderLeft: `3px solid ${C.red}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div><p style={{ fontSize: '11px', fontWeight: 700, color: '#B91C1C' }}>{selectedAnomalie.collaborateurNom}</p><p style={{ fontSize: '10px', color: '#DC2626' }}>{selectedAnomalie.projetsConcernes}</p></div>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: C.red }}>{selectedAnomalie.tauxCharge}%</span>
                      </div>
                      <div style={{ height: '3px', borderRadius: '2px', backgroundColor: '#FECACA', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '2px', backgroundColor: C.red, width: `${Math.min(selectedAnomalie.tauxCharge, 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Collaborateur cible */}
                <div>
                  <SectionLabel>Collaborateur cible (remplaçant)</SectionLabel>
                  <Select value={cibleId} onValueChange={setCibleId}>
                    <SelectTrigger style={{ fontSize: '12px', borderRadius: R, height: '32px' }}><SelectValue placeholder="Sélectionner le remplaçant" /></SelectTrigger>
                    <SelectContent>
                      {(isConflictMode ? availableCandidats : collaborateurs.filter(c => !selectedAnomalie || c.matricule !== selectedAnomalie.numeroEmploye)).map(c => <SelectItem key={c.id} value={String(c.id)}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '10px', fontWeight: 700, color: '#D97706', backgroundColor: '#FFF7ED', padding: '1px 5px', borderRadius: '3px' }}>{Math.round(c.tauxUtilisation)}%</span>{c.prenom} {c.nom}</span></SelectItem>)}
                    </SelectContent>
                  </Select>
                  {isConflictMode && !conflictLoading && availableCandidats.length === 0 && (
                    <p style={{ fontSize: '11px', color: C.red, padding: '4px 8px', backgroundColor: '#FEF2F2', borderRadius: R, marginTop: '6px' }}>Aucun remplaçant compatible trouvé pour cette période.</p>
                  )}
                  {selectedCible && (
                    <div style={{ marginTop: '6px', padding: '8px 10px', borderRadius: R, backgroundColor: '#F0FDF4', border: '1px solid #A7F3D0', borderLeft: `3px solid ${C.green}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div><p style={{ fontSize: '11px', fontWeight: 700, color: '#065F46' }}>{selectedCible.prenom} {selectedCible.nom}</p><p style={{ fontSize: '10px', color: C.green }}>{selectedCible.poste}</p></div>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: C.green }}>{Math.round(selectedCible.tauxUtilisation)}%</span>
                      </div>
                      <div style={{ height: '3px', borderRadius: '2px', backgroundColor: '#A7F3D0', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '2px', backgroundColor: C.green, width: `${Math.min(selectedCible.tauxUtilisation, 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Projet */}
                <div>
                  <SectionLabel>{isConflictMode ? 'Projets en conflit' : 'Projet concerné'}</SectionLabel>
                  {isConflictMode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(conflictContext?.projetsConflit || []).map(p => (
                        <div key={p.projetId} style={{ padding: '8px 10px', borderRadius: R, backgroundColor: '#F5F3FF', border: `1px solid ${C.purple}30` }}>
                          <p style={{ fontSize: '11px', color: C.purple, fontWeight: 800 }}>{p.projetNom}</p>
                          <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>Chef : {p.chefProjetNomComplet || 'Non renseigné'} · {p.joursOuvrables}j ouvrables</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <Select value={projId} onValueChange={setProjId}>
                        <SelectTrigger style={{ fontSize: '12px', borderRadius: R, height: '32px' }}><SelectValue placeholder="Sélectionner un projet" /></SelectTrigger>
                        <SelectContent>{projets.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nom}</SelectItem>)}</SelectContent>
                      </Select>
                      {selectedProjet && <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '3px' }}>Chef : {selectedProjet.chefProjetNomComplet}</p>}
                    </>
                  )}
                </div>

                {!isConflictMode && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <SectionLabel>Taux d'affectation (%)</SectionLabel>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: C.purple }}>{alloc}%</span>
                    </div>
                    <input type="range" min="10" max={100} step="10" value={alloc}
                      onChange={e => setAlloc(Number(e.target.value))}
                      style={{ width: '100%', accentColor: C.purple, cursor: 'pointer' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: C.textMuted, marginTop: '3px' }}><span>10%</span><span>100%</span></div>
                  </div>
                )}

                {/* Period */}
                <div>
                  <SectionLabel>Période d'application</SectionLabel>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input type="date" value={start} onChange={e => setStart(e.target.value)} disabled={isConflictMode} style={{ ...inputStyle, backgroundColor: isConflictMode ? C.borderLight : '#fff' }} />
                    <ArrowRight style={{ width: '12px', height: '12px', color: C.textMuted, flexShrink: 0 }} />
                    <input type="date" value={end} onChange={e => setEnd(e.target.value)} disabled={isConflictMode} style={{ ...inputStyle, backgroundColor: isConflictMode ? C.borderLight : '#fff' }} />
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px', borderTop: `1px solid ${C.borderLight}` }}>
                  <button onClick={runRemplacement} disabled={running || validated || loading || conflictLoading}
                    style={{ width: '100%', padding: '9px', borderRadius: R, border: 'none', background: running || validated || conflictLoading ? C.borderLight : `linear-gradient(135deg, ${C.purple}, ${C.magenta})`, color: running || validated || conflictLoading ? C.textMuted : '#fff', cursor: running || validated || conflictLoading ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: running || validated || conflictLoading ? 'none' : `0 2px 8px ${C.purple}40` }}
                  >
                    {running ? <><Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />Simulation…</> : <><Play style={{ width: '13px', height: '13px' }} />Lancer la simulation</>}
                  </button>
                  {error && <p style={{ fontSize: '11px', color: C.red, padding: '4px 8px', backgroundColor: '#FEF2F2', borderRadius: R }}>{error}</p>}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {result && !validated && !isConflictMode && (
                      <button onClick={handleValidate} style={{ flex: 1, padding: '7px', borderRadius: R, border: 'none', backgroundColor: C.green, color: '#fff', cursor: 'pointer', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <CheckCircle style={{ width: '12px', height: '12px' }} />Valider
                      </button>
                    )}
                    {result && !validated && isConflictMode && isRemplacementResult(result) && result.resultat === 'POSITIF' && (
                      <button onClick={handleCreateConversation} disabled={creatingConversation} style={{ flex: 1, padding: '7px', borderRadius: R, border: 'none', backgroundColor: C.purple, color: '#fff', cursor: creatingConversation ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        {creatingConversation ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : <MessageSquare style={{ width: '12px', height: '12px' }} />}Envoyer aux chefs
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

            {/* Precautions */}
            <div style={{ padding: '10px 12px', borderRadius: R, backgroundColor: '#FFFBEB', border: `1px solid #FDE68A`, borderLeft: `3px solid #F59E0B` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle style={{ width: '13px', height: '13px', color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', marginBottom: '5px' }}>Précautions</p>
                  <ul style={{ fontSize: '11px', color: '#92400E', lineHeight: 1.6, paddingLeft: '12px' }}>
                    <li>Valisez la disponibilité réelle</li>
                    <li>Consultez les chefs de projet</li>
                    <li>Vérifiez les impacts délais</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT RESULTS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {!result && !running && (
              <div style={{ ...cardStyle, padding: '64px 24px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: R, backgroundColor: `${C.purple}10`, border: `1px solid ${C.purple}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <BarChart2 style={{ width: '26px', height: '26px', color: C.purple }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>Aucune simulation lancée</p>
                <p style={{ fontSize: '12px', color: C.textMuted, maxWidth: '280px', margin: '0 auto' }}>Configurez le scénario à gauche puis lancez la simulation pour visualiser les résultats Avant / Après.</p>
              </div>
            )}

            {running && (
              <div style={{ ...cardStyle, padding: '64px 24px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `4px solid ${C.borderLight}`, borderTop: `4px solid ${C.purple}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Simulation en cours…</p>
                <p style={{ fontSize: '12px', color: C.textMuted }}>Calcul de l'impact de la réaffectation</p>
              </div>
            )}

            {isRemplacementResult(result) && !running && (
              <>
                {isConflictMode && conflictContext && (
                  <div style={{ padding: '12px 16px', borderRadius: R, backgroundColor: '#F5F3FF', border: `1px solid ${C.purple}30`, borderLeft: `4px solid ${C.purple}`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase' }}>Collaborateur source</p>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: C.purple, marginTop: '3px' }}>{conflictContext.collaborateurSourceNomComplet}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase' }}>Projets en conflit</p>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginTop: '3px' }}>{conflictContext.projetsConflit.map(p => p.projetNom).join(', ')}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase' }}>Période conflit</p>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginTop: '3px' }}>{conflictContext.dateDebut} → {conflictContext.dateFin}</p>
                    </div>
                  </div>
                )}
                {/* Status Banner */}
                <div style={{ padding: '12px 16px', borderRadius: R, backgroundColor: result.conflitCorrige ? '#ECFDF5' : '#FFFBEB', border: `1px solid ${result.conflitCorrige ? '#A7F3D0' : '#FDE68A'}`, borderLeft: `4px solid ${result.conflitCorrige ? C.green : '#F59E0B'}`, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: R, backgroundColor: result.conflitCorrige ? '#D1FAE5' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {result.conflitCorrige ? <CheckCircle style={{ width: '18px', height: '18px', color: C.green }} /> : <AlertTriangle style={{ width: '18px', height: '18px', color: '#D97706' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: result.conflitCorrige ? '#065F46' : '#92400E' }}>
                        {result.conflitCorrige ? '✓ Conflit résolu avec succès' : '⚠ Conflit partiellement résolu'}
                      </p>
                      {validated && <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', backgroundColor: C.green, padding: '1px 8px', borderRadius: '3px' }}>Validé &amp; Appliqué</span>}
                    </div>
                    <p style={{ fontSize: '12px', color: result.conflitCorrige ? '#047857' : '#B45309' }}>{result.commentaire}</p>
                  </div>
                </div>

                {/* Chart comparison */}
                <SectionCard title="Tableau Comparatif Avant / Après" subtitle="Impact sur les taux de charge" accent={C.magenta}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    {[
                      { name: result.collaborateurSource, before: result.tauxSourceAvant, after: result.tauxSourceApres, jAvant: result.joursSourceAvant, jApres: result.joursSourceApres, etat: result.etatSourceApres },
                      { name: result.collaborateurCible, before: result.tauxCibleAvant, after: result.tauxCibleApres, jAvant: result.joursCibleAvant, jApres: result.joursCibleApres, etat: result.etatCibleApres },
                    ].map((r, i) => {
                      const isGood = r.after >= 70 && r.after <= 100;
                      const isOver = r.after > 100;
                      return (
                        <div key={i}>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', marginBottom: '8px' }}>{r.name.split(' ').slice(0, 2).join(' ')}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div style={{ padding: '10px', borderRadius: R, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', textAlign: 'center' }}>
                              <p style={{ fontSize: '10px', color: '#DC2626', marginBottom: '2px' }}>Avant</p>
                              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: C.red, lineHeight: 1 }}>{Math.round(r.before)}%</p>
                              <p style={{ fontSize: '9px', color: C.textMuted }}>{r.jAvant}j</p>
                            </div>
                            <div style={{ padding: '10px', borderRadius: R, backgroundColor: isGood ? '#ECFDF5' : '#FFF7ED', border: `1px solid ${isGood ? '#A7F3D0' : '#FDE68A'}`, textAlign: 'center' }}>
                              <p style={{ fontSize: '10px', color: isGood ? C.green : '#D97706', marginBottom: '2px' }}>Après</p>
                              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: isGood ? C.green : isOver ? C.red : '#D97706', lineHeight: 1 }}>{Math.round(r.after)}%</p>
                              <p style={{ fontSize: '9px', color: C.textMuted }}>{r.jApres}j · {r.etat}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '6px' }}>
                            {r.after < r.before ? <TrendingDown style={{ width: '12px', height: '12px', color: C.green }} /> : <TrendingUp style={{ width: '12px', height: '12px', color: C.blue }} />}
                            <span style={{ fontSize: '11px', fontWeight: 700, color: r.after < r.before ? C.green : C.blue }}>{r.after < r.before ? '' : '+'}{Math.round(r.after - r.before)}% de charge</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} barSize={28} barCategoryGap="40%" margin={{ top: 4, right: 40, bottom: 0, left: -16 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke={C.borderLight} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip content={<CT />} />
                      <ReferenceLine y={100} stroke={C.red} strokeDasharray="4 3" strokeWidth={1} label={{ value: '100%', position: 'right', fontSize: 9, fill: C.red }} />
                      <ReferenceLine y={90} stroke={C.green} strokeDasharray="4 3" strokeWidth={1} label={{ value: '90%', position: 'right', fontSize: 9, fill: C.green }} />
                      <Bar dataKey="Avant" fill={C.red} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Après" fill={C.green} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
                    {[{ c: C.red, l: 'Avant' }, { c: C.green, l: 'Après' }].map(i => <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: C.textMuted }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: i.c }} />{i.l}</div>)}
                  </div>
                </SectionCard>

                {/* Indicators */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  {[
                    { l: 'Conflit corrigé', v: result.conflitCorrige ? '✓ Oui' : '✗ Non', good: result.conflitCorrige },
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
                <div style={{ padding: '12px 16px', borderRadius: R, backgroundColor: result.conflitCorrige ? '#ECFDF5' : '#FFFBEB', border: `1px solid ${result.conflitCorrige ? '#A7F3D0' : '#FDE68A'}`, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle style={{ width: '14px', height: '14px', color: result.conflitCorrige ? C.green : '#D97706', flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: result.conflitCorrige ? '#065F46' : '#92400E', marginBottom: '3px' }}>Recommandation du système</p>
                    <p style={{ fontSize: '12px', color: result.conflitCorrige ? '#047857' : '#B45309', marginBottom: '8px' }}>{result.commentaire}</p>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px', backgroundColor: result.conflitCorrige ? '#D1FAE5' : '#FEF3C7', color: result.conflitCorrige ? '#065F46' : '#92400E' }}>
                      Résultat : {result.resultat} · Simulation #{result.simulationId}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}