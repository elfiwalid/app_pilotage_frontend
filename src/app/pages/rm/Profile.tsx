import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Shield, Edit3, Save, Camera, Activity, CheckCircle, Calendar, RefreshCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { C, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, cardStyle } from '../../components/ui/design-system';
import { useRole, PROFILES, ROLE_DASHBOARDS, type Role } from '../../context/RoleContext';
import { fetchMyProfile, updateMyProfile, type UserResponseDTO } from '../../services/userService';

const activities = [
  { date: '10/04/2026', action: 'Conflit résolu — Youssef El Amrani surcharge 180%', icon: CheckCircle, color: C.green },
  { date: '09/04/2026', action: 'Simulation what-if lancée — Projet Alpha', icon: Activity, color: C.purple },
  { date: '08/04/2026', action: 'Rapport de staffing Mars 2026 généré', icon: Activity, color: C.blue },
  { date: '07/04/2026', action: 'Calendrier paramétré — Congés Avril', icon: Calendar, color: '#F59E0B' },
];

const ROLE_LABELS: Record<Role, string> = { rm: 'Resource Manager', pm: 'Chef de Projet', collab: 'Collaborateur' };
const ROLE_COLORS: Record<Role, string> = { rm: C.magenta, pm: C.blue, collab: '#059669' };
const ROLE_DESCS: Record<Role, string> = {
  rm: 'Pilotage ressources, conflits, simulation et paramétrage global',
  pm: 'Gestion projets, anomalies détectées et rapports V2',
  collab: 'Vue personnelle — projets assignés et planning individuel',
};

export function RmProfile() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserResponseDTO | null>(null);
  const [editing, setEditing] = useState(false);

  // Editable form state
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [poste, setPoste] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profileData = await fetchMyProfile();
      setProfile(profileData);
      setNom(profileData.nom);
      setPrenom(profileData.prenom);
      setEmail(profileData.email);
      setPoste(profileData.poste || '');
    } catch (err: any) {
      toast.error(err.message || 'Erreur de chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await updateMyProfile({ nom, prenom, email, poste, photoUrl: profile?.photoUrl ?? null });
      setProfile(updated);
      setEditing(false);
      toast.success('Profil mis à jour avec succès !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setNom(profile.nom);
      setPrenom(profile.prenom);
      setEmail(profile.email);
      setPoste(profile.poste || '');
    }
    setEditing(false);
  };

  const handleSwitch = (r: Role) => {
    setRole(r);
    navigate(ROLE_DASHBOARDS[r]);
    toast.success(`Profil changé → ${ROLE_LABELS[r]}`);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const photoUrl = String(reader.result);
        const updated = await updateMyProfile({ nom, prenom, email, poste, photoUrl });
        setProfile(updated);
        toast.success('Photo de profil mise à jour.');
      } catch (err: any) {
        toast.error(err.message || 'Impossible de mettre à jour la photo.');
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', fontSize: '12px',
    border: `1px solid ${C.border}`, borderRadius: R,
    backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter',
    color: C.text, boxSizing: 'border-box',
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 style={{ width: '32px', height: '32px', color: C.magenta, animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: C.textMuted }}>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%' }}>
        <PageHeader title="Mon Profil" subtitle="Erreur de chargement" />
        <p style={{ color: '#DC2626', fontSize: '13px' }}>Impossible de charger le profil.</p>
      </div>
    );
  }

  const fullName = `${prenom} ${nom}`;
  const initials = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <PageHeader title="Mon Profil — Resource Manager" subtitle="Informations personnelles, statistiques et changement de profil" />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'start' }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Avatar card */}
          <div style={{ ...cardStyle, borderTop: `3px solid ${C.magenta}`, padding: '20px', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #7B2CBF 0%, #E600A9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 800, margin: '0 auto', overflow: 'hidden' }}>
                {profile.photoUrl ? <img src={profile.photoUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              <button onClick={() => photoInputRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: C.magenta, border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera style={{ width: '11px', height: '11px', color: '#fff' }} />
              </button>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 800, color: C.text, marginBottom: '3px' }}>{fullName}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: R, backgroundColor: `${C.magenta}14`, border: `1px solid ${C.magenta}30`, marginBottom: '16px' }}>
              <Shield style={{ width: '11px', height: '11px', color: C.magenta }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: C.magenta }}>Resource Manager</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              {[
                { icon: Mail, v: email, l: 'Email' },
                { icon: Phone, v: profile.matricule || '—', l: 'Matricule' },
                { icon: MapPin, v: 'Casablanca, Maroc', l: 'Localisation' }
              ].map(({ icon: Icon, v, l }) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.borderLight}` }}>
                  <Icon style={{ width: '13px', height: '13px', color: C.magenta, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '9px', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${C.borderLight}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[{ l: 'Taux Staffing', v: `${profile.tauxStaffing ?? 0}%` }, { l: 'Disponible', v: profile.disponible ? 'Oui' : 'Non' }, { l: 'Conflits', v: '5' }, { l: 'Simulations', v: '12' }].map(s => (
                <div key={s.l} style={{ padding: '8px', backgroundColor: C.bg, borderRadius: R, textAlign: 'left' }}>
                  <p style={{ fontSize: '9px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{s.l}</p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: C.magenta }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <SectionCard title="Activité Récente" accent={C.magenta}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
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
            <button style={{ width: '100%', padding: '8px', marginTop: '10px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.textSecondary, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}>
              Voir tout l'historique
            </button>
          </SectionCard>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Edit form */}
          <SectionCard
            title="Paramètres du Compte"
            subtitle="Informations personnelles et coordonnées"
            accent={C.magenta}
            actions={!editing ? <BtnGhost onClick={() => setEditing(true)}><Edit3 style={{ width: '11px', height: '11px' }} />Modifier</BtnGhost> : null}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { l: 'Nom', v: nom, sv: setNom }, 
                { l: 'Prénom', v: prenom, sv: setPrenom }, 
                { l: 'Email', v: email, sv: setEmail }, 
                { l: 'Poste', v: poste, sv: setPoste }
              ].map(({ l, v, sv }) => (
                <div key={l}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{l}</p>
                  {editing
                    ? <input type="text" value={v} onChange={e => sv(e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = C.magenta)} onBlur={e => (e.target.style.borderColor = C.border)} />
                    : <p style={{ fontSize: '13px', fontWeight: 600, color: C.text, padding: '7px 10px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.borderLight}` }}>{v || '—'}</p>}
                </div>
              ))}
              {[{ l: 'Rôle Système', v: profile.role }, { l: 'Matricule', v: profile.matricule || '—' }].map(({ l, v }) => (
                <div key={l}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{l}</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: C.text, padding: '7px 10px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.borderLight}` }}>{v}</p>
                </div>
              ))}
            </div>
            {editing && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${C.borderLight}` }}>
                <BtnPrimary onClick={handleSave}><Save style={{ width: '12px', height: '12px' }} />Enregistrer</BtnPrimary>
                <BtnGhost onClick={handleCancel}>Annuler</BtnGhost>
              </div>
            )}
          </SectionCard>

          {/* Role Switcher */}
          <SectionCard title="Changer de Profil" subtitle="Basculer vers un autre espace Staff2Staff" accent={C.purple}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(Object.keys(PROFILES) as Role[]).map((r) => {
                const prof = PROFILES[r];
                const isActive = r === role;
                const color = ROLE_COLORS[r];
                return (
                  <div
                    key={r}
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
                        <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{prof.name || fullName}</p>
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
