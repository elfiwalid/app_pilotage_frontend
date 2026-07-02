import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { C, R, PageHeader, SectionCard, cardStyle, Modal, ModalHeader, BtnPrimary, BtnGhost } from '../../components/ui/design-system';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { fetchCollabPlanning, updateCollabTache, type CollabPlanningJourDTO, type SlotDTO, type StatutTache, type TacheJourDTO } from '../../services/collaborateurService';

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const TASK_STATUS_LABELS: Record<StatutTache, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  BLOQUEE: 'Bloquée',
};

const TASK_STATUS_COLORS: Record<StatutTache, string> = {
  EN_ATTENTE: '#64748B',
  EN_COURS: '#D97706',
  TERMINEE: C.green,
  BLOQUEE: C.red,
};

const TASK_STATUS_STYLES: Record<StatutTache, { bg: string; border: string; text: string; marker: string }> = {
  EN_ATTENTE: { bg: '#F8FAFC', border: '#CBD5E1', text: '#475569', marker: '' },
  EN_COURS: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', marker: '' },
  TERMINEE: { bg: '#ECFDF5', border: C.green, text: '#047857', marker: '✓' },
  BLOQUEE: { bg: '#FEF2F2', border: C.red, text: '#B91C1C', marker: '!' },
};

function taskStatusStyle(statut?: StatutTache) {
  return TASK_STATUS_STYLES[statut || 'EN_ATTENTE'];
}

/** Offset Lundi=0 ... Dimanche=6 pour le 1er jour du mois */
function firstDayOffset(year: number, month: number): number {
  const jsDay = new Date(year, month - 1, 1).getDay(); // 0=Dim..6=Sam
  return (jsDay + 6) % 7; // Lun=0
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function isWeekendDay(year: number, month: number, day: number): boolean {
  const jsDay = new Date(year, month - 1, day).getDay();
  return jsDay === 0 || jsDay === 6;
}

function loadColor(pct: number): string {
  return pct > 100 ? C.red : pct >= 80 ? '#F59E0B' : pct > 0 ? C.green : 'transparent';
}

export function CollabSchedule() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [planning, setPlanning] = useState<CollabPlanningJourDTO[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [selectedTask, setSelectedTask] = useState<TacheJourDTO | null>(null);
  const [taskStatus, setTaskStatus] = useState<StatutTache>('EN_ATTENTE');
  const [taskDone, setTaskDone] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (y: number, m: number) => {
    setLoading(true);
    setError(null);
    try {
      setPlanning(await fetchCollabPlanning(y, m));
    } catch (err: any) {
      setError(err.message || 'Impossible de charger le planning.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(year, month); }, [year, month]);

  const openTask = (task: TacheJourDTO) => {
    setSelectedTask(task);
    const statut = task.statut || 'EN_ATTENTE';
    setTaskStatus(statut);
    setTaskDone(statut === 'TERMINEE' || (task.pourcentageAvancement ?? 0) === 100);
  };

  const saveTask = async () => {
    if (!selectedTask) return;
    setSavingTask(true);
    try {
      await updateCollabTache(selectedTask.id, {
        statut: taskStatus,
        pourcentageAvancement: taskStatus === 'TERMINEE' ? 100 : 0,
      });
      toast.success('Tâche mise à jour.');
      setSelectedTask(null);
      await load(year, month);
    } catch (err: any) {
      toast.error(err.message || 'Impossible de mettre à jour la tâche.');
    } finally {
      setSavingTask(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  // Map jour → slots
  const slotsByDay: Record<number, SlotDTO[]> = {};
  const tachesByDay: Record<number, TacheJourDTO[]> = {};
  planning.forEach(p => {
    const day = new Date(p.date + 'T00:00:00').getDate();
    slotsByDay[day] = p.slots || [];
    tachesByDay[day] = p.taches || [];
  });

  const getTotal = (d: number) => (slotsByDay[d] || []).reduce((s, sl) => s + sl.alloc, 0);

  const offset = firstDayOffset(year, month);
  const nDays = daysInMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: nDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d: number) =>
    d === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

  // Couleurs distinctes des projets du mois (pour la légende)
  const projetColors = new Map<string, string>();
  planning.forEach(p => p.slots.forEach(s => { if (!projetColors.has(s.projet)) projetColors.set(s.projet, s.couleur); }));

  // Résumé mensuel : moyenne de charge sur les jours ouvrés saisis
  const joursSaisis = Object.keys(slotsByDay).filter(d => (slotsByDay[Number(d)] || []).length > 0).length;
  const totalTaches = Object.values(tachesByDay).reduce((sum, taches) => sum + taches.length, 0);
  const chargeMoyenne = (() => {
    const totals = Object.keys(slotsByDay)
      .map(d => getTotal(Number(d)))
      .filter(t => t > 0);
    if (totals.length === 0) return 0;
    return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
  })();

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <PageHeader title="Mon Planning" subtitle={`Calendrier des affectations — ${MONTH_NAMES[month - 1]} ${year} · ${user?.name ?? ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: C.textMuted }}>
          <Calendar style={{ width: '11px', height: '11px' }} />Vue basée sur vos affectations réelles
        </div>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px', alignItems: 'start' }}>

        {/* Calendar */}
        <SectionCard title={`Calendrier — ${MONTH_NAMES[month - 1]} ${year}`} subtitle="Cliquez sur un jour pour voir le détail" accent={C.green}
          actions={
            <div style={{ display: 'flex', gap: '3px' }}>
              <button onClick={prevMonth} style={{ width: '26px', height: '26px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft style={{ width: '14px', height: '14px', color: C.textMuted }} />
              </button>
              <button onClick={nextMonth} style={{ width: '26px', height: '26px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight style={{ width: '14px', height: '14px', color: C.textMuted }} />
              </button>
            </div>
          }
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '60px 0' }}>
              <Loader2 style={{ width: '28px', height: '28px', color: C.green, animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '12px', color: C.textMuted }}>Chargement…</p>
            </div>
          ) : error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '50px 0', textAlign: 'center' }}>
              <AlertTriangle style={{ width: '28px', height: '28px', color: C.red }} />
              <p style={{ fontSize: '12px', color: C.textSecondary }}>{error}</p>
              <button onClick={() => load(year, month)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: R, border: 'none', backgroundColor: C.green, color: '#fff', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>
                <RefreshCw style={{ width: '11px', height: '11px' }} />Réessayer
              </button>
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '4px' }}>
                {DAY_NAMES.map(d => (
                  <div key={d} style={{ textAlign: 'center', padding: '4px 0', fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d}</div>
                ))}
              </div>

              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px' }}>
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const weekend = isWeekendDay(year, month, day);
                  const slots = slotsByDay[day] || [];
                  const taches = tachesByDay[day] || [];
                  const total = getTotal(day);
                  const isSelected = selectedDay === day;
                  const today = isToday(day);

                  return (
                    <div key={i}
                      style={{
                        minHeight: '68px', borderRadius: R, padding: '4px 4px 3px',
                        backgroundColor: isSelected ? `${C.green}10` : weekend ? `${C.borderLight}60` : C.white,
                        border: `1px solid ${isSelected ? C.green : today ? C.purple : C.borderLight}`,
                        cursor: weekend ? 'default' : 'pointer', transition: 'all 0.12s',
                        outline: today ? `2px solid ${C.purple}30` : 'none',
                      }}
                      onClick={() => !weekend && setSelectedDay(day)}
                      onMouseEnter={e => { if (!weekend) (e.currentTarget as HTMLDivElement).style.borderColor = C.green; }}
                      onMouseLeave={e => { if (!weekend) (e.currentTarget as HTMLDivElement).style.borderColor = isSelected ? C.green : today ? C.purple : C.borderLight; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                        <span style={{ fontSize: '11px', fontWeight: today ? 800 : 600, color: today ? C.purple : weekend ? C.textMuted : C.text }}>{day}</span>
                      </div>

                      {/* Slot bars */}
                      {slots.slice(0, 2).map((sl, si) => (
                        <div key={si} style={{ height: '10px', borderRadius: '2px', backgroundColor: sl.couleur, display: 'flex', alignItems: 'center', paddingLeft: '3px', marginBottom: '2px', overflow: 'hidden' }}>
                          <span style={{ fontSize: '7px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sl.projet} {sl.alloc}%
                          </span>
                        </div>
                      ))}
                      {slots.length > 2 && <span style={{ fontSize: '8px', color: C.textMuted }}>+{slots.length - 2}</span>}

                      {taches.slice(0, 2).map((t, ti) => {
                        const st = t.statut || 'EN_ATTENTE';
                        const style = taskStatusStyle(st);
                        return (
                          <div key={`t-${ti}`} onClick={e => { e.stopPropagation(); openTask(t); }}
                            title={`${t.tache} - ${TASK_STATUS_LABELS[st]}`}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '2px', maxWidth: '100%',
                              marginTop: '2px', padding: '1px 3px', borderRadius: '3px',
                              border: `1px solid ${style.border}55`, backgroundColor: style.bg,
                              color: style.text, fontSize: '7px', fontWeight: 800, lineHeight: 1.2,
                              cursor: 'pointer', overflow: 'hidden',
                            }}>
                            {style.marker && <span style={{ flexShrink: 0, fontSize: '8px', lineHeight: 1 }}>{style.marker}</span>}
                            <span style={{
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              textDecoration: st === 'TERMINEE' ? 'line-through' : 'none',
                            }}>{t.tache}</span>
                            <span style={{ flexShrink: 0, fontSize: '6px', fontWeight: 900 }}>{TASK_STATUS_LABELS[st]}</span>
                          </div>
                        );
                      })}
                      {taches.length > 2 && <span style={{ fontSize: '8px', color: C.textMuted }}>+{taches.length - 2} taches</span>}

                      {/* Total bar */}
                      {total > 0 && (
                        <div style={{ marginTop: '1px', height: '2px', borderRadius: '1px', backgroundColor: loadColor(total), width: `${Math.min(total, 100)}%` }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '10px', borderTop: `1px solid ${C.borderLight}`, flexWrap: 'wrap' }}>
                {[...projetColors.entries()].slice(0, 5).map(([nom, color]) => (
                  <div key={nom} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: C.textMuted }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: color }} />{nom}
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: C.textMuted }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: C.red }} />Surcharge
                </div>
              </div>
            </>
          )}
        </SectionCard>

        {/* Day detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ ...cardStyle, borderTop: `3px solid ${C.green}` }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.borderLight}` }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>
                {selectedDay ? `${selectedDay} ${MONTH_NAMES[month - 1]} ${year}` : 'Sélectionnez un jour'}
              </p>
            </div>
            <div style={{ padding: '12px 14px' }}>
              {selectedDay ? (
                isWeekendDay(year, month, selectedDay) ? (
                  <p style={{ fontSize: '12px', color: C.textMuted, textAlign: 'center', padding: '12px 0' }}>Weekend / Jour non ouvrable</p>
                ) : (slotsByDay[selectedDay] || []).length > 0 || (tachesByDay[selectedDay] || []).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(slotsByDay[selectedDay] || []).map((sl, i) => (
                      <div key={i} style={{ padding: '8px 10px', borderRadius: R, borderLeft: `3px solid ${sl.couleur}`, border: `1px solid ${sl.couleur}20`, borderLeftWidth: '3px', backgroundColor: `${sl.couleur}06` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: C.text }}>{sl.projet}</p>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: sl.couleur }}>{sl.alloc}%</span>
                        </div>
                        <div style={{ height: '3px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '2px', backgroundColor: sl.couleur, width: `${Math.min(sl.alloc, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                    {(tachesByDay[selectedDay] || []).map((t, i) => (
                      <div key={`task-${i}`} onClick={() => openTask(t)}
                        style={{ padding: '8px 10px', borderRadius: R, border: `1px solid ${taskStatusStyle(t.statut).border}55`, borderLeft: `3px solid ${taskStatusStyle(t.statut).border}`, backgroundColor: taskStatusStyle(t.statut).bg, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 800, color: taskStatusStyle(t.statut).text, textDecoration: (t.statut || 'EN_ATTENTE') === 'TERMINEE' ? 'line-through' : 'none' }}>
                            {taskStatusStyle(t.statut).marker && <span style={{ marginRight: '4px' }}>{taskStatusStyle(t.statut).marker}</span>}
                            {t.tache}
                          </p>
                          <span style={{ fontSize: '9px', fontWeight: 900, color: taskStatusStyle(t.statut).text, padding: '2px 6px', borderRadius: '999px', backgroundColor: '#fff', border: `1px solid ${taskStatusStyle(t.statut).border}55`, flexShrink: 0 }}>{TASK_STATUS_LABELS[t.statut || 'EN_ATTENTE']}</span>
                        </div>
                        <p style={{ fontSize: '10px', color: C.textMuted }}>{t.projet} · {TASK_STATUS_LABELS[t.statut || 'EN_ATTENTE']}</p>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: '11px', color: C.textSecondary }}>Total</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: loadColor(getTotal(selectedDay)) }}>{getTotal(selectedDay)}%</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: C.textMuted, textAlign: 'center', padding: '16px 0' }}>Aucune affectation ce jour</p>
                )
              ) : (
                <p style={{ fontSize: '12px', color: C.textMuted, textAlign: 'center', padding: '16px 0' }}>Cliquez sur un jour du calendrier</p>
              )}
            </div>
          </div>

          {/* Monthly summary */}
          <div style={{ ...cardStyle, padding: '12px 14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: C.text, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar style={{ width: '12px', height: '12px', color: C.green }} />Résumé — {MONTH_NAMES[month - 1]} {year}
            </p>
            {[
              { l: 'Jours avec affectation', v: String(joursSaisis) },
              { l: 'Charge moyenne / jour', v: `${chargeMoyenne}%` },
              { l: 'Projets distincts', v: String(projetColors.size) },
              { l: 'Taches planifiees', v: String(totalTaches) },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '11px', color: C.textMuted }}>{s.l}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTask && (
        <Modal onClose={() => setSelectedTask(null)} maxWidth="420px" accentColor={TASK_STATUS_COLORS[taskStatus]}>
          <ModalHeader title="Suivi de tâche" subtitle={selectedTask.projet} onClose={() => setSelectedTask(null)} />
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '10px 12px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: '13px', fontWeight: 800, color: C.text }}>{selectedTask.tache}</p>
              <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '3px' }}>
                {selectedDay ? `${selectedDay} ${MONTH_NAMES[month - 1]} ${year}` : ''}
              </p>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 800, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Statut</label>
              <select value={taskStatus} onChange={e => {
                const next = e.target.value as StatutTache;
                setTaskStatus(next);
                setTaskDone(next === 'TERMINEE');
              }} style={{ width: '100%', marginTop: '5px', padding: '8px 10px', borderRadius: R, border: `1px solid ${C.border}`, fontSize: '12px' }}>
                {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: C.bg }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: C.text, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={taskDone}
                  onChange={e => {
                    const checked = e.target.checked;
                    setTaskDone(checked);
                    setTaskStatus(checked ? 'TERMINEE' : 'EN_COURS');
                  }}
                />
                Tâche terminée
              </label>
              <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '6px' }}>
                Une tâche terminée est enregistrée automatiquement à 100%, les autres statuts à 0%.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
              <BtnPrimary onClick={saveTask} disabled={savingTask}>
                {savingTask ? 'Enregistrement...' : 'Enregistrer'}
              </BtnPrimary>
              <BtnGhost onClick={() => setSelectedTask(null)}>Annuler</BtnGhost>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
