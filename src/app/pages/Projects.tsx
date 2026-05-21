import { useState, useEffect } from 'react';
import { Search, Filter, Users, Calendar, X, Clock, User, Download, CheckCircle, AlertCircle, RefreshCw, ChevronRight, UserPlus, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { C, S, R, PageHeader, SectionCard, BtnPrimary, BtnSecondary, BtnGhost, Avatar, Modal, ModalHeader, SectionLabel, thStyle, tdStyle, cardStyle } from '../components/ui/design-system';
import { fetchMesProjets, ProjetResponseDTO } from '../services/projetService';
import { fetchUsers, UserResponseDTO } from '../services/userService';
import { creerAffectation, fetchAffectationsParProjet, AffectationResponseDTO } from '../services/affectationService';

/* ─── STAFFING MODAL (Add someone to project) ───── */
function StaffingModal({ project, users, onClose, onRefresh }: { project: ProjetResponseDTO; users: UserResponseDTO[]; onClose: () => void; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [dateDebut, setDateDebut] = useState(project.dateDebut);
  const [dateFin, setDateFin] = useState(project.dateFin);
  const [taux, setTaux] = useState(100);
  const [role, setRole] = useState('');

  const handleSubmit = async () => {
    if (!selectedUser) return toast.error("Veuillez choisir un collaborateur");
    setLoading(true);
    try {
      await creerAffectation({
        projetId: project.id,
        collaborateurId: Number(selectedUser),
        dateDebut,
        dateFin,
        tauxAffectation: taux,
        roleDansProjet: role
      });
      toast.success("Affectation réussie !");
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'affectation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} accentColor={C.purple} maxWidth="480px">
      <ModalHeader title="Affecter un collaborateur" subtitle={`Projet : ${project.nom}`} onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <SectionLabel>Collaborateur</SectionLabel>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger style={{ width: '100%', fontSize: '13px', height: '38px' }}><SelectValue placeholder="Choisir un collaborateur..." /></SelectTrigger>
            <SelectContent>
              {users.map(u => (
                <SelectItem key={u.id} value={String(u.id)}>{u.prenom} {u.nom} ({u.poste})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <SectionLabel>Du</SectionLabel>
            <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} 
              style={{ width: '100%', padding: '8px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, outline: 'none' }} />
          </div>
          <div>
            <SectionLabel>Au</SectionLabel>
            <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} 
              style={{ width: '100%', padding: '8px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, outline: 'none' }} />
          </div>
        </div>

        <div>
          <SectionLabel>Taux d'affectation (%)</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="range" min="10" max="100" step="5" value={taux} onChange={e => setTaux(Number(e.target.value))} 
              style={{ flex: 1, accentColor: C.purple }} />
            <span style={{ fontSize: '14px', fontWeight: 800, color: C.purple, width: '40px' }}>{taux}%</span>
          </div>
        </div>

        <div>
          <SectionLabel>Rôle sur le projet</SectionLabel>
          <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="Ex: Lead Dev, Expert technique..."
            style={{ width: '100%', padding: '8px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <BtnGhost onClick={onClose} style={{ flex: 1 }}>Annuler</BtnGhost>
          <BtnPrimary onClick={handleSubmit} disabled={loading} style={{ flex: 1 }}>
            {loading ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : 'Confirmer'}
          </BtnPrimary>
        </div>
      </div>
    </Modal>
  );
}

/* ─── DETAIL MODAL ──────────────────────────────── */
function ProjectModal({ project, onClose, onStaffing }: { project: ProjetResponseDTO; onClose: () => void; onStaffing: () => void }) {
  const [affectations, setAffectations] = useState<AffectationResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAffectations();
  }, [project.id]);

  async function loadAffectations() {
    try {
      const data = await fetchAffectationsParProjet(project.id);
      setAffectations(data);
    } catch (err) {
      toast.error("Impossible de charger l'équipe");
    } finally {
      setLoading(false);
    }
  }

  const start = parseISO(project.dateDebut || new Date().toISOString());
  const end = parseISO(project.dateFin || new Date().toISOString());
  const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));

  return (
    <Modal onClose={onClose} maxWidth="640px" accentColor={C.purple}>
      <ModalHeader title={project.nom} subtitle={`Chef de projet : ${project.chefProjetNomComplet}`} onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar style={{ width: '12px', height: '12px' }} />{format(start, 'dd MMM yyyy', { locale: fr })} → {format(end, 'dd MMM yyyy', { locale: fr })}</span>
          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '12px', height: '12px' }} />{duration} mois</span>
        </div>

        {project.description && (
          <div style={{ padding: '10px 14px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.6 }}>{project.description}</p>
          </div>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <SectionLabel>Équipe projet · {affectations.length} membres</SectionLabel>
            <BtnSecondary small onClick={onStaffing}><UserPlus style={{ width: '11px', height: '11px' }} /> Staffer</BtnSecondary>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}><Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>
            ) : affectations.length > 0 ? (
              affectations.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: R, border: `1px solid ${C.border}` }}>
                  <Avatar name={m.collaborateurNomComplet} color={C.purple} size={26} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{m.collaborateurNomComplet}</p>
                    <p style={{ fontSize: '10px', color: C.textMuted }}>{m.roleDansProjet || 'Collaborateur'}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: C.purple }}>{m.tauxAffectation}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '11px', color: C.textMuted, textAlign: 'center', padding: '10px' }}>Aucun collaborateur staffé pour le moment.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─── MAIN ─────────────────────────────────────── */
export function Projects() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<ProjetResponseDTO | null>(null);
  const [staffingFor, setStaffingFor] = useState<ProjetResponseDTO | null>(null);
  
  const [projects, setProjects] = useState<ProjetResponseDTO[]>([]);
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pData, uData] = await Promise.all([fetchMesProjets(), fetchUsers()]);
      setProjects(pData);
      setUsers(uData);
    } catch (err) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  const filtered = projects.filter(p => {
    const m = p.nom.toLowerCase().includes(search.toLowerCase());
    return m && (filterStatus === 'all' || p.statut === filterStatus);
  });

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {[
          { l: 'En cours', v: projects.filter(p => p.statut === 'EN_COURS').length, icon: AlertCircle, c: C.blue },
          { l: 'Planifiés', v: projects.filter(p => p.statut === 'PLANIFIE').length, icon: Clock, c: '#F59E0B' },
          { l: 'Terminés', v: projects.filter(p => p.statut === 'TERMINE').length, icon: CheckCircle, c: C.green },
        ].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.c}`, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
            <s.icon style={{ width: '20px', height: '20px', color: s.c }} />
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
              <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px' }}>{s.l}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
          <Search style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: C.textMuted, pointerEvents: 'none' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un projet…"
            style={{ width: '100%', paddingLeft: '28px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none' }}
            onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger style={{ width: '160px', fontSize: '12px', borderRadius: R, height: '32px', backgroundColor: '#fff' }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="EN_COURS">En cours</SelectItem>
            <SelectItem value="PLANIFIE">Planifié</SelectItem>
            <SelectItem value="TERMINE">Terminé</SelectItem>
          </SelectContent>
        </Select>
        <span style={{ fontSize: '11px', color: C.textMuted, marginLeft: 'auto' }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {/* Project Cards */}
      {loading ? (
        <div style={{ padding: '100px', textAlign: 'center' }}>
          <Loader2 style={{ width: '40px', height: '40px', color: C.purple, animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: '12px', color: C.textMuted, fontSize: '14px' }}>Chargement des projets…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '80px', textAlign: 'center', backgroundColor: '#fff', borderRadius: R, border: `1px dashed ${C.border}` }}>
          <AlertCircle style={{ width: '32px', height: '32px', color: C.textMuted, margin: '0 auto 12px' }} />
          <p style={{ color: C.textMuted, fontSize: '14px' }}>Aucun projet trouvé</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {filtered.map(project => {
            const start = parseISO(project.dateDebut || new Date().toISOString());
            const end = parseISO(project.dateFin || new Date().toISOString());
            
            return (
              <div key={project.id} onClick={() => setSelected(project)}
                style={{ ...cardStyle, cursor: 'pointer', borderTop: `3px solid ${C.purple}`, transition: 'box-shadow 0.15s, transform 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = S.elevated; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = S.card; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', backgroundColor: `${C.purple}10`, border: `1px solid ${C.purple}30`, color: C.purple, display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: C.purple, display: 'inline-block' }} />
                        {project.statut.toUpperCase()}
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.nom}</p>
                    </div>
                    <ChevronRight style={{ width: '16px', height: '16px', color: C.textMuted, flexShrink: 0, marginTop: '4px' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingBottom: '10px', borderBottom: `1px solid ${C.borderLight}` }}>
                    <Avatar name={project.chefProjetNomComplet} size={22} color={C.purple} />
                    <div>
                      <p style={{ fontSize: '10px', color: C.textMuted, lineHeight: 1.2 }}>Chef de projet</p>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, lineHeight: 1.2 }}>{project.chefProjetNomComplet}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '11px', color: C.textMuted }}>
                    <Calendar style={{ width: '12px', height: '12px' }} />
                    {format(start, 'dd MMM', { locale: fr })} → {format(end, 'dd MMM yyyy', { locale: fr })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px dashed ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Users style={{ width: '12px', height: '12px', color: C.textMuted }} />
                      <span style={{ fontSize: '11px', color: C.textMuted }}>Équipe active</span>
                    </div>
                    <BtnSecondary small onClick={(e) => { e.stopPropagation(); setStaffingFor(project); }}>
                      <UserPlus style={{ width: '10px', height: '10px' }} /> Staffer
                    </BtnSecondary>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <ProjectModal 
          project={selected} 
          onClose={() => setSelected(null)} 
          onStaffing={() => {
            const p = selected;
            setSelected(null);
            setStaffingFor(p);
          }} 
        />
      )}

      {staffingFor && (
        <StaffingModal 
          project={staffingFor} 
          users={users} 
          onClose={() => setStaffingFor(null)} 
          onRefresh={loadData} 
        />
      )}
    </div>
  );
}
