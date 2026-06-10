import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Briefcase, Edit3, Save, Star, Loader2, Send, ChevronDown, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { C, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, cardStyle } from '../../components/ui/design-system';
import { fetchMyProfile, updateMyProfile, fetchUsers, type UserResponseDTO } from '../../services/userService';
import { submitEvaluation, fetchEvaluationsParChef, type EvaluationResponse } from '../../services/evaluationService';
import { ProfilePhoto } from '../../components/profile/ProfilePhoto';

const MOIS_LABELS: Record<number, string> = {
  1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril', 5: 'Mai', 6: 'Juin',
  7: 'Juillet', 8: 'Août', 9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre',
};

function StarRating({ value, onChange, size = 20 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          style={{
            width: `${size}px`, height: `${size}px`, cursor: 'pointer',
            color: i <= (hover || value) ? '#F59E0B' : C.borderLight,
            fill: i <= (hover || value) ? '#F59E0B' : 'none',
            transition: 'all 0.15s',
          }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        />
      ))}
    </div>
  );
}

export function PmProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserResponseDTO | null>(null);
  const [editing, setEditing] = useState(false);
  const [evaluations, setEvaluations] = useState<EvaluationResponse[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<UserResponseDTO[]>([]);

  // Editable form
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [poste, setPoste] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Evaluation form
  const now = new Date();
  const [evalCollabId, setEvalCollabId] = useState<number | ''>('');
  const [evalMois, setEvalMois] = useState(now.getMonth() + 1);
  const [evalAnnee, setEvalAnnee] = useState(now.getFullYear());
  const [evalQualite, setEvalQualite] = useState(0);
  const [evalDelais, setEvalDelais] = useState(0);
  const [evalEquipe, setEvalEquipe] = useState(0);
  const [evalComm, setEvalComm] = useState(0);
  const [evalCommentaire, setEvalCommentaire] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, evalData, usersData] = await Promise.all([
        fetchMyProfile(),
        fetchEvaluationsParChef(),
        fetchUsers().catch(() => []),
      ]);
      setProfile(profileData);
      setNom(profileData.nom);
      setPrenom(profileData.prenom);
      setEmail(profileData.email);
      setPoste(profileData.poste || '');
      setEvaluations(evalData);
      setCollaborateurs(usersData.filter(u => u.role === 'COLLABORATEUR'));
    } catch (err: any) {
      toast.error(err.message || 'Erreur de chargement');
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

  const handleDeletePhoto = async () => {
    if (!profile) return;
    try {
      const updated = await updateMyProfile({ nom, prenom, email, poste, photoUrl: null });
      setProfile(updated);
      toast.success('Photo de profil supprimée.');
    } catch (err: any) {
      toast.error(err.message || 'Impossible de supprimer la photo.');
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!evalCollabId) { toast.error('Veuillez sélectionner un collaborateur'); return; }
    if (evalQualite === 0 || evalDelais === 0 || evalEquipe === 0 || evalComm === 0) {
      toast.error('Veuillez noter tous les critères (minimum 1 étoile)'); return;
    }
    try {
      setSubmitting(true);
      await submitEvaluation({
        collaborateurId: evalCollabId as number,
        mois: evalMois,
        annee: evalAnnee,
        qualiteTravail: evalQualite,
        respectDelais: evalDelais,
        travailEquipe: evalEquipe,
        communication: evalComm,
        commentaire: evalCommentaire,
      });
      toast.success('Évaluation soumise avec succès !');
      // Reset form
      setEvalCollabId('');
      setEvalQualite(0);
      setEvalDelais(0);
      setEvalEquipe(0);
      setEvalComm(0);
      setEvalCommentaire('');
      // Reload evaluations
      const updatedEvals = await fetchEvaluationsParChef();
      setEvaluations(updatedEvals);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '7px 10px', fontSize: '12px',
    border: `1px solid ${C.border}`, borderRadius: R,
    backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter',
    color: C.text, boxSizing: 'border-box' as const,
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: 'none',
    cursor: 'pointer',
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 style={{ width: '32px', height: '32px', color: C.blue, animation: 'spin 1s linear infinite' }} />
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
      <PageHeader title="Mon Profil" subtitle="Informations personnelles et évaluations" />

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '16px', alignItems: 'start' }}>

        {/* Left: Profile card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ ...cardStyle, borderTop: `3px solid ${C.blue}`, padding: '20px', textAlign: 'center' }}>
            {/* Avatar */}
            <ProfilePhoto
              photoUrl={profile.photoUrl}
              fullName={fullName}
              initials={initials}
              accent={C.blue}
              gradient="linear-gradient(135deg, #1E40AF 0%, #2D9CDB 100%)"
              inputRef={photoInputRef}
              onPhotoChange={handlePhotoChange}
              onDeletePhoto={handleDeletePhoto}
            />

            <p style={{ fontSize: '16px', fontWeight: 800, color: C.text, marginBottom: '2px' }}>{fullName}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: R, backgroundColor: `${C.blue}14`, border: `1px solid ${C.blue}30`, marginBottom: '16px' }}>
              <Briefcase style={{ width: '11px', height: '11px', color: C.blue }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: C.blue }}>Chef de Projet</span>
            </div>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              {[
                { icon: Mail, value: email, label: 'Email' },
                { icon: Phone, value: profile.matricule || '—', label: 'Matricule' },
                { icon: MapPin, value: 'Chef de Projet', label: 'Rôle' },
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
              {[
                { l: 'Évaluations données', v: String(evaluations.length) },
                { l: 'Collaborateurs', v: String(collaborateurs.length) },
              ].map(s => (
                <div key={s.l} style={{ padding: '8px', backgroundColor: C.bg, borderRadius: R }}>
                  <p style={{ fontSize: '9px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: C.blue }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Historique des évaluations données */}
          <SectionCard title="Évaluations Données" subtitle={`${evaluations.length} évaluation(s)`} accent={C.blue}>
            {evaluations.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: C.textMuted }}>Aucune évaluation soumise.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {evaluations.slice(0, 8).map(ev => (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: R, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.blue}` }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #065F46, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 800, flexShrink: 0 }}>
                      {ev.collaborateurPrenom.charAt(0)}{ev.collaborateurNom.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{ev.collaborateurPrenom} {ev.collaborateurNom}</p>
                      <p style={{ fontSize: '10px', color: C.textMuted }}>{MOIS_LABELS[ev.mois]} {ev.annee}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star style={{ width: '12px', height: '12px', color: '#F59E0B', fill: '#F59E0B' }} />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: C.text }}>{ev.moyenneGenerale}</span>
                      <span style={{ fontSize: '10px', color: C.textMuted }}>/5</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right: Edit form + Evaluation form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Edit Profile */}
          <SectionCard title="Paramètres du Compte" subtitle="Modifiez vos informations personnelles" accent={C.blue}
            actions={editing ? null : <BtnGhost onClick={() => setEditing(true)}><Edit3 style={{ width: '11px', height: '11px' }} />Modifier</BtnGhost>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { l: 'Nom', v: nom, sv: setNom },
                { l: 'Prénom', v: prenom, sv: setPrenom },
                { l: 'Email professionnel', v: email, sv: setEmail },
                { l: 'Poste', v: poste, sv: setPoste },
              ].map(({ l, v, sv }) => (
                <div key={l}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{l}</p>
                  {editing ? (
                    <input type="text" value={v} onChange={e => sv(e.target.value)} style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} />
                  ) : (
                    <p style={{ fontSize: '13px', fontWeight: 600, color: C.text, padding: '7px 10px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.borderLight}` }}>{v || '—'}</p>
                  )}
                </div>
              ))}
              {[{ l: 'Département', v: profile.poste || 'Chef de Projet' }, { l: 'Matricule', v: profile.matricule || '—' }].map(({ l, v }) => (
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

          {/* Évaluation de Performance — Formulaire */}
          <SectionCard title="Évaluer un Collaborateur" subtitle="Soumettez une évaluation mensuelle de performance" accent={'#F59E0B'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Collaborateur + Mois/Année */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Collaborateur</p>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={evalCollabId}
                      onChange={e => setEvalCollabId(e.target.value ? Number(e.target.value) : '')}
                      style={{ ...selectStyle, paddingRight: '28px' }}
                    >
                      <option value="">Sélectionner...</option>
                      {collaborateurs.map(c => (
                        <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                      ))}
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: C.textMuted, pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Mois</p>
                  <div style={{ position: 'relative' }}>
                    <select value={evalMois} onChange={e => setEvalMois(Number(e.target.value))} style={{ ...selectStyle, paddingRight: '28px' }}>
                      {Object.entries(MOIS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: C.textMuted, pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Année</p>
                  <div style={{ position: 'relative' }}>
                    <select value={evalAnnee} onChange={e => setEvalAnnee(Number(e.target.value))} style={{ ...selectStyle, paddingRight: '28px' }}>
                      {[2025, 2026, 2027].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <ChevronDown style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: C.textMuted, pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>

              {/* Critères avec étoiles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { l: 'Qualité du travail', v: evalQualite, sv: setEvalQualite },
                  { l: 'Respect des délais', v: evalDelais, sv: setEvalDelais },
                  { l: 'Travail en équipe', v: evalEquipe, sv: setEvalEquipe },
                  { l: 'Communication', v: evalComm, sv: setEvalComm },
                ].map(({ l, v, sv }) => (
                  <div key={l} style={{ padding: '12px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.borderLight}` }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{l}</p>
                    <StarRating value={v} onChange={sv} size={22} />
                    <p style={{ fontSize: '11px', fontWeight: 700, color: v > 0 ? '#F59E0B' : C.textMuted, marginTop: '4px' }}>{v > 0 ? `${v}/5` : 'Non noté'}</p>
                  </div>
                ))}
              </div>

              {/* Commentaire */}
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MessageSquare style={{ width: '10px', height: '10px' }} /> Commentaire (optionnel)
                </p>
                <textarea
                  value={evalCommentaire}
                  onChange={e => setEvalCommentaire(e.target.value)}
                  placeholder="Ajoutez un commentaire sur la performance du collaborateur..."
                  style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' as const }}
                />
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
                <BtnPrimary onClick={handleSubmitEvaluation} style={{ opacity: submitting ? 0.6 : 1 }}>
                  <Send style={{ width: '12px', height: '12px' }} />
                  {submitting ? 'Envoi...' : 'Soumettre l\'évaluation'}
                </BtnPrimary>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
