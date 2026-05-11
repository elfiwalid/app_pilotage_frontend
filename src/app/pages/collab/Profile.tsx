import { useState } from 'react';
import { Mail, Phone, MapPin, Code2, Edit3, Save, Camera, Activity, CheckCircle, Calendar, Star, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { C, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, cardStyle } from '../../components/ui/design-system';
import { useRole, PROFILES, ROLE_DASHBOARDS, type Role } from '../../context/RoleContext';

const projects = [
  { name: 'Projet Alpha', client: 'BCP Bank', role: 'Architecte Solution', alloc: 55, completion: 65, status: 'en-cours', color: C.purple },
  { name: 'Projet Beta', client: 'Attijariwafa Bank', role: 'Tech Lead', alloc: 40, completion: 82, status: 'en-cours', color: C.blue },
];

const skills = ['Architecture Solution', 'Microservices', 'Cloud Azure', 'Java Spring Boot', 'React/TypeScript', 'DevOps CI/CD', 'SQL / NoSQL', 'API REST'];

const activities = [
  { date: '10/04/2026', action: 'Revue architecture — Projet Alpha', icon: Activity, color: C.purple },
  { date: '09/04/2026', action: 'Sprint review validé — Projet Beta', icon: CheckCircle, color: C.green },
  { date: '08/04/2026', action: 'Documentation API v3 créée', icon: Activity, color: C.blue },
  { date: '07/04/2026', action: 'Planning mis à jour par le RM', icon: Calendar, color: '#F59E0B' },
];

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  'en-cours': { bg: '#EFF6FF', text: '#1D4ED8', dot: C.blue },
};

const ROLE_LABELS: Record<Role, string> = { rm: 'Resource Manager', pm: 'Chef de Projet', collab: 'Collaborateur' };
const ROLE_COLORS: Record<Role, string> = { rm: '#E600A9', pm: C.blue, collab: '#059669' };
const ROLE_DESCS: Record<Role, string> = {
  rm: 'Pilotage ressources, conflits, simulation et paramétrage global',
  pm: 'Gestion projets, anomalies détectées et rapports V2',
  collab: 'Vue personnelle — projets assignés et planning individuel',
};

export function CollabProfile() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('Youssef El Amrani');
  const [email, setEmail] = useState('youssef.elamrani@soprabanking.com');
  const [phone, setPhone] = useState('+212 6 62 34 56 78');
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
      <PageHeader title="Mon Profil" subtitle="Informations personnelles et activité" />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', alignItems: 'start' }}>

        {/* Left: Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Main profile card */}
          <div style={{ ...cardStyle, borderTop: `3px solid ${C.green}`, padding: '20px', textAlign: 'center' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #065F46 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 800, margin: '0 auto' }}>YA</div>
              <button onClick={() => toast.info('Upload photo')} style={{ position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: C.green, border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera style={{ width: '11px', height: '11px', color: '#fff' }} />
              </button>
            </div>

            <p style={{ fontSize: '16px', fontWeight: 800, color: C.text, marginBottom: '2px' }}>{name}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: R, backgroundColor: `${C.green}14`, border: `1px solid ${C.green}30`, marginBottom: '16px' }}>
              <Code2 style={{ width: '11px', height: '11px', color: C.green }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: C.green }}>Architecte Solution</span>
            </div>

            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', textAlign: 'left' }}>
              {[{ icon: Mail, v: email, l: 'Email' }, { icon: Phone, v: phone, l: 'Téléphone' }, { icon: MapPin, v: location, l: 'Localisation' }].map(({ icon: Icon, v, l }) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.borderLight}` }}>
                  <Icon style={{ width: '13px', height: '13px', color: C.green, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '9px', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${C.borderLight}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[{ l: 'Projets actifs', v: '2' }, { l: 'Charge totale', v: '95%' }, { l: 'Tâches terminées', v: '5/7' }, { l: 'Ancienneté', v: '3 ans' }].map(s => (
                <div key={s.l} style={{ padding: '8px', backgroundColor: C.bg, borderRadius: R }}>
                  <p style={{ fontSize: '9px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</p>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: C.green }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <SectionCard title="Compétences" accent={C.green}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {skills.map((s, i) => (
                <span key={i} style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: R, backgroundColor: i % 3 === 0 ? `${C.green}10` : i % 3 === 1 ? `${C.purple}10` : `${C.blue}10`, color: i % 3 === 0 ? C.green : i % 3 === 1 ? C.purple : C.blue, border: `1px solid ${i % 3 === 0 ? C.green : i % 3 === 1 ? C.purple : C.blue}25` }}>
                  {s}
                </span>
              ))}
            </div>
          </SectionCard>

          {/* Activity */}
          <SectionCard title="Activité Récente" accent={C.green}>
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
          {/* Edit form */}
          <SectionCard title="Paramètres du Compte" subtitle="Modifiez vos informations de contact" accent={C.green}
            actions={editing ? null : <BtnGhost onClick={() => setEditing(true)}><Edit3 style={{ width: '11px', height: '11px' }} />Modifier</BtnGhost>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[{ l: 'Nom complet', v: name, sv: setName }, { l: 'Email', v: email, sv: setEmail }, { l: 'Téléphone', v: phone, sv: setPhone }, { l: 'Localisation', v: location, sv: setLocation }].map(({ l, v, sv }) => (
                <div key={l}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{l}</p>
                  {editing ? (
                    <input type="text" value={v} onChange={e => sv(e.target.value)} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = C.green)} onBlur={e => (e.target.style.borderColor = C.border)} />
                  ) : (
                    <p style={{ fontSize: '13px', fontWeight: 600, color: C.text, padding: '7px 10px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.borderLight}` }}>{v}</p>
                  )}
                </div>
              ))}
              {[{ l: 'Rôle', v: 'Architecte Solution' }, { l: 'Matricule', v: 'SBS-COL-2021-112' }].map(({ l, v }) => (
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

          {/* My projects */}
          <SectionCard title="Mes Projets Assignés" subtitle="2 projets actifs" accent={C.green}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projects.map(p => {
                const sc = STATUS_CFG[p.status] || STATUS_CFG['en-cours'];
                return (
                  <div key={p.name} style={{ padding: '12px 14px', borderRadius: R, border: `1px solid ${C.border}`, borderLeft: `3px solid ${p.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{p.name}</p>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: sc.dot }} />En cours
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: C.textMuted }}>{p.client} · <strong style={{ color: p.color }}>{p.role}</strong></p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '18px', fontWeight: 800, color: p.color }}>{p.alloc}%</p>
                        <p style={{ fontSize: '9px', color: C.textMuted }}>allocation</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '5px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '2px', backgroundColor: p.color, width: `${p.completion}%` }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: p.color }}>{p.completion}%</span>
                    </div>
                    <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '5px' }}>Avancement global du projet</p>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Performance */}
          <SectionCard title="Évaluation de Performance" subtitle="Dernière évaluation : Mars 2026" accent={C.green}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { l: 'Qualité du travail', v: 4.5, max: 5 },
                { l: 'Respect des délais', v: 4, max: 5 },
                { l: 'Travail en équipe', v: 5, max: 5 },
                { l: 'Communication', v: 4, max: 5 },
              ].map(({ l, v, max }) => (
                <div key={l} style={{ padding: '10px 12px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.borderLight}` }}>
                  <p style={{ fontSize: '10px', color: C.textMuted, marginBottom: '5px' }}>{l}</p>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
                    {Array.from({ length: max }, (_, i) => (
                      <Star key={i} style={{ width: '13px', height: '13px', color: i < v ? '#F59E0B' : C.borderLight, fill: i < Math.floor(v) ? '#F59E0B' : i < v ? '#F59E0B' : 'none' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: C.text }}>{v}/{max}</p>
                </div>
              ))}
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