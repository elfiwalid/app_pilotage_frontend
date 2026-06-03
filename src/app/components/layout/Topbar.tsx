import { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, Settings, LogOut, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { C, S, R } from '../ui/design-system';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';
import {
  fetchMesNotifications, marquerToutesCommeLues, marquerCommeLue,
  type NotificationResponseDTO,
} from '../../services/notificationService';

const NOTIF_ROUTE: Record<string, string> = {
  rm: '/rm/notifications',
  pm: '/pm/notifications',
  collab: '/collab/notifications',
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
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch { return iso; }
}

export function Topbar() {
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

  // Charger au montage + rafraîchir toutes les 30s
  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 30000);
    return () => clearInterval(interval);
  }, [role]);

  const unreadCount = notifs.filter(n => !n.lu).length;
  const accent = profile.accent;

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
      try { await marquerCommeLue(n.id); setNotifs(p => p.map(x => x.id === n.id ? { ...x, lu: true } : x)); }
      catch { /* ignore */ }
    }
    navigate(NOTIF_ROUTE[role] ?? '/');
  };

  return (
    <header style={{ height: '52px', backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, zIndex: 20, position: 'relative' }}>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: '340px' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: C.textMuted, pointerEvents: 'none' }} />
          <input type="text" placeholder="Rechercher…"
            style={{ width: '100%', paddingLeft: '30px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px', color: C.text, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: R, outline: 'none', fontFamily: 'Inter, sans-serif' }}
            onFocus={e => (e.target.style.borderColor = accent)} onBlur={e => (e.target.style.borderColor = C.border)} />
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Status and role indicators removed per Staff2Staff redesign */}
        <div style={{ width: '1px', height: '20px', backgroundColor: C.border }} />

        {/* Notifications */}
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
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '6px', width: '310px', backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, boxShadow: S.elevated, zIndex: 50, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>Notifications <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', backgroundColor: accent, padding: '1px 5px', borderRadius: '10px', marginLeft: '4px' }}>{unreadCount}</span></span>
                  <button style={{ fontSize: '11px', fontWeight: 600, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}>Tout lire</button>
                </div>
                {notifs.map(n => (
                  <div key={n.id} style={{ display: 'flex', gap: '10px', padding: '9px 14px', borderBottom: `1px solid ${C.borderLight}`, backgroundColor: n.read ? C.white : `${accent}06`, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = n.read ? C.white : `${accent}06`)}
                  >
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: n.read ? '#D1D5DB' : accent, marginTop: '4px', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: n.read ? 400 : 600, color: C.text, lineHeight: 1.4 }}>{n.text}</p>
                      <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '8px 14px' }}>
                  <button style={{ fontSize: '11px', fontWeight: 600, color: accent, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' }}>Voir toutes les notifications</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px 4px 6px', backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.white)}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: R, background: profile.avatarGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}>
              {profile.initials}
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, lineHeight: 1.2 }}>{profile.shortName}</p>
              <p style={{ fontSize: '10px', color: C.textMuted, lineHeight: 1.2 }}>{profile.roleLabel}</p>
            </div>
            <ChevronDown style={{ width: '12px', height: '12px', color: C.textMuted, transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s' }} />
          </button>

          {profileOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setProfileOpen(false)} />
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '6px', width: '220px', backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, boxShadow: S.elevated, zIndex: 50, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.borderLight}`, background: `linear-gradient(135deg, ${accent}08, ${accent}04)` }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{profile.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                    <Shield style={{ width: '11px', height: '11px', color: accent }} />
                    <span style={{ fontSize: '11px', color: accent, fontWeight: 600 }}>{profile.roleLabel}</span>
                  </div>
                  <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>{profile.email}</p>
                </div>
                <div style={{ padding: '4px 0' }}>
                  {[{ icon: User, label: 'Mon profil' }, { icon: Settings, label: 'Paramètres' }].map(({ icon: Icon, label }) => (
                    <button key={label} onClick={() => { setProfileOpen(false); toast.info(label); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', fontSize: '12px', color: C.text, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Icon style={{ width: '13px', height: '13px', color: C.textMuted }} />{label}
                    </button>
                  ))}
                </div>
                <div style={{ padding: '4px 0', borderTop: `1px solid ${C.borderLight}` }}>
                  <button onClick={() => { setProfileOpen(false); logout(); navigate('/login'); toast.success('Déconnexion réussie.'); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', fontSize: '12px', color: C.red, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FEF2F2')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
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