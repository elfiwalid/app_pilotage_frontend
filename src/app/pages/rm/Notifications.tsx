import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bell, CheckCircle, AlertTriangle, Briefcase, FolderKanban, Clock, Check, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { C, R, PageHeader, cardStyle } from '../../components/ui/design-system';
import {
  fetchMesNotifications, marquerCommeLue, marquerToutesCommeLues, supprimerNotification,
  type NotificationResponseDTO,
} from '../../services/notificationService';
import { getNotificationTarget } from '../../services/notificationRouting';

const TYPE_CFG: Record<string, { label: string; bg: string; text: string; color: string; icon: any }> = {
  ANOMALIE: { label: 'Conflit', bg: '#FEF2F2', text: '#B91C1C', color: C.red, icon: AlertTriangle },
  AFFECTATION: { label: 'Affectation', bg: '#ECFDF5', text: '#065F46', color: C.green, icon: Briefcase },
  PROJET: { label: 'Projet', bg: '#EFF6FF', text: '#1D4ED8', color: C.blue, icon: FolderKanban },
  SYSTEME: { label: 'Système', bg: `${C.magenta}10`, text: C.magenta, color: C.magenta, icon: Bell },
};

function timeAgo(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "À l'instant";
    if (min < 60) return `Il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Il y a ${h}h`;
    const days = Math.floor(h / 24);
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

export function RmNotifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<NotificationResponseDTO[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setNotifs(await fetchMesNotifications());
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = notifs.filter(n =>
    filter === 'all' ? true :
    filter === 'unread' ? !n.lu :
    n.type === filter
  );
  const unread = notifs.filter(n => !n.lu).length;

  const markRead = async (id: number) => {
    try { await marquerCommeLue(id); setNotifs(p => p.map(n => n.id === id ? { ...n, lu: true } : n)); }
    catch (e: any) { toast.error(e.message || 'Erreur.'); }
  };
  const markAll = async () => {
    try { await marquerToutesCommeLues(); setNotifs(p => p.map(n => ({ ...n, lu: true }))); toast.success('Toutes les notifications marquées comme lues.'); }
    catch (e: any) { toast.error(e.message || 'Erreur.'); }
  };
  const del = async (id: number) => {
    try { await supprimerNotification(id); setNotifs(p => p.filter(n => n.id !== id)); toast.success('Notification supprimée.'); }
    catch (e: any) { toast.error(e.message || 'Erreur.'); }
  };
  const openNotification = async (n: NotificationResponseDTO) => {
    if (!n.lu) {
      await markRead(n.id);
    }
    navigate(getNotificationTarget(n, 'rm'));
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 style={{ width: '32px', height: '32px', color: C.magenta, animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: C.textMuted }}>Chargement des notifications…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <AlertTriangle style={{ width: '32px', height: '32px', color: C.red }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>Erreur de chargement</p>
          <p style={{ fontSize: '12px', color: C.textSecondary, maxWidth: '320px' }}>{error}</p>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: R, border: 'none', backgroundColor: C.magenta, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
            <RefreshCw style={{ width: '12px', height: '12px' }} />Réessayer
          </button>
        </div>
      </div>
    );
  }

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
        {[
          { l: 'Total', v: notifs.length, c: '#6B7280' },
          { l: 'Non lues', v: unread, c: C.magenta },
          { l: 'Conflits', v: notifs.filter(n => n.type === 'ANOMALIE').length, c: C.red },
          { l: 'Projets', v: notifs.filter(n => n.type === 'PROJET').length, c: C.blue },
        ].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.c}`, padding: '10px 14px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{s.l}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[['all', 'Toutes'], ['unread', 'Non lues'], ['ANOMALIE', 'Conflits'], ['PROJET', 'Projets'], ['AFFECTATION', 'Affectations']].map(([v, l]) => (
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
          const tc = TYPE_CFG[n.type] || TYPE_CFG.SYSTEME;
          const Icon = tc.icon;
          return (
            <div key={n.id} onClick={() => openNotification(n)} style={{ ...cardStyle, borderLeft: `4px solid ${n.lu ? C.borderLight : tc.color}`, backgroundColor: n.lu ? '#fff' : `${tc.color}04`, transition: 'box-shadow 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)')}>
              <div style={{ padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: R, backgroundColor: `${tc.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '16px', height: '16px', color: tc.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '13px', fontWeight: n.lu ? 600 : 700, color: C.text }}>{n.titre}</p>
                    {!n.lu && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: tc.color, flexShrink: 0 }} />}
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '3px', backgroundColor: tc.bg, color: tc.text }}>{tc.label}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.5, marginBottom: '5px' }}>{n.message}</p>
                  <span style={{ fontSize: '10px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock style={{ width: '10px', height: '10px' }} />{timeAgo(n.dateCreation)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {!n.lu && (
                    <button onClick={(e) => { e.stopPropagation(); markRead(n.id); }} style={{ width: '28px', height: '28px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#ECFDF5')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')} title="Marquer comme lu">
                      <Check style={{ width: '12px', height: '12px', color: C.green }} />
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); del(n.id); }} style={{ width: '28px', height: '28px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
