import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Code2, Edit3, Save, Camera, Activity, CheckCircle, Calendar, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { C, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, cardStyle } from '../../components/ui/design-system';
import { fetchMyProfile, updateMyProfile, type UserResponseDTO } from '../../services/userService';
import { fetchMesEvaluations, type EvaluationResponse } from '../../services/evaluationService';
import { fetchCollabTaches, type TacheCollaborateurDTO } from '../../services/collaborateurService';

const MOIS_LABELS: Record<number, string> = {
  1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril', 5: 'Mai', 6: 'Juin',
  7: 'Juillet', 8: 'Août', 9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre',
};

export function CollabProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserResponseDTO | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationResponse[]>([]);
  const [taches, setTaches] = useState<TacheCollaborateurDTO[]>([]);
  const [editing, setEditing] = useState(false);

  // Editable form state
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [poste, setPoste] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, evalData, tachesData] = await Promise.all([
        fetchMyProfile(),
        fetchMesEvaluations(),
        fetchCollabTaches(),
      ]);
      setProfile(profileData);
      setNom(profileData.nom);
      setPrenom(profileData.prenom);
      setEmail(profileData.email);
      setPoste(profileData.poste || '');
      setEvaluations(evalData);
      setTaches(tachesData);
    } catch (err: any) {
      toast.error(err.message || 'Erreur de chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await updateMyProfile({ nom, prenom, email, poste });
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

  const inputStyle = {
    width: '100%', padding: '7px 10px', fontSize: '12px',
    border: `1px solid ${C.border}`, borderRadius: R,
    backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter',
    color: C.text, boxSizing: 'border-box' as const,
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 style={{ width: '32px', height: '32px', color: C.green, animation: 'spin 1s linear infinite' }} />
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

  // Compute latest evaluation summary if any
  const latestEval = evaluations.length > 0 ? evaluations[0] : null;

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <PageHeader title="Mon Profil" subtitle="Informations personnelles et évaluations" />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', alignItems: 'start' }}>

        {/* Left: Profile card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Main profile card */}
          <div style={{ ...cardStyle, borderTop: `3px solid ${C.green}`, padding: '20px', textAlign: 'center' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #065F46 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 800, margin: '0 auto' }}>{initials}</div>
              <button onClick={() => toast.info('Upload photo')} style={{ position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: C.green, border: '2px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera style={{ width: '11px', height: '11px', color: '#fff' }} />
              </button>
            </div>

            <p style={{ fontSize: '16px', fontWeight: 800, color: C.text, marginBottom: '2px' }}>{fullName}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: R, backgroundColor: `${C.green}14`, border: `1px solid ${C.green}30`, marginBottom: '16px' }}>
              <Code2 style={{ width: '11px', height: '11px', color: C.green }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: C.green }}>{profile.poste || 'Collaborateur'}</span>
            </div>

            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', textAlign: 'left' }}>
              {[
                { icon: Mail, v: email, l: 'Email' },
                { icon: Phone, v: profile.matricule || '—', l: 'Matricule' },
                { icon: MapPin, v: profile.role === 'COLLABORATEUR' ? 'Collaborateur' : profile.role, l: 'Rôle' },
              ].map(({ icon: Icon, v, l }) => (
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
              {[
                { l: 'Taux Staffing', v: `${profile.tauxStaffing ?? 0}%` },
                { l: 'Disponible', v: profile.disponible ? 'Oui' : 'Non' },
                { l: 'Évaluations', v: String(evaluations.length) },
                { l: 'Moyenne', v: latestEval ? `${latestEval.moyenneGenerale}/5` : '—' },
              ].map(s => (
                <div key={s.l} style={{ padding: '8px', backgroundColor: C.bg, borderRadius: R }}>
                  <p style={{ fontSize: '9px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</p>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: C.green }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Évaluations de performance reçues */}
          <SectionCard title="Mes Évaluations" subtitle={evaluations.length > 0 ? `${evaluations.length} évaluation(s) reçue(s)` : 'Aucune évaluation reçue'} accent={C.green}>
            {evaluations.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: C.textMuted }}>Aucune évaluation de performance reçue pour le moment.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {evaluations.slice(0, 6).map(ev => (
                  <div key={ev.id} style={{ padding: '12px', borderRadius: R, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.green}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{MOIS_LABELS[ev.mois]} {ev.annee}</p>
                        <p style={{ fontSize: '10px', color: C.textMuted }}>Par {ev.evaluateurPrenom} {ev.evaluateurNom}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '18px', fontWeight: 800, color: C.green }}>{ev.moyenneGenerale}</p>
                        <p style={{ fontSize: '9px', color: C.textMuted }}>/5 moyenne</p>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {[
                        { l: 'Qualité du travail', v: ev.qualiteTravail },
                        { l: 'Respect des délais', v: ev.respectDelais },
                        { l: 'Travail en équipe', v: ev.travailEquipe },
                        { l: 'Communication', v: ev.communication },
                      ].map(({ l, v }) => (
                        <div key={l} style={{ padding: '6px 8px', backgroundColor: C.bg, borderRadius: R }}>
                          <p style={{ fontSize: '9px', color: C.textMuted, marginBottom: '3px' }}>{l}</p>
                          <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} style={{ width: '11px', height: '11px', color: i < v ? '#F59E0B' : C.borderLight, fill: i < Math.floor(v) ? '#F59E0B' : 'none' }} />
                            ))}
                          </div>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: C.text }}>{v}/5</p>
                        </div>
                      ))}
                    </div>
                    {ev.commentaire && (
                      <div style={{ marginTop: '8px', padding: '8px', backgroundColor: `${C.green}08`, borderRadius: R, border: `1px solid ${C.green}20` }}>
                        <p style={{ fontSize: '10px', color: C.textMuted, fontWeight: 700, marginBottom: '2px' }}>COMMENTAIRE</p>
                        <p style={{ fontSize: '11px', color: C.text, lineHeight: 1.5 }}>{ev.commentaire}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right: Edit form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Edit form */}
          <SectionCard title="Paramètres du Compte" subtitle="Modifiez vos informations de contact" accent={C.green}
            actions={editing ? null : <BtnGhost onClick={() => setEditing(true)}><Edit3 style={{ width: '11px', height: '11px' }} />Modifier</BtnGhost>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { l: 'Nom', v: nom, sv: setNom },
                { l: 'Prénom', v: prenom, sv: setPrenom },
                { l: 'Email', v: email, sv: setEmail },
                { l: 'Poste', v: poste, sv: setPoste },
              ].map(({ l, v, sv }) => (
                <div key={l}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{l}</p>
                  {editing ? (
                    <input type="text" value={v} onChange={e => sv(e.target.value)} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = C.green)} onBlur={e => (e.target.style.borderColor = C.border)} />
                  ) : (
                    <p style={{ fontSize: '13px', fontWeight: 600, color: C.text, padding: '7px 10px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.borderLight}` }}>{v || '—'}</p>
                  )}
                </div>
              ))}
              {[
                { l: 'Rôle', v: profile.role === 'COLLABORATEUR' ? 'Collaborateur' : profile.role },
                { l: 'Matricule', v: profile.matricule || '—' },
              ].map(({ l, v }) => (
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

          <SectionCard title="Mes Tâches Planifiées" subtitle={`${taches.length} jour(s) planifié(s)`} accent={C.blue}>
            {taches.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: C.textMuted }}>Aucune tâche planifiée pour le moment.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {taches.slice(0, 8).map(t => (
                  <div key={t.id} style={{ padding: '10px 12px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: C.bg }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{t.tache}</p>
                      <span style={{ fontSize: '10px', color: C.textMuted, flexShrink: 0 }}>{formatDateFr(t.dateTache)}</span>
                    </div>
                    <p style={{ fontSize: '10px', color: C.textMuted }}>{t.projetNom}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
