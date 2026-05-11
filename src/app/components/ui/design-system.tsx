import { type ReactNode } from 'react';

/* ─── COLOR TOKENS ─────────────────────────────── */
export const C = {
  magenta: '#E600A9',
  magentaDark: '#C80095',
  purple: '#7B2CBF',
  purpleDark: '#6A1FA8',
  blue: '#2D9CDB',
  blueDark: '#2589C7',
  yellow: '#F2C94C',
  cyan: '#56CCF2',
  green: '#059669',
  orange: '#D97706',
  red: '#DC2626',
  sidebar: '#0B0718',
  bg: '#F0F2F6',
  white: '#ffffff',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
};

/* ─── SHADOW TOKENS ────────────────────────────── */
export const S = {
  card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  elevated: '0 4px 12px rgba(0,0,0,0.08)',
  modal: '0 20px 60px rgba(0,0,0,0.18)',
};

/* ─── RADIUS ───────────────────────────────────── */
export const R = '4px';

/* ─── SHARED CARD STYLE ─────────────────────────── */
export const cardStyle = {
  backgroundColor: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: R,
  boxShadow: S.card,
};

/* ─── PAGE HEADER ───────────────────────────────── */
export function PageHeader({
  title, subtitle, badge, children,
}: { title: string; subtitle?: string; badge?: ReactNode; children?: ReactNode }) {
  return (
    <div style={{ ...cardStyle, borderLeft: `4px solid ${C.magenta}` }}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div>
            {badge && <div className="mb-1">{badge}</div>}
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>
              {title}
            </h1>
            {subtitle && <p style={{ fontSize: '12px', color: C.textMuted, marginTop: '2px' }}>{subtitle}</p>}
          </div>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}

/* ─── SECTION CARD ──────────────────────────────── */
export function SectionCard({
  title, subtitle, accent = C.purple, actions, children, noPad = false,
}: { title: string; subtitle?: string; accent?: string; actions?: ReactNode; children: ReactNode; noPad?: boolean }) {
  return (
    <div style={cardStyle}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${C.borderLight}` }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '3px', height: '18px', backgroundColor: accent, borderRadius: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{title}</p>
            {subtitle && <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '1px' }}>{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className={noPad ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

/* ─── KPI CARD ──────────────────────────────────── */
export function KpiCard({
  label, value, sub, trend, trendPositive, icon: Icon, accent,
}: { label: string; value: string | number; sub?: string; trend?: string; trendPositive?: boolean; icon: any; accent: string }) {
  return (
    <div style={{ ...cardStyle, borderTop: `3px solid ${accent}` }}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <p style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
          <div style={{ width: '30px', height: '30px', borderRadius: R, backgroundColor: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon style={{ width: '14px', height: '14px', color: accent }} />
          </div>
        </div>
        <p style={{ fontSize: '1.75rem', fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: '6px' }}>{value}</p>
        <div className="flex items-center gap-1.5">
          {trend && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: trendPositive ? C.green : C.red, backgroundColor: trendPositive ? '#ECFDF5' : '#FEF2F2', padding: '1px 6px', borderRadius: '3px' }}>
              {trend}
            </span>
          )}
          {sub && <span style={{ fontSize: '10px', color: C.textMuted }}>{sub}</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── STATUS BADGE ──────────────────────────────── */
export function Badge({
  children, color = C.blue, bg, border,
}: { children: ReactNode; color?: string; bg?: string; border?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 7px', borderRadius: '3px',
      fontSize: '10px', fontWeight: 600, letterSpacing: '0.02em',
      color, backgroundColor: bg || `${color}14`,
      border: `1px solid ${border || `${color}30`}`,
    }}>
      {children}
    </span>
  );
}

/* ─── BTN PRIMARY ───────────────────────────────── */
export function BtnPrimary({ onClick, children, disabled, small }: { onClick?: () => void; children: ReactNode; disabled?: boolean; small?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        backgroundColor: disabled ? '#D1D5DB' : C.magenta,
        color: '#fff', border: 'none', borderRadius: R,
        padding: small ? '5px 12px' : '7px 16px',
        fontSize: small ? '11px' : '12px', fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        transition: 'background 0.15s',
        boxShadow: disabled ? 'none' : `0 1px 4px ${C.magenta}40`,
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.backgroundColor = C.magentaDark)}
      onMouseLeave={e => !disabled && (e.currentTarget.style.backgroundColor = C.magenta)}
    >
      {children}
    </button>
  );
}

/* ─── BTN SECONDARY ─────────────────────────────── */
export function BtnSecondary({ onClick, children, small }: { onClick?: () => void; children: ReactNode; small?: boolean }) {
  return (
    <button onClick={onClick}
      style={{
        backgroundColor: '#fff', color: C.purple,
        border: `1px solid ${C.purple}50`, borderRadius: R,
        padding: small ? '4px 12px' : '6px 16px',
        fontSize: small ? '11px' : '12px', fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${C.purple}08`; e.currentTarget.style.borderColor = C.purple; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = `${C.purple}50`; }}
    >
      {children}
    </button>
  );
}

/* ─── BTN GHOST ─────────────────────────────────── */
export function BtnGhost({ onClick, children, small }: { onClick?: () => void; children: ReactNode; small?: boolean }) {
  return (
    <button onClick={onClick}
      style={{
        backgroundColor: '#fff', color: C.textSecondary,
        border: `1px solid ${C.border}`, borderRadius: R,
        padding: small ? '4px 10px' : '6px 14px',
        fontSize: small ? '11px' : '12px', fontWeight: 500,
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.borderLight)}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
    >
      {children}
    </button>
  );
}

/* ─── TABLE HEADER CELL ─────────────────────────── */
export const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: '10px', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.07em',
  color: C.textMuted, textAlign: 'left',
  backgroundColor: '#F8F9FB',
  borderBottom: `1px solid ${C.border}`,
  whiteSpace: 'nowrap',
};

/* ─── TABLE ROW CELL ─────────────────────────────── */
export const tdStyle: React.CSSProperties = {
  padding: '11px 16px',
  fontSize: '12px',
  color: C.textSecondary,
  borderBottom: `1px solid ${C.borderLight}`,
  verticalAlign: 'middle',
};

/* ─── SECTION LABEL ─────────────────────────────── */
export function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.textMuted, marginBottom: '6px' }}>
      {children}
    </p>
  );
}

/* ─── INITIALS AVATAR ───────────────────────────── */
export function Avatar({ name, color = C.purple, size = 32 }: { name: string; color?: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: R,
      backgroundColor: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.34, fontWeight: 700,
      flexShrink: 0, letterSpacing: '0.02em',
    }}>
      {initials}
    </div>
  );
}

/* ─── MODAL WRAPPER ─────────────────────────────── */
export function Modal({ onClose, children, maxWidth = '520px', accentColor = C.magenta }: {
  onClose: () => void; children: ReactNode; maxWidth?: string; accentColor?: string;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', backgroundColor: '#fff',
        width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto',
        borderRadius: R, boxShadow: S.modal,
        borderTop: `3px solid ${accentColor}`,
      }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── MODAL HEADER ──────────────────────────────── */
export function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{title}</p>
        {subtitle && <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px' }}>{subtitle}</p>}
      </div>
      <button onClick={onClose}
        style={{ width: '28px', height: '28px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.borderLight)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 1L11 11M11 1L1 11" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* ─── EMPTY STATE ───────────────────────────────── */
export function EmptyState({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: R, backgroundColor: `${C.purple}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <Icon style={{ width: '22px', height: '22px', color: C.purple }} />
      </div>
      <p style={{ fontSize: '13px', fontWeight: 600, color: C.text, marginBottom: '4px' }}>{title}</p>
      {subtitle && <p style={{ fontSize: '12px', color: C.textMuted }}>{subtitle}</p>}
    </div>
  );
}
