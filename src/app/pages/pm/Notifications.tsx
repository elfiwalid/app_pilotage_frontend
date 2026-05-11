import { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Briefcase, Clock, Check, Trash2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { C, R, PageHeader, cardStyle } from '../../components/ui/design-system';

const INIT = [
  { id: 1, type: 'anomaly', title: 'Anomalie critique — Projet Alpha', body: 'Youssef El Amrani dépasse 180% d\'allocation sur vos projets. Correction requise pour respecter les délais Sprint 3.', time: 'Il y a 10 min', read: false, icon: AlertTriangle, color: C.red },
  { id: 2, type: 'project', title: 'Rapport V2 Forecast disponible', body: 'Le rapport V2 Forecast (Janvier – Mars 2026) est disponible en téléchargement. Valeurs finales confirmées.', time: 'Il y a 1h', read: true, icon: Briefcase, color: C.blue },
  { id: 3, type: 'budget', title: 'Alerte budget — Projet Beta', body: 'La consommation du budget Projet Beta atteint 90% (135K€/150K€). Risque de dépassement identifié.', time: 'Il y a 2h', read: true, icon: TrendingUp, color: '#F59E0B' },
];

const TYPE_CFG: Record<string, { label: string; bg: string; text: string }> = {
  anomaly: { label: 'Anomalie', bg: '#FEF2F2', text: '#B91C1C' },
  project: { label: 'Projet', bg: '#EFF6FF', text: '#1D4ED8' },
  budget: { label: 'Budget', bg: '#FFF7ED', text: '#92400E' },
};

export function PmNotifications() {
  const [notifs, setNotifs] = useState(INIT);
  const [filter, setFilter] = useState('all');

  const filtered = notifs.filter(n =>
    filter === 'all' ? true :
    filter === 'unread' ? !n.read :
    n.type === filter
  );
  const unread = notifs.filter(n => !n.read).length;

  const markAll = () => { setNotifs(p => p.map(n => ({ ...n, read: true }))); toast.success('Tout marqué comme lu.'); };
  const del = (id: number) => { setNotifs(p => p.filter(n => n.id !== id)); };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <PageHeader title="Notifications" subtitle="Alertes projets, anomalies et budgets Staff2Staff">
        {unread > 0 && (
          <button onClick={markAll} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.textSecondary, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
            <Check style={{ width: '12px', height: '12px' }} />Tout marquer lu
          </button>
        )}
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {[{ l: 'Total', v: notifs.length, c: '#6B7280' }, { l: 'Non lues', v: unread, c: C.blue }, { l: 'Anomalies', v: notifs.filter(n => n.type === 'anomaly').length, c: C.red }].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.c}`, padding: '10px 14px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{s.l}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        {[['all', 'Toutes'], ['unread', 'Non lues'], ['anomaly', 'Anomalies'], ['project', 'Projets']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ padding: '5px 12px', borderRadius: R, border: `1px solid ${filter === v ? C.blue : C.border}`, backgroundColor: filter === v ? `${C.blue}10` : '#fff', color: filter === v ? C.blue : C.textMuted, cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(n => {
          const tc = TYPE_CFG[n.type] || TYPE_CFG.project;
          return (
            <div key={n.id} style={{ ...cardStyle, borderLeft: `4px solid ${n.read ? C.borderLight : n.color}`, backgroundColor: n.read ? '#fff' : `${n.color}04` }}>
              <div style={{ padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: R, backgroundColor: `${n.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <n.icon style={{ width: '15px', height: '15px', color: n.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <p style={{ fontSize: '13px', fontWeight: n.read ? 600 : 700, color: C.text }}>{n.title}</p>
                    {!n.read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: n.color }} />}
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '3px', backgroundColor: tc.bg, color: tc.text }}>{tc.label}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.5, marginBottom: '5px' }}>{n.body}</p>
                  <span style={{ fontSize: '10px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '10px', height: '10px' }} />{n.time}</span>
                </div>
                <button onClick={() => del(n.id)} style={{ width: '27px', height: '27px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FEF2F2')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}>
                  <Trash2 style={{ width: '11px', height: '11px', color: C.red }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
