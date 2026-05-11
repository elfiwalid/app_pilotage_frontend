import { NavLink, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Users, FolderKanban, AlertTriangle,
  Lightbulb, Settings, BookOpen, Briefcase, BarChart2,
  Calendar, Bell, UserCircle,
} from 'lucide-react';
import { C, R } from '../ui/design-system';
import { useRole, ROLE_DASHBOARDS, type Role } from '../../context/RoleContext';
import logo from '../../../imports/Logo_moderne_de_Staff2Staff_en_hexagone.png';

/* ─── Navigation per role ─────────────────────── */
const NAV: Record<Role, { label: string; items: { name: string; href: string; icon: any; badge?: number }[] }[]> = {
  rm: [
    { label: 'Principal', items: [{ name: 'Dashboard', href: '/', icon: LayoutDashboard }] },
    {
      label: 'Gestion', items: [
        { name: 'Ressources', href: '/resources', icon: Users },
        { name: 'Projets', href: '/projects', icon: FolderKanban },
        { name: 'Conflits', href: '/conflicts', icon: AlertTriangle, badge: 5 },
      ],
    },
    { label: 'Analytique', items: [{ name: 'Simulation', href: '/simulation', icon: Lightbulb }] },
    {
      label: 'Compte', items: [
        { name: 'Notifications', href: '/rm/notifications', icon: Bell, badge: 3 },
        { name: 'Mon Profil', href: '/rm/profile', icon: UserCircle },
      ],
    },
    { label: 'Système', items: [{ name: 'Paramétrage', href: '/settings', icon: Settings }] },
  ],
  pm: [
    { label: 'Principal', items: [{ name: 'Dashboard', href: '/pm', icon: LayoutDashboard }] },
    {
      label: 'Gestion', items: [
        { name: 'Mes Projets', href: '/pm/projects', icon: Briefcase },
        { name: 'Anomalies', href: '/pm/anomalies', icon: AlertTriangle, badge: 2 },
      ],
    },
    { label: 'Rapports', items: [{ name: 'Rapports', href: '/pm/reports', icon: BarChart2 }] },
    {
      label: 'Compte', items: [
        { name: 'Notifications', href: '/pm/notifications', icon: Bell, badge: 1 },
        { name: 'Mon Profil', href: '/pm/profile', icon: UserCircle },
      ],
    },
  ],
  collab: [
    { label: 'Principal', items: [{ name: 'Dashboard', href: '/collab', icon: LayoutDashboard }] },
    {
      label: 'Mon Travail', items: [
        { name: 'Mes Projets', href: '/collab/projects', icon: FolderKanban },
        { name: 'Mon Planning', href: '/collab/schedule', icon: Calendar },
      ],
    },
    {
      label: 'Compte', items: [
        { name: 'Notifications', href: '/collab/notifications', icon: Bell, badge: 3 },
        { name: 'Mon Profil', href: '/collab/profile', icon: UserCircle },
      ],
    },
  ],
};

const ROLE_ACCENT: Record<Role, string> = { rm: '#E600A9', pm: '#2D9CDB', collab: '#059669' };

export function Sidebar() {
  const { role } = useRole();
  const location = useLocation();
  const accent = ROLE_ACCENT[role];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    if (href === '/pm') return location.pathname === '/pm';
    if (href === '/collab') return location.pathname === '/collab';
    return location.pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: '224px', backgroundColor: C.sidebar,
      display: 'flex', flexDirection: 'column',
      flexShrink: 0, height: '100vh',
    }}>
      {/* Gradient accent bar */}
      <div style={{ height: '2px', background: `linear-gradient(90deg, ${accent} 0%, #7B2CBF 50%, #2D9CDB 100%)` }} />

      {/* Logo */}
      <div style={{ height: '56px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ width: '30px', height: '30px', borderRadius: R, overflow: 'hidden', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo} alt="Staff2Staff" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: '14px', lineHeight: 1, letterSpacing: '-0.02em' }}>Staff2Staff</p>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '9px', marginTop: '3px', lineHeight: 1 }}>Sopra Banking Software</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '6px 8px', overflowY: 'auto' }}>
        {NAV[role].map((group) => (
          <div key={group.label} style={{ marginBottom: '2px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', padding: '8px 10px 4px' }}>
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/' || item.href === '/pm' || item.href === '/collab'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '9px',
                    padding: '7px 10px', borderRadius: R, marginBottom: '1px',
                    textDecoration: 'none',
                    borderLeft: active ? `2px solid ${accent}` : '2px solid transparent',
                    backgroundColor: active ? `${accent}14` : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.48)',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.48)'; } }}
                >
                  <item.icon style={{ width: '14px', height: '14px', color: active ? accent : 'inherit', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: active ? 600 : 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                  {item.badge && (
                    <span style={{ backgroundColor: accent, color: '#fff', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '10px', lineHeight: '15px', minWidth: '16px', textAlign: 'center' }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom help */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '0 10px' }} />
      <div style={{ padding: '10px 8px 14px' }}>
        <div style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}25`, borderRadius: R, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
            <BookOpen style={{ width: '12px', height: '12px', color: accent }} />
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Documentation</p>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px', lineHeight: 1.4 }}>Guide Staff2Staff v2.0</p>
          <button
            style={{ width: '100%', backgroundColor: '#7B2CBF', color: '#fff', border: 'none', borderRadius: R, padding: '5px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6A1FA8')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#7B2CBF')}
          >Accéder au guide</button>
        </div>
      </div>
    </aside>
  );
}
