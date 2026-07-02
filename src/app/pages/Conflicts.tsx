import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, Search, Mail, UserPlus, Eye, AlertCircle, TrendingUp, TrendingDown, Calendar, Users, CheckCircle, ArrowRight, ChevronLeft, ChevronRight, Clock, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { C, S, R, PageHeader, BtnPrimary, BtnGhost, Avatar, Modal, ModalHeader, SectionLabel, cardStyle } from '../components/ui/design-system';
import { fetchAnomaliesV2, lancerDetectionV2, type AnomalieV2DTO } from '../services/anomalieV2Service';

/* ─── SEVERITY MAPPING ─── */
function getSeverity(a: AnomalieV2DTO): { key: string; label: string; bg: string; text: string; border: string; bar: string } {
  if (a.typeAnomalie === 'CONFLIT' || a.tauxCharge > 150) return { key: 'critical', label: 'Critique', bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', bar: C.red };
  if (a.typeAnomalie === 'SURCHARGE' || a.tauxCharge > 100) return { key: 'high', label: 'Élevée', bg: '#FFF7ED', text: '#92400E', border: '#FDE68A', bar: '#F59E0B' };
  if (a.tauxCharge >= 50) return { key: 'medium', label: 'Moyenne', bg: '#FFFBEB', text: '#92400E', border: '#FEF3C7', bar: '#F59E0B' };
  return { key: 'low', label: 'Faible', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', bar: C.blue };
}

function getTypeLabel(a: AnomalieV2DTO): { label: string; isSurcharge: boolean } {
  if (a.typeAnomalie === 'CONFLIT' || a.typeAnomalie === 'SURCHARGE') return { label: 'Surcharge', isSurcharge: true };
  return { label: 'Sous-utilisation', isSurcharge: false };
}

/** Parse "projet X (Nj) | projet Y (Mj)" into structured project array */
function parseProjects(a: AnomalieV2DTO): { name: string; charge: number; color: string }[] {
  if (!a.projetsConcernes) return [];
  const colors = [C.purple, C.blue, '#F59E0B', C.green, C.red, '#8B5CF6'];
  return a.projetsConcernes.split(' | ').map((p, i) => {
    const match = p.match(/^(.+?)\s*\((\d+)j\)$/);
    if (match) return { name: match[1].trim(), charge: parseInt(match[2]), color: colors[i % colors.length] };
    return { name: p, charge: 0, color: colors[i % colors.length] };
  });
}

const MOIS_LABELS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

/* ─── DETAIL MODAL ─── */
function DetailModal({ anomalie, onClose, onNotify, notified }: {
  anomalie: AnomalieV2DTO; onClose: () => void; onNotify: () => void; notified: boolean;
}) {
  const sev = getSeverity(anomalie);
  const { isSurcharge } = getTypeLabel(anomalie);
  const projects = parseProjects(anomalie);
  const capacite = anomalie.capaciteMensuelle || 21;

  // Fetch real affectation dates from API
  const [affectations, setAffectations] = useState<{ projetNom: string; dateDebut: string; dateFin: string; tauxAffectation: number }[]>([]);
  useEffect(() => {
    if (anomalie.numeroEmploye) {
      import('../services/anomalieV2Service').then(mod => {
        mod.fetchAffectationsCollab(anomalie.numeroEmploye, anomalie.annee, anomalie.mois)
          .then(setAffectations)
          .catch(() => setAffectations([]));
      });
    }
  }, [anomalie.numeroEmploye, anomalie.annee, anomalie.mois]);

  // Calendar days
  const daysInMonth = new Date(anomalie.annee, anomalie.mois, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const isWknd = (d: number) => [0, 6].includes(new Date(anomalie.annee, anomalie.mois - 1, d).getDay());

  // Build project bars from real affectation dates
  const colors = [C.purple, C.blue, '#F59E0B', C.green, C.red, '#8B5CF6'];
  const projectBars = affectations.map((aff, i) => {
    const debut = new Date(aff.dateDebut);
    const fin = new Date(aff.dateFin);
    // Clamp to the current month
    const monthStart = new Date(anomalie.annee, anomalie.mois - 1, 1);
    const monthEnd = new Date(anomalie.annee, anomalie.mois - 1, daysInMonth);
    const effectiveStart = debut < monthStart ? monthStart : debut;
    const effectiveEnd = fin > monthEnd ? monthEnd : fin;
    const startDay = effectiveStart.getDate();
    const endDay = effectiveEnd.getDate();
    const dur = endDay - startDay + 1;
    return { name: aff.projetNom, startDay, endDay, dur, color: colors[i % colors.length], dateDebut: aff.dateDebut, dateFin: aff.dateFin };
  });

  // Calculate daily load (count projects active on each day)
  const dailyLoad: Record<number, number> = {};
  projectBars.forEach(p => {
    for (let d = p.startDay; d <= p.endDay; d++) {
      if (!isWknd(d)) {
        dailyLoad[d] = (dailyLoad[d] || 0) + 1;
      }
    }
  });

  // Alternative resources (only for surcharges)
  const altResources = [
    { name: 'Khalid Bennani', dispo: 60, role: 'Tech Lead', color: C.purple },
    { name: 'Amina Tazi', dispo: 80, role: 'Business Analyst', color: C.blue },
    { name: 'Omar Idrissi', dispo: 40, role: 'Dev Senior', color: C.green },
    { name: 'Houda Lahlou', dispo: 70, role: 'Data Engineer', color: '#F59E0B' },
  ];

  return (
    <Modal onClose={onClose} maxWidth="900px" accentColor={sev.bar}>
      <ModalHeader title={`Détails — ${anomalie.collaborateurNom}`} subtitle={`${anomalie.numeroEmploye} · ${MOIS_LABELS[anomalie.mois]} ${anomalie.annee}`} onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Key metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
          {[
            { l: 'Collaborateur', v: anomalie.collaborateurNom },
            { l: 'N° Employé', v: anomalie.numeroEmploye || '—' },
            { l: 'Taux de charge', v: `${anomalie.tauxCharge}%`, color: anomalie.tauxCharge > 100 ? C.red : C.blue },
            { l: 'Sévérité', v: sev.label, color: sev.text, bg: sev.bg, border: sev.border },
          ].map((item, i) => (
            <div key={i} style={{ padding: '8px 12px', borderRadius: R, backgroundColor: (item as any).bg || C.bg, border: `1px solid ${(item as any).border || C.border}` }}>
              <p style={{ fontSize: '9px', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{item.l}</p>
              <p style={{ fontSize: '12px', fontWeight: 700, color: (item as any).color || C.text }}>{item.v}</p>
            </div>
          ))}
        </div>

        {/* Alert banner */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', borderRadius: R, backgroundColor: isSurcharge ? '#FEF2F2' : '#EFF6FF', border: `1px solid ${isSurcharge ? '#FECACA' : '#BFDBFE'}`, borderLeft: `3px solid ${sev.bar}` }}>
          <AlertTriangle style={{ width: '14px', height: '14px', color: sev.bar, flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: sev.text, marginBottom: '2px' }}>{isSurcharge ? 'Anomalie de surcharge' : 'Ressource sous-utilisée'}</p>
            <p style={{ fontSize: '12px', color: sev.text }}>{anomalie.description}</p>
          </div>
        </div>

        {/* Calendar View */}
        <div style={{ backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}`, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar style={{ width: '13px', height: '13px', color: C.purple }} />Vue Calendrier — {MOIS_LABELS[anomalie.mois]} {anomalie.annee}
            </p>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[ChevronLeft, ChevronRight].map((Icon, i) => (
                <button key={i} style={{ width: '24px', height: '24px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '13px', height: '13px', color: C.textMuted }} />
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '700px' }}>
              {/* Day numbers */}
              <div style={{ display: 'flex', marginBottom: '4px' }}>
                <div style={{ width: '148px', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'grid', gap: '1px', gridTemplateColumns: `repeat(${daysInMonth},1fr)` }}>
                  {days.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '9px', fontWeight: 600, padding: '2px 0', borderRadius: '2px', backgroundColor: (dailyLoad[d] || 0) > 1 ? '#FECACA' : isWknd(d) ? C.borderLight : 'transparent', color: (dailyLoad[d] || 0) > 1 ? C.red : C.textMuted }}>{d}</div>
                  ))}
                </div>
              </div>
              {/* Project bars — real dates */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {projectBars.map((p, pi) => (
                  <div key={pi} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '148px', flexShrink: 0, paddingRight: '8px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: '9px', color: C.textMuted }}>{p.dateDebut} → {p.dateFin}</p>
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: '28px' }}>
                      {/* Background grid */}
                      <div style={{ position: 'absolute', inset: 0, display: 'grid', gap: '1px', gridTemplateColumns: `repeat(${daysInMonth},1fr)` }}>
                        {days.map(d => <div key={d} style={{ backgroundColor: isWknd(d) ? C.borderLight : '#fff', height: '100%' }} />)}
                      </div>
                      {/* Colored bar from startDay to endDay */}
                      <div style={{ position: 'absolute', top: '2px', bottom: '2px', left: `${((p.startDay - 1) / daysInMonth) * 100}%`, width: `${(p.dur / daysInMonth) * 100}%`, backgroundColor: p.color, opacity: 0.9, borderRadius: '2px', display: 'flex', alignItems: 'center', paddingLeft: '5px', zIndex: 1 }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.name} · {p.startDay}-{p.endDay}</span>
                      </div>
                      {/* Conflict overlay (days with >1 project) */}
                      {days.map(d => {
                        if (d < p.startDay || d > p.endDay) return null;
                        if ((dailyLoad[d] || 0) <= 1) return null;
                        return <div key={d} style={{ position: 'absolute', top: 0, bottom: 0, left: `${((d - 1) / daysInMonth) * 100}%`, width: `${(1 / daysInMonth) * 100}%`, backgroundColor: 'rgba(239,68,68,0.25)', borderLeft: `1px solid ${C.red}`, zIndex: 2 }} />;
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', gap: '14px', marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
                {isSurcharge && <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: C.textMuted }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: C.red }} />Conflit</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: C.textMuted }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: C.borderLight }} />Weekend</div>
                {projectBars.map((p, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: C.textMuted }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: p.color }} />{p.name}</div>)}
              </div>
            </div>
          </div>
        </div>

        {/* Allocation details */}
        <div>
          <SectionLabel>Détails des allocations</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {affectations.length > 0 ? affectations.map((aff, i) => {
              const joursOuvres = projectBars[i]?.dur || 0;
              const pct = capacite > 0 ? Math.round((joursOuvres / capacite) * 100) : 0;
              const barColor = pct >= 100 ? C.red : pct >= 80 ? '#F59E0B' : C.green;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${colors[i % colors.length]}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{aff.projetNom}</p>
                    <p style={{ fontSize: '10px', color: C.textMuted }}>{aff.dateDebut} → {aff.dateFin}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '80px', height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '2px', backgroundColor: barColor, width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: barColor, minWidth: '36px', textAlign: 'right' }}>{pct}%</span>
                  </div>
                </div>
              );
            }) : projects.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${p.color}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{p.name}</p>
                  <p style={{ fontSize: '10px', color: C.textMuted }}>{p.charge} jours demandés / {capacite} jours capacité</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '80px', height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: (p.charge / capacite) * 100 >= 100 ? C.red : (p.charge / capacite) * 100 >= 80 ? '#F59E0B' : C.green, width: `${Math.min((p.charge / capacite) * 100, 100)}%` }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: (p.charge / capacite) * 100 >= 100 ? C.red : (p.charge / capacite) * 100 >= 80 ? '#F59E0B' : C.green, minWidth: '36px', textAlign: 'right' }}>{Math.round((p.charge / capacite) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Resources — surcharge only */}
        {isSurcharge && (
          <div>
            <SectionLabel>Ressources Alternatives Disponibles</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
              {altResources.map((r, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar name={r.name} color={r.color} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</p>
                      <p style={{ fontSize: '10px', color: C.textMuted }}>{r.role}</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: r.dispo >= 70 ? C.green : r.dispo >= 50 ? '#D97706' : C.red, backgroundColor: r.dispo >= 70 ? '#ECFDF5' : r.dispo >= 50 ? '#FFF7ED' : '#FEF2F2', padding: '2px 6px', borderRadius: '3px' }}>
                      {r.dispo}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '2px', backgroundColor: r.dispo >= 70 ? C.green : r.dispo >= 50 ? '#F59E0B' : C.red, width: `${r.dispo}%` }} />
                    </div>
                    <button onClick={() => toast.success(`${r.name} proposée au chef de projet.`)}
                      style={{ padding: '4px 10px', borderRadius: R, backgroundColor: C.magenta, color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.magentaDark)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.magenta)}
                    >Proposer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: `1px solid ${C.borderLight}` }}>
          <button onClick={onNotify}
            style={{ flex: 1, padding: '8px', borderRadius: R, border: `1px solid ${notified ? '#A7F3D0' : C.border}`, backgroundColor: notified ? '#ECFDF5' : '#fff', color: notified ? C.green : C.textSecondary, cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            {notified ? <CheckCircle style={{ width: '13px', height: '13px' }} /> : <Mail style={{ width: '13px', height: '13px' }} />}
            {notified ? 'Chef notifié' : 'Notifier le chef de projet'}
          </button>
          <BtnGhost onClick={onClose}>Fermer</BtnGhost>
        </div>
      </div>
    </Modal>
  );
}

/* ─── MAIN ─── */
export function Conflicts() {
  const navigate = useNavigate();
  const now = new Date();
  const [annee, setAnnee] = useState(now.getFullYear());
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [anomalies, setAnomalies] = useState<AnomalieV2DTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [filterSev, setFilterSev] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AnomalieV2DTO | null>(null);
  const [notified, setNotified] = useState<number[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      setAnomalies(await fetchAnomaliesV2(annee, mois));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [annee, mois]);

  const handleDetect = async () => {
    setDetecting(true);
    toast.loading('Détection en cours…', { id: 'detect' });
    try {
      const result = await lancerDetectionV2(annee, mois);
      setAnomalies(result);
      toast.success(`${result.length} anomalies détectées`, { id: 'detect' });
    } catch (e: any) {
      toast.error(e.message || 'Erreur', { id: 'detect' });
    } finally { setDetecting(false); }
  };


  const notify = (a: AnomalieV2DTO) => {
    if (!notified.includes(a.id)) {
      setNotified(p => [...p, a.id]);
      toast.success(`Notification envoyée — ${a.collaborateurNom}`);
    }
  };

  const goToSimulation = (a: AnomalieV2DTO) => {
    const { isSurcharge } = getTypeLabel(a);
    const mode = isSurcharge ? 'remplacement' : 'sous-charge';
    navigate(`/simulation?conflictId=${a.id}&mode=${mode}&annee=${a.annee}&mois=${a.mois}`);
  };

  const filtered = anomalies.filter(a => {
    const sev = getSeverity(a);
    const { isSurcharge } = getTypeLabel(a);
    if (filterSev !== 'all' && sev.key !== filterSev) return false;
    if (filterType !== 'all') {
      if (filterType === 'surcharge' && !isSurcharge) return false;
      if (filterType === 'sous-utilisation' && isSurcharge) return false;
    }
    if (search && !(a.collaborateurNom || '').toLowerCase().includes(search.toLowerCase())
        && !(a.numeroEmploye || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // KPIs
  const totalConflits = anomalies.length;
  const critiques = anomalies.filter(a => getSeverity(a).key === 'critical').length;
  const surcharges = anomalies.filter(a => a.typeAnomalie === 'SURCHARGE' || a.typeAnomalie === 'CONFLIT').length;
  const sousUtilisees = anomalies.filter(a => a.typeAnomalie === 'SOUS_CHARGE' || a.typeAnomalie === 'NON_STAFFE').length;

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Gestion des Conflits" subtitle="Détection et résolution des anomalies de staffing">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: R }}>
            <AlertCircle style={{ width: '12px', height: '12px', color: C.red }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B91C1C' }}>{filtered.length} conflits actifs</span>
          </div>
          <BtnPrimary onClick={handleDetect} disabled={detecting} small>
            {detecting ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : <Play style={{ width: '12px', height: '12px' }} />}
            {detecting ? 'Détection…' : 'Lancer la détection'}
          </BtnPrimary>
        </div>
      </PageHeader>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select value={mois} onChange={e => setMois(Number(e.target.value))}
          style={{ padding: '6px 12px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', cursor: 'pointer' }}>
          {MOIS_LABELS.slice(1).map((l, i) => <option key={i + 1} value={i + 1}>{l}</option>)}
        </select>
        <select value={annee} onChange={e => setAnnee(Number(e.target.value))}
          style={{ padding: '6px 12px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', cursor: 'pointer' }}>
          {[2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { l: 'Total Conflits', v: totalConflits, i: AlertCircle, c: '#6B7280' },
          { l: 'Conflits Critiques', v: critiques, i: AlertTriangle, c: C.red },
          { l: 'Ressources Surchargées', v: surcharges, i: TrendingUp, c: '#F59E0B' },
          { l: 'Sous-utilisées', v: sousUtilisees, i: TrendingDown, c: C.blue },
        ].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.c}`, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
            <s.i style={{ width: '18px', height: '18px', color: s.c, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
              <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>{s.l}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
          <Search style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: C.textMuted, pointerEvents: 'none' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            style={{ width: '100%', paddingLeft: '28px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none' }}
            onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
        </div>
        <select value={filterSev} onChange={e => setFilterSev(e.target.value)}
          style={{ padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', cursor: 'pointer', height: '32px' }}>
          <option value="all">Toutes sévérités</option>
          <option value="critical">Critique</option>
          <option value="high">Élevée</option>
          <option value="medium">Moyenne</option>
          <option value="low">Faible</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', cursor: 'pointer', height: '32px' }}>
          <option value="all">Tous les types</option>
          <option value="surcharge">Surcharge</option>
          <option value="sous-utilisation">Sous-utilisation</option>
        </select>
      </div>

      {/* Conflict list */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
          <Loader2 style={{ width: '28px', height: '28px', color: C.purple, animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(a => {
            const sev = getSeverity(a);
            const { isSurcharge, label: typeLabel } = getTypeLabel(a);
            const projects = parseProjects(a);
            const isNotified = notified.includes(a.id);

            return (
              <div key={a.id}
                onClick={() => goToSimulation(a)}
                style={{ ...cardStyle, borderLeft: `4px solid ${sev.bar}`, cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s, background-color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = S.elevated; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.backgroundColor = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = S.card; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundColor = C.white; }}>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    {/* Avatar */}
                    <Avatar name={a.collaborateurNom || 'U'} color={isSurcharge ? sev.bar : C.blue} size={36} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name + badges */}
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{a.collaborateurNom}</p>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: sev.bg, border: `1px solid ${sev.border}`, color: sev.text }}>{sev.label}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: isSurcharge ? '#FEF2F2' : '#EFF6FF', color: isSurcharge ? '#B91C1C' : '#1D4ED8' }}>{typeLabel}</span>
                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '3px', backgroundColor: `${C.purple}10`, border: `1px solid ${C.purple}30`, color: C.purple, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <UserPlus style={{ width: '10px', height: '10px' }} />Résoudre par simulation
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: C.textMuted, marginBottom: '8px' }}>#{a.numeroEmploye}</p>

                      {/* Alert */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '7px 10px', borderRadius: R, backgroundColor: sev.bg, border: `1px solid ${sev.border}`, marginBottom: '8px' }}>
                        <AlertTriangle style={{ width: '12px', height: '12px', color: sev.bar, flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ fontSize: '11px', fontWeight: 500, color: sev.text, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{a.description}</p>
                      </div>

                      {/* Projects */}
                      {projects.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                          {projects.map((p, i) => (
                            <span key={i} style={{ fontSize: '10px', fontWeight: 700, color: '#fff', backgroundColor: p.color, padding: '2px 8px', borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {p.name} · {p.charge}j
                              {i < projects.length - 1 && <ArrowRight style={{ width: '10px', height: '10px', color: 'rgba(255,255,255,0.7)', marginLeft: '2px' }} />}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Meta */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar style={{ width: '11px', height: '11px' }} />{MOIS_LABELS[a.mois]} {a.annee}
                        </span>
                        {a.joursEnConflit > 0 && (
                          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock style={{ width: '11px', height: '11px' }} />{a.joursEnConflit} jours en conflit
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users style={{ width: '11px', height: '11px' }} />{a.totalJoursDemandes}/{a.capaciteMensuelle}j
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: a.tauxCharge > 100 ? C.red : C.blue }}>
                          Charge: {a.tauxCharge}%
                        </span>
                      </div>
                    </div>

                    {/* Gauge */}
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="26" cy="26" r="20" fill="none" stroke={C.borderLight} strokeWidth="5" />
                        <circle cx="26" cy="26" r="20" fill="none"
                          stroke={a.tauxCharge > 150 ? C.red : a.tauxCharge > 100 ? '#F59E0B' : C.blue}
                          strokeWidth="5"
                          strokeDasharray={`${Math.min((a.tauxCharge / 200) * 125.7, 125.7)} 125.7`}
                          strokeLinecap="butt" />
                      </svg>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: a.tauxCharge > 150 ? C.red : a.tauxCharge > 100 ? '#F59E0B' : C.blue, marginTop: '-38px', zIndex: 1, position: 'relative' }}>{a.tauxCharge}%</p>
                      <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '24px' }}>Charge</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${C.borderLight}` }}>
                    <button onClick={e => { e.stopPropagation(); notify(a); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: R, border: `1px solid ${isNotified ? '#A7F3D0' : C.border}`, backgroundColor: isNotified ? '#ECFDF5' : '#fff', color: isNotified ? C.green : C.textSecondary, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                    >
                      {isNotified ? <CheckCircle style={{ width: '13px', height: '13px' }} /> : <Mail style={{ width: '13px', height: '13px' }} />}
                      {isNotified ? 'Chef notifié' : 'Notifier le chef de projet'}
                    </button>
                    <BtnGhost onClick={() => setSelected(a)} small><Eye style={{ width: '12px', height: '12px' }} />Voir les détails</BtnGhost>
                    {isSurcharge && (
                      <BtnPrimary onClick={() => goToSimulation(a)} small>
                        <UserPlus style={{ width: '12px', height: '12px' }} />Résoudre par simulation
                      </BtnPrimary>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
              <CheckCircle style={{ width: '36px', height: '36px', color: C.green, margin: '0 auto 10px' }} />
              <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Aucun conflit détecté</p>
              <p style={{ fontSize: '12px', color: C.textMuted }}>
                {anomalies.length === 0 ? 'Lancez la détection pour analyser cette période.' : 'Aucun conflit ne correspond aux filtres.'}
              </p>
            </div>
          )}
        </div>
      )}

      {selected && <DetailModal anomalie={selected} onClose={() => setSelected(null)} onNotify={() => notify(selected)} notified={notified.includes(selected.id)} />}
    </div>
  );
}
