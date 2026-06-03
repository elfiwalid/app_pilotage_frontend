import { useState, useEffect } from 'react';
import { Calendar, Users, ChevronRight, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { C, S, R, PageHeader, BtnGhost, BtnPrimary, Modal, ModalHeader, SectionLabel, cardStyle } from '../../components/ui/design-system';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { fetchCollabProjets, type CollabProjetDTO } from '../../services/collaborateurService';

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  EN_COURS: { label: 'En cours', bg: '#EFF6FF', text: '#1D4ED8', dot: C.blue },
  PLANIFIE: { label: 'Planifié', bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' },
  TERMINE: { label: 'Terminé', bg: '#ECFDF5', text: '#065F46', dot: C.green },
  SUSPENDU: { label: 'Suspendu', bg: '#FEF2F2', text: '#B91C1C', dot: C.red },
};

function parseDate(iso: string): Date {
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
}

function ProjectDetailModal({ project, onClose }: { project: CollabProjetDTO; onClose: () => void }) {
  const sc = STATUS_CFG[project.statut] || STATUS_CFG.EN_COURS;

  return (
    <Modal onClose={onClose} maxWidth="520px" accentColor={project.couleur}>
      <ModalHeader title={project.nom} subtitle={`Chef de projet : ${project.chefProjetNomComplet}`} onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Status + meta */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot }} />{sc.label}
          </span>
          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar style={{ width: '12px', height: '12px' }} />
            {format(parseDate(project.dateDebut), 'dd MMM', { locale: fr })} → {format(parseDate(project.dateFin), 'dd MMM yyyy', { locale: fr })}
          </span>
          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users style={{ width: '12px', height: '12px' }} />{project.tailleEquipe} membre{project.tailleEquipe > 1 ? 's' : ''}
          </span>
        </div>

        {/* My role card */}
        <div style={{ padding: '10px 14px', borderRadius: R, backgroundColor: `${project.couleur}08`, border: `1px solid ${project.couleur}25`, borderLeft: `3px solid ${project.couleur}` }}>
          <p style={{ fontSize: '10px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Mon rôle</p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{project.role}</p>
          <p style={{ fontSize: '11px', color: project.couleur, fontWeight: 600 }}>Allocation : {project.tauxAffectation}%</p>
        </div>

        {/* Description */}
        {project.description && (
          <div style={{ padding: '10px 14px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.6 }}>{project.description}</p>
          </div>
        )}

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>Avancement (temps écoulé)</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: project.couleur }}>{project.avancement}%</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', backgroundColor: project.couleur, width: `${project.avancement}%` }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
          <BtnGhost onClick={onClose}>Fermer</BtnGhost>
        </div>
      </div>
    </Modal>
  );
}

export function CollabMyProjects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projets, setProjets] = useState<CollabProjetDTO[]>([]);
  const [selected, setSelected] = useState<CollabProjetDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setProjets(await fetchCollabProjets());
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les projets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 style={{ width: '32px', height: '32px', color: C.green, animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: C.textMuted }}>Chargement des projets…</p>
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
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: R, border: 'none', backgroundColor: C.green, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
            <RefreshCw style={{ width: '12px', height: '12px' }} />Réessayer
          </button>
        </div>
      </div>
    );
  }

  const actifs = projets.filter(p => p.statut === 'EN_COURS');
  const chargeTotale = actifs.reduce((a, p) => a + p.tauxAffectation, 0);
  const avancementMoyen = actifs.length ? Math.round(actifs.reduce((a, p) => a + p.avancement, 0) / actifs.length) : 0;

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <PageHeader title="Mes Projets" subtitle={`${projets.length} projet(s) assigné(s) · ${user?.name ?? ''}`} />

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {[
          { l: 'Projets actifs', v: actifs.length, c: C.green },
          { l: 'Charge totale', v: `${Math.round(chargeTotale * 10) / 10}%`, c: chargeTotale > 100 ? C.red : '#F59E0B' },
          { l: 'Avancement moyen', v: `${avancementMoyen}%`, c: C.blue },
        ].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.c}`, padding: '12px 16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{s.l}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
          </div>
        ))}
      </div>

      {projets.length === 0 ? (
        <div style={{ ...cardStyle, padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: C.textMuted }}>Vous n'êtes assigné à aucun projet pour le moment.</p>
        </div>
      ) : (
        /* Project Cards */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: '14px' }}>
          {projets.map(p => {
            const sc = STATUS_CFG[p.statut] || STATUS_CFG.EN_COURS;
            return (
              <div key={p.id} onClick={() => setSelected(p)}
                style={{ ...cardStyle, cursor: 'pointer', borderLeft: `4px solid ${p.couleur}`, transition: 'all 0.15s' }}
                onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = S.elevated; d.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = S.card; d.style.transform = 'translateY(0)'; }}
              >
                <div style={{ padding: '16px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: C.text, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</p>
                      <p style={{ fontSize: '11px', color: C.textMuted }}>Chef : {p.chefProjetNomComplet}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: sc.dot }} />{sc.label}
                      </span>
                      <ChevronRight style={{ width: '14px', height: '14px', color: C.textMuted, marginTop: '1px' }} />
                    </div>
                  </div>

                  {/* My role */}
                  <div style={{ padding: '8px 10px', borderRadius: R, backgroundColor: `${p.couleur}08`, border: `1px solid ${p.couleur}25`, marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: '9px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mon rôle</p>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{p.role}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '9px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Allocation</p>
                        <p style={{ fontSize: '18px', fontWeight: 800, color: p.couleur }}>{p.tauxAffectation}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates + meta */}
                  <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar style={{ width: '11px', height: '11px' }} />{format(parseDate(p.dateFin), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users style={{ width: '11px', height: '11px' }} />{p.tailleEquipe} membre{p.tailleEquipe > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', color: C.textMuted }}>Avancement (temps écoulé)</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: p.couleur }}>{p.avancement}%</span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '2px', backgroundColor: p.couleur, width: `${p.avancement}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <ProjectDetailModal project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
