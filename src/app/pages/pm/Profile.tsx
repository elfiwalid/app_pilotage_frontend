import { useState } from 'react';
import { Mail, Phone, MapPin, Briefcase, Edit3, Save, Camera, Activity, CheckCircle, Clock, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { C, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, cardStyle } from '../../components/ui/design-system';
import { useRole, PROFILES, ROLE_DASHBOARDS, type Role } from '../../context/RoleContext';

const projects = [
  { name: 'Projet Alpha', client: 'BCP Bank', role: 'Chef de Projet', completion: 65, status: 'en-cours' },
  { name: 'Projet Beta', client: 'Attijariwafa', role: 'Chef de Projet', completion: 82, status: 'en-cours' },
  { name: 'Projet Delta', client: 'BMCE Bank', role: 'Chef de Projet', completion: 58, status: 'en-cours' },
  { name: 'Projet Sigma', client: 'CDG Capital', role: 'Chef de Projet', completion: 5, status: 'planifie' },
];

const activities = [
  { date: '10/04/2026', action: 'Rapport de performance Q1 généré', icon: Activity, color: C.blue },
  { date: '09/04/2026', action: 'Anomalie corrigée — Projet Alpha', icon: CheckCircle, color: C.green },
  { date: '08/04/2026', action: 'Projet Sigma planifié — CDG Capital', icon: Clock, color: C.purple },
  { date: '07/04/2026', action: 'Rapport financier exporté en PDF', icon: Activity, color: C.blue },
];

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  'en-cours': { bg: '#EFF6FF', text: '#1D4ED8', dot: C.blue },
  planifie: { bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' },
};

const ROLE_LABELS: Record<Role, string> = { rm: 'Resource Manager', pm: 'Chef de Projet', collab: 'Collaborateur' };
const ROLE_COLORS: Record<Role, string> = { rm: '#E600A9', pm: C.blue, collab: '#059669' };
const ROLE_DESCS: Record<Role, string> = {
  rm: 'Pilotage ressources, conflits, simulation et paramétrage global',
  pm: 'Gestion projets, anomalies détectées et rapports V2',
  collab: 'Vue personnelle — projets assignés et planning individuel',
};

export function PmProfile() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('Khalid Bennani');
  const [email, setEmail] = useState('khalid.bennani@soprabanking.com');
  const [phone, setPhone] = useState('+212 6 61 23 45 67');
  const [location, setLocation] = useState('Casablanca, Maroc');

  const handleSave = () => { setEditing(false); toast.success('Profil mis à jour !'); };

  const handleSwitch = (r: Role) => {
    setRole(r);
    navigate(ROLE_DASHBOARDS[r]);
    toast.success(`Profil changé → ${ROLE_LABELS[r]}`);
  };

  const inputStyle = { width: '100%', padding: '7px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter', color: C.text, boxSizing: 'border-box' as const };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <PageHeader title="Mon Profil" subtitle="Informations personnelles et résumé d'activité" />

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '16px', alignItems: 'start' }}>

        {/* Left: Profile card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ ...cardStyle, borderTop: `3px solid ${C.blue}`, padding: '20px', textAlign: 'center' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #1E40AF 0%, #2D9CDB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 800, margin: '0 auto' }}>KB</div>
              <button onClick={() => toast.info('Upload photo')} style={{ position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: C.blue, border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera style={{ width: '11px', height: '11px', color: '#fff' }} />
              </button>
            </div>

            <p style={{ fontSize: '16px', fontWeight: 800, color: C.text, marginBottom: '2px' }}>{name}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: R, backgroundColor: `${C.blue}14`, border: `1px solid ${C.blue}30`, marginBottom: '16px' }}>
              <Briefcase style={{ width: '11px', height: '11px', color: C.blue }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: C.blue }}>Chef de Projet</span>
            </div>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              {[
                { icon: Mail, value: email, label: 'Email' },
                { icon: Phone, value: phone, label: 'Téléphone' },
                { icon: MapPin, value: location, label: 'Localisation' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.borderLight}` }}>
                  <Icon style={{ width: '13px', height: '13px', color: C.blue, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '9px', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${C.borderLight}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[{ l: 'Projets actifs', v: '3' }, { l: 'Projets totaux', v: '5' }, { l: 'Taux livraison', v: '87%' }, { l: 'Anomalies', v: '2' }].map(s => (
                <div key={s.l} style={{ padding: '8px', backgroundColor: C.bg, borderRadius: R }}>
                  <p style={{ fontSize: '9px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: C.blue }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <SectionCard title="Activité Récente" accent={C.blue}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activities.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: R, backgroundColor: `${a.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <a.icon style={{ width: '12px', height: '12px', color: a.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{a.action}</p>
                    <p style={{ fontSize: '10px', color: C.textMuted }}>{a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Right: Edit form + projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Edit Profile */}
          <SectionCard title="Paramètres du Compte" subtitle="Modifiez vos informations personnelles" accent={C.blue}
            actions={editing ? null : <BtnGhost onClick={() => setEditing(true)}><Edit3 style={{ width: '11px', height: '11px' }} />Modifier</BtnGhost>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { l: 'Nom complet', v: name, sv: setName },
                { l: 'Email professionnel', v: email, sv: setEmail },
                { l: 'Téléphone', v: phone, sv: setPhone },
                { l: 'Localisation', v: location, sv: setLocation },
              ].map(({ l, v, sv }) => (
                <div key={l}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{l}</p>
                  {editing ? (
                    <input type="text" value={v} onChange={e => sv(e.target.value)} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} />
                  ) : (
                    <p style={{ fontSize: '13px', fontWeight: 600, color: C.text, padding: '7px 10px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.borderLight}` }}>{v}</p>
                  )}
                </div>
              ))}
              {[{ l: 'Département', v: 'Digital Banking & Innovation' }, { l: 'Matricule', v: 'SBS-PM-2024-045' }].map(({ l, v }) => (
                <div key={l}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{l}</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: C.text, padding: '7px 10px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.borderLight}` }}>{v}</p>
                </div>
              ))}
            </div>
            {editing && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${C.borderLight}` }}>
                <BtnPrimary onClick={handleSave}><Save style={{ width: '12px', height: '12px' }} />Enregistrer</BtnPrimary>
                <BtnGhost onClick={() => setEditing(false)}>Annuler</BtnGhost>
              </div>
            )}
          </SectionCard>

          {/* Assigned Projects */}
          <SectionCard title="Projets Assignés" subtitle={`${projects.length} projets en gestion`} accent={C.blue}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projects.map(p => {
                const sc = STATUS_CFG[p.status] || STATUS_CFG['en-cours'];
                return (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: R, border: `1px solid ${C.border}`, transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.white)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{p.name}</p>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: sc.dot }} />
                          {p.status === 'en-cours' ? 'En cours' : 'Planifié'}
                        </span>
                      </div>
                      <p style={{ fontSize: '10px', color: C.textMuted }}>{p.client} · {p.role}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: C.blue }}>{p.completion}%</p>
                      <p style={{ fontSize: '9px', color: C.textMuted }}>avancement</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Role Switcher */}
          <SectionCard title="Changer de Profil" subtitle="Basculer vers un autre espace Staff2Staff" accent={C.purple}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(Object.keys(PROFILES) as Role[]).map((r) => {
                const prof = PROFILES[r];
                const isActive = r === role;
                const color = ROLE_COLORS[r];
                return (
                  <div key={r}
                    onClick={() => !isActive && handleSwitch(r)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: R, border: `1px solid ${isActive ? color : C.border}`, backgroundColor: isActive ? `${color}08` : '#fff', cursor: isActive ? 'default' : 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.borderColor = color; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.borderColor = C.border; }}
                  >
                    <div style={{ width: '38px', height: '38px', borderRadius: R, background: prof.avatarGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                      {prof.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{prof.name}</p>
                        {isActive && <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', backgroundColor: color, padding: '1px 7px', borderRadius: '10px' }}>ACTIF</span>}
                      </div>
                      <p style={{ fontSize: '11px', color: color, fontWeight: 600, marginBottom: '1px' }}>{ROLE_LABELS[r]}</p>
                      <p style={{ fontSize: '10px', color: C.textMuted }}>{ROLE_DESCS[r]}</p>
                    </div>
                    {!isActive && <RefreshCcw style={{ width: '14px', height: '14px', color: C.textMuted, flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}