import { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Calendar, Briefcase, Clock, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { C, R, PageHeader, cardStyle } from '../../components/ui/design-system';

const ALL_NOTIFS = [
  { id: 1, type: 'assignment', title: 'Nouvelle affectation', body: 'Vous avez été affecté au Projet Gamma à hauteur de 40%. Prise d\'effet le 15 Avril 2026.', time: 'Il y a 1h', read: false, icon: Briefcase, color: C.green, priority: 'medium' },
  { id: 2, type: 'meeting', title: 'Réunion Projet Alpha demain', body: 'Sprint review avec le client BCP Bank — Demain 10h00, Salle Agadir.', time: 'Il y a 2h', read: false, icon: Calendar, color: C.purple, priority: 'high' },
  { id: 3, type: 'update', title: 'Planning mis à jour', body: 'Votre planning a été modifié par le Resource Manager. Projet Beta : +5% allocation du 18 au 25 Avril.', time: 'Il y a 3h', read: true, icon: Bell, color: C.blue, priority: 'low' },
  { id: 4, type: 'conflict', title: 'Alerte surcharge détectée', body: 'Votre taux de charge atteint 95%. Le Resource Manager a été notifié. Une révision de votre planning peut être effectuée.', time: 'Hier 15h30', read: true, icon: AlertCircle, color: '#F59E0B', priority: 'high' },
  { id: 5, type: 'meeting', title: 'Sprint planning Q2 — Projet Beta', body: 'Invitation reçue pour le sprint planning du 2ème trimestre. Mercredi 15 Avril à 14h00.', time: 'Hier 11h00', read: true, icon: Calendar, color: C.blue, priority: 'medium' },
  { id: 6, type: 'assignment', title: 'Tâche assignée — Documentation API', body: 'Une nouvelle tâche vous a été assignée : Documentation API v3 pour le Projet Alpha. Deadline : 14/04/2026.', time: '08/04/2026', read: true, icon: Briefcase, color: C.purple, priority: 'low' },
];

const TYPE_CFG: Record<string, { label: string; bg: string; text: string }> = {
  assignment: { label: 'Affectation', bg: '#ECFDF5', text: '#065F46' },
  meeting: { label: 'Réunion', bg: '#EFF6FF', text: '#1D4ED8' },
  update: { label: 'Mise à jour', bg: `${C.purple}10`, text: C.purple },
  conflict: { label: 'Alerte', bg: '#FFF7ED', text: '#92400E' },
};

const PRIORITY_BAR: Record<string, string> = { high: C.red, medium: '#F59E0B', low: C.green };

export function CollabNotifications() {
  const [notifs, setNotifs] = useState(ALL_NOTIFS);
  const [filter, setFilter] = useState('all');

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'assignment') return n.type === 'assignment';
    if (filter === 'meeting') return n.type === 'meeting';
    if (filter === 'alert') return n.type === 'conflict';
    return true;
  });

  const markRead = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAll = () => { setNotifs(prev => prev.map(n => ({ ...n, read: true }))); toast.success('Toutes les notifications marquées comme lues.'); };
  const deleteNotif = (id: number) => { setNotifs(prev => prev.filter(n => n.id !== id)); toast.success('Notification supprimée.'); };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <PageHeader title="Notifications" subtitle="Alertes, affectations et mises à jour importantes">
        {unreadCount > 0 && (
          <button onClick={markAll}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.textSecondary, cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <Check style={{ width: '12px', height: '12px' }} />Tout marquer lu
          </button>
        )}
      </PageHeader>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { l: 'Total', v: notifs.length, c: '#6B7280' },
          { l: 'Non lues', v: unreadCount, c: C.magenta },
          { l: 'Alertes', v: notifs.filter(n => n.type === 'conflict').length, c: '#F59E0B' },
          { l: 'Réunions', v: notifs.filter(n => n.type === 'meeting').length, c: C.blue },
        ].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.c}`, padding: '10px 14px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{s.l}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {[['all', 'Toutes'], ['unread', 'Non lues'], ['assignment', 'Affectations'], ['meeting', 'Réunions'], ['alert', 'Alertes']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ padding: '5px 12px', borderRadius: R, border: `1px solid ${filter === v ? C.green : C.border}`, backgroundColor: filter === v ? `${C.green}10` : '#fff', color: filter === v ? C.green : C.textMuted, cursor: 'pointer', fontSize: '11px', fontWeight: 600, transition: 'all 0.12s' }}
          >{l}{v === 'unread' && unreadCount > 0 && <span style={{ marginLeft: '5px', backgroundColor: C.magenta, color: '#fff', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '10px' }}>{unreadCount}</span>}</button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 && (
          <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
            <CheckCircle style={{ width: '32px', height: '32px', color: C.green, margin: '0 auto 10px' }} />
            <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Aucune notification</p>
            <p style={{ fontSize: '12px', color: C.textMuted }}>Vous êtes à jour !</p>
          </div>
        )}
        {filtered.map(n => {
          const tc = TYPE_CFG[n.type];
          const priorityColor = PRIORITY_BAR[n.priority];
          return (
            <div key={n.id}
              style={{ ...cardStyle, borderLeft: `4px solid ${n.read ? C.borderLight : n.color}`, backgroundColor: n.read ? C.white : `${n.color}04`, transition: 'all 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)')}
            >
              <div style={{ padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {/* Icon */}
                <div style={{ width: '36px', height: '36px', borderRadius: R, backgroundColor: `${n.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <n.icon style={{ width: '16px', height: '16px', color: n.color }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '13px', fontWeight: n.read ? 600 : 700, color: C.text }}>{n.title}</p>
                    {!n.read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: n.color, flexShrink: 0 }} />}
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '3px', backgroundColor: tc.bg, color: tc.text }}>{tc.label}</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '3px', backgroundColor: `${priorityColor}15`, color: priorityColor }}>
                      {n.priority === 'high' ? 'Priorité haute' : n.priority === 'medium' ? 'Priorité moyenne' : 'Priorité basse'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.5, marginBottom: '6px' }}>{n.body}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '10px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock style={{ width: '10px', height: '10px' }} />{n.time}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)}
                      style={{ width: '28px', height: '28px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Marquer comme lu"
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#ECFDF5')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                    >
                      <Check style={{ width: '12px', height: '12px', color: C.green }} />
                    </button>
                  )}
                  <button onClick={() => deleteNotif(n.id)}
                    style={{ width: '28px', height: '28px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Supprimer"
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FEF2F2')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                  >
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
