import { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Users, Clock, Check, Trash2, Activity, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { C, R, PageHeader, cardStyle } from '../../components/ui/design-system';

const INIT = [
  { id: 1, type: 'conflict', title: 'Conflit critique — Youssef El Amrani', body: 'Surcharge à 180% sur Projets Alpha, Beta et Gamma simultanément. Action immédiate requise.', time: 'Il y a 5 min', read: false, icon: AlertTriangle, color: C.red },
  { id: 2, type: 'assignment', title: 'Affectation validée — Projet Alpha', body: 'L\'affectation de Khalid Bennani sur Projet Alpha (40%) a été confirmée par le Chef de Projet.', time: 'Il y a 22 min', read: false, icon: CheckCircle, color: C.green },
  { id: 3, type: 'conflict', title: 'Surcharge détectée — Sara Benali', body: 'Sara Benali atteint 200% d\'allocation sur Projets Delta et Epsilon. Conflit critique en attente.', time: 'Il y a 1h', read: false, icon: AlertTriangle, color: C.red },
  { id: 4, type: 'resource', title: 'Ressource sous-utilisée — Hamza Lahlou', body: 'Hamza Lahlou alloué à seulement 30% de capacité. Opportunité d\'optimisation disponible.', time: 'Il y a 2h', read: true, icon: Users, color: '#F59E0B' },
  { id: 5, type: 'system', title: 'Rapport mensuel disponible', body: 'Rapport de staffing Mars 2026 prêt. Taux global : 92%. 5 anomalies détectées.', time: 'Hier 16h00', read: true, icon: Activity, color: C.blue },
  { id: 6, type: 'conflict', title: 'Simulation what-if — Résultat partiel', body: 'Le transfert d\'allocation Ahmed → Hamza (25%) sur Projet Iota retourne un conflit résiduel de 20%.', time: 'Hier 10h30', read: true, icon: AlertCircle, color: '#F59E0B' },
];

const TYPE_CFG: Record<string, { label: string; bg: string; text: string }> = {
  conflict: { label: 'Conflit', bg: '#FEF2F2', text: '#B91C1C' },
  assignment: { label: 'Affectation', bg: '#ECFDF5', text: '#065F46' },
  resource: { label: 'Ressource', bg: '#FFF7ED', text: '#92400E' },
  system: { label: 'Système', bg: '#EFF6FF', text: '#1D4ED8' },
};

export function RmNotifications() {
  const [notifs, setNotifs] = useState(INIT);
  const [filter, setFilter] = useState('all');

  const filtered = notifs.filter(n =>
    filter === 'all' ? true :
    filter === 'unread' ? !n.read :
    n.type === filter
  );
  const unread = notifs.filter(n => !n.read).length;

  const markRead = (id: number) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAll = () => { setNotifs(p => p.map(n => ({ ...n, read: true }))); toast.success('Toutes les notifications marquées comme lues.'); };
  const del = (id: number) => { setNotifs(p => p.filter(n => n.id !== id)); toast.success('Notification supprimée.'); };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <PageHeader title="Notifications" subtitle="Conflits, affectations et alertes système Staff2Staff">
        {unread > 0 && (
          <button onClick={markAll} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.textSecondary, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}>
            <Check style={{ width: '12px', height: '12px' }} />Tout marquer lu
          </button>
        )}
      </PageHeader>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[{ l: 'Total', v: notifs.length, c: '#6B7280' }, { l: 'Non lues', v: unread, c: C.magenta }, { l: 'Conflits', v: notifs.filter(n => n.type === 'conflict').length, c: C.red }, { l: 'Affectations', v: notifs.filter(n => n.type === 'assignment').length, c: C.green }].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.c}`, padding: '10px 14px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{s.l}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[['all', 'Toutes'], ['unread', 'Non lues'], ['conflict', 'Conflits'], ['assignment', 'Affectations'], ['resource', 'Ressources']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ padding: '5px 12px', borderRadius: R, border: `1px solid ${filter === v ? C.magenta : C.border}`, backgroundColor: filter === v ? `${C.magenta}10` : '#fff', color: filter === v ? C.magenta : C.textMuted, cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {l}
            {v === 'unread' && unread > 0 && <span style={{ backgroundColor: C.magenta, color: '#fff', fontSize: '9px', fontWeight: 800, padding: '0 4px', borderRadius: '8px', lineHeight: '14px' }}>{unread}</span>}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 && (
          <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
            <CheckCircle style={{ width: '32px', height: '32px', color: C.green, margin: '0 auto 10px' }} />
            <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Aucune notification</p>
            <p style={{ fontSize: '12px', color: C.textMuted }}>Vous êtes à jour !</p>
          </div>
        )}
        {filtered.map(n => {
          const tc = TYPE_CFG[n.type] || TYPE_CFG.system;
          return (
            <div key={n.id} style={{ ...cardStyle, borderLeft: `4px solid ${n.read ? C.borderLight : n.color}`, backgroundColor: n.read ? '#fff' : `${n.color}04`, transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)')}>
              <div style={{ padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: R, backgroundColor: `${n.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <n.icon style={{ width: '16px', height: '16px', color: n.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '13px', fontWeight: n.read ? 600 : 700, color: C.text }}>{n.title}</p>
                    {!n.read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: n.color, flexShrink: 0 }} />}
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '3px', backgroundColor: tc.bg, color: tc.text }}>{tc.label}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.5, marginBottom: '5px' }}>{n.body}</p>
                  <span style={{ fontSize: '10px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock style={{ width: '10px', height: '10px' }} />{n.time}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} style={{ width: '28px', height: '28px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#ECFDF5')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')} title="Marquer comme lu">
                      <Check style={{ width: '12px', height: '12px', color: C.green }} />
                    </button>
                  )}
                  <button onClick={() => del(n.id)} style={{ width: '28px', height: '28px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FEF2F2')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')} title="Supprimer">
                    <Trash2 style={{ width: '12px', height: '12px', color: C.red }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
