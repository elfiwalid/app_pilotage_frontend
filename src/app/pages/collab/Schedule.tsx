import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit3, Trash2, Save, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { C, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, Modal, ModalHeader, SectionLabel, cardStyle } from '../../components/ui/design-system';

/* ─── TYPES & DATA ───────────────────────────────── */
type Slot = { project: string; color: string; alloc: number; note?: string };
type DayData = Record<number, Slot[]>;

const PROJECT_OPTS = [
  { name: 'Projet Alpha', color: C.purple },
  { name: 'Projet Beta', color: C.blue },
  { name: 'Formation', color: '#F59E0B' },
  { name: 'Congé', color: '#9CA3AF' },
  { name: 'Réunion', color: '#8B5CF6' },
  { name: 'Autre', color: C.green },
];

// April 2026 starts on Wednesday → offset = 2 (Mon=0, Wed=2)
const OFFSET = 2;
const DAYS_IN_MONTH = 30;
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const isWeekend = (d: number) => {
  const dow = (OFFSET + d - 1) % 7;
  return dow === 5 || dow === 6; // Sam, Dim
};

const INIT_DATA: DayData = {
  1: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  2: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  3: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  6: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  7: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }],
  8: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  9: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  10: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  13: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  14: [{ project: 'Projet Beta', color: C.blue, alloc: 40 }],
  15: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  16: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  17: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  20: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Formation', color: '#F59E0B', alloc: 30 }],
  21: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }],
  22: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  23: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  24: [{ project: 'Congé', color: '#9CA3AF', alloc: 100 }],
  27: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  28: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  29: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
  30: [{ project: 'Projet Alpha', color: C.purple, alloc: 55 }, { project: 'Projet Beta', color: C.blue, alloc: 40 }],
};

/* ─── EDIT DAY MODAL ─────────────────────────────── */
function EditDayModal({ day, slots, onSave, onClose }: {
  day: number;
  slots: Slot[];
  onSave: (day: number, slots: Slot[]) => void;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<Slot[]>([...slots]);
  const [newProject, setNewProject] = useState(PROJECT_OPTS[0].name);
  const [newAlloc, setNewAlloc] = useState(50);
  const [newNote, setNewNote] = useState('');

  const total = entries.reduce((s, e) => s + e.alloc, 0);

  const addEntry = () => {
    const opt = PROJECT_OPTS.find(p => p.name === newProject)!;
    setEntries(p => [...p, { project: newProject, color: opt.color, alloc: newAlloc, note: newNote || undefined }]);
    setNewNote('');
  };

  const removeEntry = (i: number) => setEntries(p => p.filter((_, idx) => idx !== i));
  const updateAlloc = (i: number, val: number) => setEntries(p => p.map((e, idx) => idx === i ? { ...e, alloc: val } : e));

  const handleSave = () => {
    onSave(day, entries);
    toast.success(`Planning du ${day} Avril mis à jour !`);
    onClose();
  };

  const selectStyle: React.CSSProperties = { padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter', color: C.text, cursor: 'pointer', flex: 1 };
  const inputStyle: React.CSSProperties = { padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter', color: C.text, width: '100%', boxSizing: 'border-box' };

  return (
    <Modal onClose={onClose} maxWidth="500px" accentColor={C.green}>
      <ModalHeader title={`Planning — ${day} Avril 2026`} subtitle="Modifier les allocations de la journée" onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Total indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: R, backgroundColor: total > 100 ? '#FEF2F2' : total === 0 ? C.bg : '#ECFDF5', border: `1px solid ${total > 100 ? '#FECACA' : total === 0 ? C.border : '#A7F3D0'}` }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: C.textSecondary }}>Total alloué ce jour</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: total > 100 ? C.red : total === 0 ? C.textMuted : C.green }}>{total}%</span>
        </div>

        {/* Current entries */}
        {entries.length > 0 && (
          <div>
            <SectionLabel>Allocations actuelles</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {entries.map((e, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: R, border: `1px solid ${e.color}25`, borderLeft: `3px solid ${e.color}`, display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '5px' }}>{e.project}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="range" min="5" max="100" step="5" value={e.alloc}
                        onChange={ev => updateAlloc(i, Number(ev.target.value))}
                        style={{ flex: 1, accentColor: e.color, cursor: 'pointer' }} />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: e.color, minWidth: '36px', textAlign: 'right' }}>{e.alloc}%</span>
                    </div>
                    {e.note && <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '3px' }}>{e.note}</p>}
                  </div>
                  <button onClick={() => removeEntry(i)}
                    style={{ width: '26px', height: '26px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FEF2F2')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}>
                    <Trash2 style={{ width: '11px', height: '11px', color: C.red }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new */}
        <div style={{ padding: '12px 14px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: C.text, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Plus style={{ width: '12px', height: '12px', color: C.green }} />Ajouter une allocation
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginBottom: '8px' }}>
            <select value={newProject} onChange={e => setNewProject(e.target.value)} style={selectStyle}>
              {PROJECT_OPTS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input type="number" min="5" max="100" step="5" value={newAlloc} onChange={e => setNewAlloc(Number(e.target.value))}
                style={{ width: '64px', padding: '6px 8px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, textAlign: 'center', fontFamily: 'Inter', outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = C.green)} onBlur={e => (e.target.style.borderColor = C.border)} />
              <span style={{ fontSize: '12px', color: C.textMuted }}>%</span>
            </div>
          </div>
          <input type="text" placeholder="Note (optionnel)" value={newNote} onChange={e => setNewNote(e.target.value)}
            style={{ ...inputStyle, marginBottom: '8px' }}
            onFocus={e => (e.target.style.borderColor = C.green)} onBlur={e => (e.target.style.borderColor = C.border)} />
          <button onClick={addEntry}
            style={{ width: '100%', padding: '7px', borderRadius: R, border: `1px solid ${C.green}40`, backgroundColor: `${C.green}10`, color: C.green, cursor: 'pointer', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <Plus style={{ width: '12px', height: '12px' }} />Ajouter
          </button>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
          <BtnPrimary onClick={handleSave}><Save style={{ width: '12px', height: '12px' }} />Enregistrer</BtnPrimary>
          <BtnGhost onClick={onClose}>Annuler</BtnGhost>
        </div>
      </div>
    </Modal>
  );
}

/* ─── MAIN ─────────────────────────────────────── */
export function CollabSchedule() {
  const [dayData, setDayData] = useState<DayData>(INIT_DATA);
  const [selectedDay, setSelectedDay] = useState<number | null>(10);
  const [editingDay, setEditingDay] = useState<number | null>(null);

  // Build calendar grid
  const cells: (number | null)[] = [
    ...Array(OFFSET).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const getTotal = (d: number) => (dayData[d] || []).reduce((s, sl) => s + sl.alloc, 0);
  const loadColor = (pct: number) => pct > 100 ? C.red : pct >= 80 ? '#F59E0B' : pct > 0 ? C.green : 'transparent';

  const handleSaveDay = (day: number, slots: Slot[]) => {
    setDayData(prev => ({ ...prev, [day]: slots }));
  };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <PageHeader title="Mon Planning" subtitle="Calendrier éditable — Avril 2026 · Youssef El Amrani">
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: C.textMuted }}>
          <Edit3 style={{ width: '11px', height: '11px' }} />Cliquez sur <strong>✏️</strong> ou un jour pour modifier
        </div>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px', alignItems: 'start' }}>

        {/* Calendar */}
        <SectionCard title="Calendrier — Avril 2026" subtitle="Cliquez sur le crayon pour modifier un jour" accent={C.green}
          actions={
            <div style={{ display: 'flex', gap: '3px' }}>
              {[ChevronLeft, ChevronRight].map((Icon, i) => (
                <button key={i} style={{ width: '26px', height: '26px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '14px', height: '14px', color: C.textMuted }} />
                </button>
              ))}
            </div>
          }
        >
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
              const weekend = isWeekend(day);
              const slots = dayData[day] || [];
              const total = getTotal(day);
              const isSelected = selectedDay === day;
              const isToday = day === 10;

              return (
                <div key={i}
                  style={{
                    minHeight: '68px', borderRadius: R, padding: '4px 4px 3px',
                    backgroundColor: isSelected ? `${C.green}10` : weekend ? `${C.borderLight}60` : C.white,
                    border: `1px solid ${isSelected ? C.green : isToday ? C.purple : C.borderLight}`,
                    cursor: weekend ? 'default' : 'pointer', transition: 'all 0.12s',
                    outline: isToday ? `2px solid ${C.purple}30` : 'none',
                  }}
                  onClick={() => !weekend && setSelectedDay(day)}
                  onMouseEnter={e => { if (!weekend) (e.currentTarget as HTMLDivElement).style.borderColor = C.green; }}
                  onMouseLeave={e => { if (!weekend) (e.currentTarget as HTMLDivElement).style.borderColor = isSelected ? C.green : isToday ? C.purple : C.borderLight; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: isToday ? 800 : 600, color: isToday ? C.purple : weekend ? C.textMuted : C.text }}>{day}</span>
                    {!weekend && (
                      <button
                        onClick={e => { e.stopPropagation(); setEditingDay(day); setSelectedDay(day); }}
                        style={{ width: '14px', height: '14px', borderRadius: '2px', border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6, flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${C.green}20`; e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = C.green; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.borderColor = C.border; }}
                        title="Modifier ce jour"
                      >
                        <Edit3 style={{ width: '8px', height: '8px', color: C.green }} />
                      </button>
                    )}
                  </div>

                  {/* Slot bars */}
                  {slots.slice(0, 2).map((sl, si) => (
                    <div key={si} style={{ height: '10px', borderRadius: '2px', backgroundColor: sl.color, display: 'flex', alignItems: 'center', paddingLeft: '3px', marginBottom: '2px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '7px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sl.project.split(' ')[1] || sl.project} {sl.alloc}%
                      </span>
                    </div>
                  ))}
                  {slots.length > 2 && <span style={{ fontSize: '8px', color: C.textMuted }}>+{slots.length - 2}</span>}

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
            {[{ c: C.purple, l: 'Projet Alpha' }, { c: C.blue, l: 'Projet Beta' }, { c: '#F59E0B', l: 'Formation' }, { c: '#9CA3AF', l: 'Congé' }, { c: C.red, l: 'Surcharge' }].map(l => (
              <div key={l.l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: C.textMuted }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: l.c }} />{l.l}
              </div>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '10px', color: C.textMuted, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Edit3 style={{ width: '9px', height: '9px' }} />Icône = modifier
            </span>
          </div>
        </SectionCard>

        {/* Day detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ ...cardStyle, borderTop: `3px solid ${C.green}` }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>
                {selectedDay ? `${selectedDay} Avril 2026` : 'Sélectionnez un jour'}
              </p>
              {selectedDay && !isWeekend(selectedDay) && (
                <button onClick={() => setEditingDay(selectedDay)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 9px', borderRadius: R, border: `1px solid ${C.green}40`, backgroundColor: `${C.green}10`, color: C.green, cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>
                  <Edit3 style={{ width: '10px', height: '10px' }} />Modifier
                </button>
              )}
            </div>
            <div style={{ padding: '12px 14px' }}>
              {selectedDay ? (
                isWeekend(selectedDay) ? (
                  <p style={{ fontSize: '12px', color: C.textMuted, textAlign: 'center', padding: '12px 0' }}>Weekend / Jour non ouvrable</p>
                ) : (dayData[selectedDay] || []).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(dayData[selectedDay] || []).map((sl, i) => (
                      <div key={i} style={{ padding: '8px 10px', borderRadius: R, borderLeft: `3px solid ${sl.color}`, border: `1px solid ${sl.color}20`, borderLeftWidth: '3px', backgroundColor: `${sl.color}06` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: C.text }}>{sl.project}</p>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: sl.color }}>{sl.alloc}%</span>
                        </div>
                        <div style={{ height: '3px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '2px', backgroundColor: sl.color, width: `${sl.alloc}%` }} />
                        </div>
                        {sl.note && <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '3px' }}>{sl.note}</p>}
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: '11px', color: C.textSecondary }}>Total</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: loadColor(getTotal(selectedDay)) }}>{getTotal(selectedDay)}%</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <p style={{ fontSize: '12px', color: C.textMuted, marginBottom: '10px' }}>Aucune allocation</p>
                    <button onClick={() => setEditingDay(selectedDay)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: R, border: `1px solid ${C.green}40`, backgroundColor: `${C.green}10`, color: C.green, cursor: 'pointer', fontSize: '11px', fontWeight: 700, margin: '0 auto' }}>
                      <Plus style={{ width: '12px', height: '12px' }} />Ajouter
                    </button>
                  </div>
                )
              ) : (
                <p style={{ fontSize: '12px', color: C.textMuted, textAlign: 'center', padding: '16px 0' }}>Cliquez sur un jour du calendrier</p>
              )}
            </div>
          </div>

          {/* Monthly summary */}
          <div style={{ ...cardStyle, padding: '12px 14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: C.text, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar style={{ width: '12px', height: '12px', color: C.green }} />Résumé — Avril 2026
            </p>
            {[
              { l: 'Jours saisis', v: Object.keys(dayData).filter(d => !isWeekend(Number(d))).length },
              { l: 'Proj. Alpha', v: `55%` },
              { l: 'Proj. Beta', v: `40%` },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '11px', color: C.textMuted }}>{s.l}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingDay !== null && (
        <EditDayModal
          day={editingDay}
          slots={dayData[editingDay] || []}
          onSave={handleSaveDay}
          onClose={() => setEditingDay(null)}
        />
      )}
    </div>
  );
}
