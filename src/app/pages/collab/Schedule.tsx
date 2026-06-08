import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { C, R, PageHeader, SectionCard, cardStyle } from '../../components/ui/design-system';
import { useAuth } from '../../context/AuthContext';
import { fetchCollabPlanning, type CollabPlanningJourDTO, type SlotDTO, type TacheJourDTO } from '../../services/collaborateurService';

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

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

                      {taches.slice(0, 2).map((t, ti) => (
                        <div key={`t-${ti}`} style={{ fontSize: '7px', fontWeight: 700, color: C.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                          {t.tache}
                        </div>
                      ))}
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
                      <div key={`task-${i}`} style={{ padding: '7px 10px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: C.bg }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: C.text }}>{t.tache}</p>
                        <p style={{ fontSize: '10px', color: C.textMuted }}>{t.projet}</p>
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
    </div>
  );
}
