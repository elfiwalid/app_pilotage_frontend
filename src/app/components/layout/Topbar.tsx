import { useState, useEffect } from 'react';
import { Bell, ChevronDown, LogOut, User, Shield, Menu } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { C, S, R } from '../ui/design-system';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';
import {
  fetchMesNotifications,
  marquerToutesCommeLues,
  marquerCommeLue,
  type NotificationResponseDTO,
} from '../../services/notificationService';
import { getNotificationTarget } from '../../services/notificationRouting';

const NOTIF_ROUTE: Record<string, string> = {
  rm: '/rm/notifications',
  pm: '/pm/notifications',
  collab: '/collab/notifications',
};

const PROFILE_ROUTE: Record<string, string> = {
  rm: '/rm/profile',
  pm: '/pm/profile',
  collab: '/collab/profile',
};

function timeAgo(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "A l'instant";
    if (min < 60) return `Il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Il y a ${h}h`;
    const days = Math.floor(h / 24);
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
}

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { role, profile } = useRole();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotificationResponseDTO[]>([]);

  const loadNotifs = async () => {
    try {
      setNotifs(await fetchMesNotifications());
    } catch {
      setNotifs([]);
    }
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 30000);
    window.addEventListener('s2s:notifications-changed', loadNotifs);
    return () => {
      clearInterval(interval);
      window.removeEventListener('s2s:notifications-changed', loadNotifs);
    };
  }, [role]);

  const unreadCount = notifs.filter(n => !n.lu).length;
  const accent = profile.accent;
  const notifRoute = NOTIF_ROUTE[role] ?? '/';
  const profileRoute = PROFILE_ROUTE[role] ?? '/';

  const handleMarkAll = async () => {
    try {
      await marquerToutesCommeLues();
      setNotifs(p => p.map(n => ({ ...n, lu: true })));
    } catch (e: any) {
      toast.error(e.message || 'Erreur.');
    }
  };

  const handleClickNotif = async (n: NotificationResponseDTO) => {
    setNotifOpen(false);
    if (!n.lu) {
      try {
        await marquerCommeLue(n.id);
        setNotifs(p => p.map(x => x.id === n.id ? { ...x, lu: true } : x));
      } catch {
        // Ignore local sync errors; navigation remains useful.
      }
    }
    navigate(getNotificationTarget(n, role));
  };

  return (
    <header className="s2s-topbar" style={{ height: '52px', backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, zIndex: 20, position: 'relative', gap: '12px' }}>
      <button
        type="button"
        className="s2s-mobile-menu-button"
        onClick={onMenuClick}
        aria-label="Ouvrir la navigation"
        style={{ width: '38px', height: '38px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: C.white, cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}
      >
        <Menu style={{ width: '18px', height: '18px', color: C.text }} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, marginLeft: 'auto' }}>
        <div style={{ width: '1px', height: '20px', backgroundColor: C.border }} />

        <div style={{ position: 'relative' }}>
          <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            style={{ width: '34px', height: '34px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.white)}
          >
            <Bell style={{ width: '14px', height: '14px', color: C.text }} />
            {unreadCount > 0 && <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: accent, border: '2px solid white' }} />}
          </button>

          {notifOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setNotifOpen(false)} />
              <div className="s2s-topbar-menu" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '6px', width: '310px', backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, boxShadow: S.elevated, zIndex: 50, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>Notifications <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', backgroundColor: accent, padding: '1px 5px', borderRadius: '10px', marginLeft: '4px' }}>{unreadCount}</span></span>
                  <button onClick={handleMarkAll} style={{ fontSize: '11px', fontWeight: 600, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}>Tout lire</button>
                </div>
                {notifs.length === 0 ? (
                  <div style={{ padding: '16px 14px', fontSize: '12px', color: C.textMuted, textAlign: 'center' }}>Aucune notification</div>
                ) : notifs.slice(0, 5).map(n => (
                  <div key={n.id} onClick={() => handleClickNotif(n)}
                    style={{ display: 'flex', gap: '10px', padding: '9px 14px', borderBottom: `1px solid ${C.borderLight}`, backgroundColor: n.lu ? C.white : `${accent}06`, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = n.lu ? C.white : `${accent}06`)}
                  >
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: n.lu ? '#D1D5DB' : accent, marginTop: '4px', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: n.lu ? 400 : 600, color: C.text, lineHeight: 1.4 }}>{n.message}</p>
                      <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>{timeAgo(n.dateCreation)}</p>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '8px 14px' }}>
                  <button onClick={() => { setNotifOpen(false); navigate(notifRoute); }} style={{ fontSize: '11px', fontWeight: 600, color: accent, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' }}>Voir toutes les notifications</button>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="s2s-user-menu-button"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px 4px 6px', backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, cursor: 'pointer', transition: 'background 0.15s', minWidth: 0 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.white)}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: R, background: profile.avatarGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 800, flexShrink: 0, overflow: 'hidden' }}>
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name || 'Profil'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile.initials
              )}
            </div>
            <div className="s2s-user-menu-text" style={{ textAlign: 'left', minWidth: 0 }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.shortName}</p>
              <p style={{ fontSize: '10px', color: C.textMuted, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.roleLabel}</p>
            </div>
            <ChevronDown style={{ width: '12px', height: '12px', color: C.textMuted, transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s', flexShrink: 0 }} />
          </button>

          {profileOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setProfileOpen(false)} />
              <div className="s2s-topbar-menu" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '6px', width: '220px', backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, boxShadow: S.elevated, zIndex: 50, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.borderLight}`, background: `linear-gradient(135deg, ${accent}08, ${accent}04)` }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                    <Shield style={{ width: '11px', height: '11px', color: accent }} />
                    <span style={{ fontSize: '11px', color: accent, fontWeight: 600 }}>{profile.roleLabel}</span>
                  </div>
                  <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.email}</p>
                </div>
                <div style={{ padding: '4px 0' }}>
                  {[
                    { icon: User, label: 'Profil', href: profileRoute },
                    { icon: Bell, label: 'Notifications', href: notifRoute },
                  ].map(({ icon: Icon, label, href }) => (
                    <button key={label} onClick={() => { setProfileOpen(false); navigate(href); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', fontSize: '12px', color: C.text, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Icon style={{ width: '13px', height: '13px', color: C.textMuted }} />{label}
                    </button>
                  ))}
                </div>
                <div style={{ padding: '4px 0', borderTop: `1px solid ${C.borderLight}` }}>
                  <button onClick={() => { setProfileOpen(false); logout(); navigate('/login'); toast.success('Déconnexion réussie.'); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', fontSize: '12px', color: C.red, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut style={{ width: '13px', height: '13px' }} />Se déconnecter
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
