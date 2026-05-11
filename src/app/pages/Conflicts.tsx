import { useState } from 'react';
import { AlertTriangle, Search, Filter, Mail, UserPlus, Eye, AlertCircle, TrendingUp, TrendingDown, Calendar, X, Clock, Users, CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { C, S, R, PageHeader, SectionCard, BtnPrimary, BtnSecondary, BtnGhost, Avatar, Modal, ModalHeader, SectionLabel, thStyle, tdStyle, cardStyle } from '../components/ui/design-system';

/* ─── DATA ─────────────────────────────────────── */
const conflicts = [
  { id: 1, employee: 'Youssef El Amrani', initials: 'YA', role: 'Architecte Solution', manager: 'Fatima Zahra Bennis', projects: [{ name: 'Projet Alpha', manager: 'Fatima Zahra Bennis', charge: 55, color: C.purple, startDay: 1, dur: 20 }, { name: 'Projet Beta', manager: 'Khalid Bennani', charge: 40, color: C.blue, startDay: 8, dur: 22 }, { name: 'Projet Gamma', manager: 'Amina Tazi', charge: 85, color: '#F59E0B', startDay: 15, dur: 15 }], period: '15 Avr – 30 Avr 2026', days: 15, charge: 180, sev: 'critical', type: 'surcharge', msg: 'Affecté à 3 projets simultanément avec une charge totale de 180%' },
  { id: 2, employee: 'Sara Benali', initials: 'SB', role: 'Data Scientist', manager: 'Omar El Alami', projects: [{ name: 'Projet Delta', manager: 'Omar El Alami', charge: 100, color: C.green, startDay: 3, dur: 22 }, { name: 'Projet Epsilon', manager: 'Nadia Chraibi', charge: 100, color: C.red, startDay: 10, dur: 15 }], period: '10 Avr – 25 Avr 2026', days: 15, charge: 200, sev: 'critical', type: 'surcharge', msg: 'Double affectation à 100% sur deux projets concurrents — surcharge totale de 200%' },
  { id: 3, employee: 'Hamza Lahlou', initials: 'HL', role: 'Data Analyst', manager: 'Houda Lahlou', projects: [{ name: 'Projet Zeta', manager: 'Houda Lahlou', charge: 30, color: '#8B5CF6', startDay: 1, dur: 30 }], period: '01 Avr – 30 Avr 2026', days: 0, charge: 30, sev: 'low', type: 'sous-utilisation', msg: 'Ressource sous-utilisée à seulement 30% — capacité disponible : 70%' },
  { id: 4, employee: 'Salma Idrissi', initials: 'SI', role: 'Business Analyst', manager: 'Amina Tazi', projects: [{ name: 'Projet Eta', manager: 'Rachid Benjelloun', charge: 100, color: C.blue, startDay: 1, dur: 15 }, { name: 'Projet Theta', manager: 'Soukaina Berrada', charge: 50, color: '#F59E0B', startDay: 5, dur: 15 }], period: '05 Avr – 20 Avr 2026', days: 10, charge: 150, sev: 'high', type: 'surcharge', msg: 'Surcharge de 150% détectée sur la période du 05 au 20 Avril' },
  { id: 5, employee: 'Imane El Fassi', initials: 'IF', role: 'ML Engineer', manager: 'Omar El Alami', projects: [{ name: 'Projet Lambda', manager: 'Driss El Fassi', charge: 45, color: C.green, startDay: 1, dur: 30 }], period: '01 Avr – 30 Avr 2026', days: 0, charge: 45, sev: 'medium', type: 'sous-utilisation', msg: "Ressource sous-utilisée à 45% — optimisation possible de l'allocation" },
];

const altResources = [
  { name: 'Khalid Bennani', dispo: 60, role: 'Tech Lead', color: C.purple },
  { name: 'Amina Tazi', dispo: 80, role: 'Business Analyst', color: C.blue },
  { name: 'Omar Idrissi', dispo: 40, role: 'Dev Senior', color: C.green },
  { name: 'Houda Lahlou', dispo: 70, role: 'Data Engineer', color: '#F59E0B' },
];

const SEV: Record<string, { label: string; bg: string; text: string; border: string; bar: string }> = {
  critical: { label: 'Critique', bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', bar: C.red },
  high: { label: 'Élevée', bg: '#FFF7ED', text: '#92400E', border: '#FDE68A', bar: '#F59E0B' },
  medium: { label: 'Moyenne', bg: '#FFFBEB', text: '#92400E', border: '#FEF3C7', bar: '#F59E0B' },
  low: { label: 'Faible', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', bar: C.blue },
};

const MONTH = 30;

/* ─── DETAIL MODAL ──────────────────────────────── */
function DetailModal({ c, onClose, onNotify, notified }: { c: typeof conflicts[0]; onClose: () => void; onNotify: () => void; notified: boolean }) {
  const isSurcharge = c.type === 'surcharge';
  const sev = SEV[c.sev];
  const days = Array.from({ length: MONTH }, (_, i) => i + 1);
  const dl: Record<number, number> = {};
  c.projects.forEach(p => { for (let d = p.startDay; d < p.startDay + p.dur; d++) dl[d] = (dl[d] || 0) + p.charge; });
  const isWknd = (d: number) => [0, 6].includes(new Date(2026, 3, d).getDay());

  return (
    <Modal onClose={onClose} maxWidth="900px" accentColor={sev.bar}>
      <ModalHeader title={`Détails — ${c.employee}`} subtitle={`${c.role} · ${c.period}`} onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Key metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
          {[
            { l: 'Collaborateur', v: c.employee },
            { l: 'Chef de projet', v: c.manager },
            { l: 'Taux de charge', v: `${c.charge}%`, color: c.charge > 100 ? C.red : C.blue },
            { l: 'Sévérité', v: sev.label, color: sev.text, bg: sev.bg, border: sev.border },
          ].map((item, i) => (
            <div key={i} style={{ padding: '8px 12px', borderRadius: R, backgroundColor: item.bg || C.bg, border: `1px solid ${item.border || C.border}` }}>
              <p style={{ fontSize: '9px', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{item.l}</p>
              <p style={{ fontSize: '12px', fontWeight: 700, color: item.color || C.text }}>{item.v}</p>
            </div>
          ))}
        </div>

        {/* Alert banner */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', borderRadius: R, backgroundColor: isSurcharge ? '#FEF2F2' : '#EFF6FF', border: `1px solid ${isSurcharge ? '#FECACA' : '#BFDBFE'}`, borderLeft: `3px solid ${sev.bar}` }}>
          <AlertTriangle style={{ width: '14px', height: '14px', color: sev.bar, flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: sev.text, marginBottom: '2px' }}>{isSurcharge ? 'Anomalie de surcharge' : 'Ressource sous-utilisée'}</p>
            <p style={{ fontSize: '12px', color: sev.text }}>{c.msg}</p>
          </div>
        </div>

        {/* Calendar */}
        <div style={{ backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}`, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar style={{ width: '13px', height: '13px', color: C.purple }} />Vue Calendrier — Avril 2026
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
              <div style={{ display: 'flex', marginBottom: '4px' }}>
                <div style={{ width: '148px', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'grid', gap: '1px', gridTemplateColumns: `repeat(${MONTH},1fr)` }}>
                  {days.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '9px', fontWeight: 600, padding: '2px 0', borderRadius: '2px', backgroundColor: dl[d] > 100 ? '#FECACA' : isWknd(d) ? C.borderLight : 'transparent', color: dl[d] > 100 ? C.red : C.textMuted }}>{d}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {c.projects.map((p, pi) => (
                  <div key={pi} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '148px', flexShrink: 0, paddingRight: '8px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: '9px', color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.manager}</p>
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: '28px' }}>
                      <div style={{ position: 'absolute', inset: 0, display: 'grid', gap: '1px', gridTemplateColumns: `repeat(${MONTH},1fr)` }}>
                        {days.map(d => <div key={d} style={{ backgroundColor: isWknd(d) ? C.borderLight : '#fff', height: '100%' }} />)}
                      </div>
                      <div style={{ position: 'absolute', top: '2px', bottom: '2px', left: `${((p.startDay - 1) / MONTH) * 100}%`, width: `${(p.dur / MONTH) * 100}%`, backgroundColor: p.color, opacity: 0.9, borderRadius: '2px', display: 'flex', alignItems: 'center', paddingLeft: '5px', zIndex: 1 }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.name} · {p.charge}%</span>
                      </div>
                      {days.map(d => {
                        const inP = d >= p.startDay && d < p.startDay + p.dur;
                        if (!inP || dl[d] <= 100) return null;
                        return <div key={d} style={{ position: 'absolute', top: 0, bottom: 0, left: `${((d - 1) / MONTH) * 100}%`, width: `${(1 / MONTH) * 100}%`, backgroundColor: 'rgba(239,68,68,0.25)', borderLeft: `1px solid ${C.red}`, zIndex: 2 }} />;
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '14px', marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
                {isSurcharge && <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: C.textMuted }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: C.red }} />Conflit</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: C.textMuted }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: C.borderLight }} />Weekend</div>
                {c.projects.map((p, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: C.textMuted }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: p.color }} />{p.name}</div>)}
              </div>
            </div>
          </div>
        </div>

        {/* Allocation detail */}
        <div>
          <SectionLabel>Détails des allocations</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {c.projects.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${p.color}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{p.name}</p>
                  <p style={{ fontSize: '10px', color: C.textMuted }}>Chef : {p.manager}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '80px', height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: p.charge >= 100 ? C.red : p.charge >= 80 ? '#F59E0B' : C.green, width: `${Math.min(p.charge, 100)}%` }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: p.charge >= 100 ? C.red : p.charge >= 80 ? '#F59E0B' : C.green, minWidth: '36px', textAlign: 'right' }}>{p.charge}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alternatives — surcharge only */}
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

/* ─── MAIN ─────────────────────────────────────── */
export function Conflicts() {
  const [selected, setSelected] = useState<typeof conflicts[0] | null>(null);
  const [filterSev, setFilterSev] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [notified, setNotified] = useState<number[]>([]);

  const filtered = conflicts.filter(c => {
    if (filterSev !== 'all' && c.sev !== filterSev) return false;
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (search && !c.employee.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const notify = (c: typeof conflicts[0]) => {
    if (!notified.includes(c.id)) { setNotified(p => [...p, c.id]); toast.success(`Notification envoyée à ${c.manager} — ${c.employee}`); }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Gestion des Conflits" subtitle="Détection et résolution des anomalies de staffing">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: R }}>
          <AlertCircle style={{ width: '12px', height: '12px', color: C.red }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#B91C1C' }}>{filtered.length} conflits actifs</span>
        </div>
      </PageHeader>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { l: 'Total Conflits', v: conflicts.length, i: AlertCircle, c: '#6B7280' },
          { l: 'Conflits Critiques', v: conflicts.filter(c => c.sev === 'critical').length, i: AlertTriangle, c: C.red },
          { l: 'Ressources Surchargées', v: conflicts.filter(c => c.type === 'surcharge').length, i: TrendingUp, c: '#F59E0B' },
          { l: 'Sous-utilisées', v: conflicts.filter(c => c.type === 'sous-utilisation').length, i: TrendingDown, c: C.blue },
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
        <Select value={filterSev} onValueChange={setFilterSev}>
          <SelectTrigger style={{ width: '150px', fontSize: '12px', borderRadius: R, height: '32px', backgroundColor: '#fff' }}><SelectValue placeholder="Sévérité" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes sévérités</SelectItem>
            <SelectItem value="critical">Critique</SelectItem>
            <SelectItem value="high">Élevée</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="low">Faible</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger style={{ width: '170px', fontSize: '12px', borderRadius: R, height: '32px', backgroundColor: '#fff' }}><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="surcharge">Surcharge</SelectItem>
            <SelectItem value="sous-utilisation">Sous-utilisation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conflict list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(c => {
          const sev = SEV[c.sev];
          const isSurcharge = c.type === 'surcharge';
          const isNotified = notified.includes(c.id);

          return (
            <div key={c.id} style={{ ...cardStyle, borderLeft: `4px solid ${sev.bar}` }}>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <Avatar name={c.employee} color={isSurcharge ? sev.bar : C.blue} size={36} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name + badges */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{c.employee}</p>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: sev.bg, border: `1px solid ${sev.border}`, color: sev.text }}>{sev.label}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: isSurcharge ? '#FEF2F2' : '#EFF6FF', color: isSurcharge ? '#B91C1C' : '#1D4ED8' }}>{isSurcharge ? 'Surcharge' : 'Sous-utilisation'}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: C.textMuted, marginBottom: '8px' }}>{c.role}</p>

                    {/* Alert */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '7px 10px', borderRadius: R, backgroundColor: sev.bg, border: `1px solid ${sev.border}`, marginBottom: '8px' }}>
                      <AlertTriangle style={{ width: '12px', height: '12px', color: sev.bar, flexShrink: 0, marginTop: '1px' }} />
                      <p style={{ fontSize: '11px', fontWeight: 500, color: sev.text }}>{c.msg}</p>
                    </div>

                    {/* Projects */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                      {c.projects.map((p, i) => (
                        <span key={i} style={{ fontSize: '10px', fontWeight: 700, color: '#fff', backgroundColor: p.color, padding: '2px 8px', borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {p.name} · {p.charge}%
                          {i < c.projects.length - 1 && <ArrowRight style={{ width: '10px', height: '10px', color: C.textMuted, marginLeft: '2px' }} />}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                      {[
                        { icon: Calendar, text: c.period },
                        ...(c.days > 0 ? [{ icon: Clock, text: `${c.days} jours en conflit` }] : []),
                        { icon: Users, text: c.manager },
                      ].map((m, i) => (
                        <span key={i} style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <m.icon style={{ width: '11px', height: '11px' }} />{m.text}
                        </span>
                      ))}
                      <span style={{ fontSize: '12px', fontWeight: 700, color: c.charge > 100 ? C.red : C.blue }}>
                        Charge: {c.charge}%
                      </span>
                    </div>
                  </div>

                  {/* Gauge */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="26" cy="26" r="20" fill="none" stroke={C.borderLight} strokeWidth="5" />
                      <circle cx="26" cy="26" r="20" fill="none"
                        stroke={c.charge > 150 ? C.red : c.charge > 100 ? '#F59E0B' : C.blue}
                        strokeWidth="5"
                        strokeDasharray={`${Math.min((c.charge / 200) * 125.7, 125.7)} 125.7`}
                        strokeLinecap="butt" />
                    </svg>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: c.charge > 150 ? C.red : c.charge > 100 ? '#F59E0B' : C.blue, marginTop: '-38px', zIndex: 1, position: 'relative' }}>{c.charge}%</p>
                    <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '24px' }}>Charge</p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${C.borderLight}` }}>
                  <button onClick={() => notify(c)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: R, border: `1px solid ${isNotified ? '#A7F3D0' : C.border}`, backgroundColor: isNotified ? '#ECFDF5' : '#fff', color: isNotified ? C.green : C.textSecondary, cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                  >
                    {isNotified ? <CheckCircle style={{ width: '13px', height: '13px' }} /> : <Mail style={{ width: '13px', height: '13px' }} />}
                    {isNotified ? 'Chef notifié' : 'Notifier le chef de projet'}
                  </button>
                  <BtnGhost onClick={() => setSelected(c)} small><Eye style={{ width: '12px', height: '12px' }} />Voir les détails</BtnGhost>
                  {isSurcharge && (
                    <BtnPrimary onClick={() => setSelected(c)} small>
                      <UserPlus style={{ width: '12px', height: '12px' }} />Proposer une ressource alternative
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
            <p style={{ fontSize: '12px', color: C.textMuted }}>Aucun conflit ne correspond aux filtres</p>
          </div>
        )}
      </div>

      {selected && <DetailModal c={selected} onClose={() => setSelected(null)} onNotify={() => notify(selected)} notified={notified.includes(selected.id)} />}
    </div>
  );
}