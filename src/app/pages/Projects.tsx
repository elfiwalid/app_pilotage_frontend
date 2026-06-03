import { useState, useEffect } from 'react';
import { Search, Users, Calendar, Clock, CheckCircle, AlertCircle, ChevronRight, Loader2, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { C, S, R, PageHeader, BtnPrimary, BtnGhost, Avatar, Modal, ModalHeader, SectionLabel, cardStyle } from '../components/ui/design-system';
import { fetchRmProjets, exportV2Consolide, type RmProjetDTO, type MembreEquipeDTO } from '../services/resourceManagerService';

/* ─── HELPERS ─────────────────────────────────── */
const STATUS: Record<string, { label: string; bg: string; text: string; border: string; dot: string; accent: string }> = {
  EN_COURS: { label: 'En cours', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', dot: C.blue, accent: C.purple },
  PLANIFIE: { label: 'Planifié', bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', dot: '#F59E0B', accent: '#F59E0B' },
  TERMINE: { label: 'Terminé', bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', dot: C.green, accent: C.green },
  SUSPENDU: { label: 'Suspendu', bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', dot: C.red, accent: C.red },
};

const ALLOC_COLOR = (v: number) => v >= 100 ? C.red : v >= 80 ? '#F59E0B' : C.green;
const AVATAR_COLORS = [C.purple, C.blue, C.green, C.magenta, '#F59E0B', C.cyan, '#8B5CF6'];

function parseDate(iso: string): Date {
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
}

/* ─── DETAIL MODAL ──────────────────────────────── */
function ProjectModal({ project, onClose }: { project: RmProjetDTO; onClose: () => void }) {
  const sc = STATUS[project.statut] || STATUS.EN_COURS;
  const start = parseDate(project.dateDebut);
  const end = parseDate(project.dateFin);
  const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  return (
    <Modal onClose={onClose} maxWidth="640px" accentColor={sc.accent}>
      <ModalHeader title={project.nom} subtitle={`Chef de projet : ${project.chefProjetNomComplet}`} onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Status + Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '3px', backgroundColor: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sc.dot, display: 'inline-block' }} />{sc.label}
          </span>
          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar style={{ width: '12px', height: '12px' }} />{format(start, 'dd MMM yyyy', { locale: fr })} → {format(end, 'dd MMM yyyy', { locale: fr })}</span>
          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '12px', height: '12px' }} />{duration} mois</span>
          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}><Users style={{ width: '12px', height: '12px' }} />{project.equipe.length} membres</span>
        </div>

        {/* Description */}
        {project.description && (
          <div style={{ padding: '10px 14px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.6 }}>{project.description}</p>
          </div>
        )}

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>Avancement global</p>
            <p style={{ fontSize: '14px', fontWeight: 800, color: sc.accent }}>{project.avancement}%</p>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', backgroundColor: sc.accent, width: `${project.avancement}%`, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* Team */}
        <div>
          <SectionLabel>Équipe projet · {project.equipe.length} collaborateurs</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {project.equipe.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: R, border: `1px solid ${C.border}`, transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}>
                <Avatar name={`${m.prenom} ${m.nom}`} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} size={26} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.prenom} {m.nom}</p>
                  <p style={{ fontSize: '10px', color: C.textMuted }}>{m.role}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <div style={{ width: '64px', height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: ALLOC_COLOR(m.tauxAffectation), width: `${Math.min(m.tauxAffectation, 100)}%` }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: ALLOC_COLOR(m.tauxAffectation), minWidth: '30px', textAlign: 'right' }}>{m.tauxAffectation}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
          <BtnGhost onClick={onClose}>Fermer</BtnGhost>
        </div>
      </div>
    </Modal>
  );
}

/* ─── MAIN ─────────────────────────────────────── */
export function Projects() {
  const [projets, setProjets] = useState<RmProjetDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<RmProjetDTO | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [exportSelection, setExportSelection] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setProjets(await fetchRmProjets());
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les projets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = projets.filter(p => {
    const m = p.nom.toLowerCase().includes(search.toLowerCase()) || p.chefProjetNomComplet.toLowerCase().includes(search.toLowerCase());
    return m && (filterStatus === 'all' || p.statut === filterStatus);
  });

  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: C.magenta, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle style={{ width: '32px', height: '32px', color: C.red, margin: '0 auto 10px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{error}</p>
          <button onClick={load} style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: R, border: 'none', backgroundColor: C.magenta, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
            <RefreshCw style={{ width: '12px', height: '12px' }} />Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Gestion des Projets" subtitle={`${projets.length} projets · ${projets.filter(p => p.statut === 'EN_COURS').length} en cours`}>
        <BtnPrimary onClick={() => { const exportable = projets.filter(p => p.statut === 'EN_COURS' || p.statut === 'TERMINE'); setShowExport(true); setExportSelection(new Set(exportable.map(p => p.id))); }}>
          <Download style={{ width: '12px', height: '12px' }} />Exporter V2 Consolidé
        </BtnPrimary>
      </PageHeader>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {[
          { l: 'En cours', v: projets.filter(p => p.statut === 'EN_COURS').length, icon: AlertCircle, c: C.blue },
          { l: 'Planifiés', v: projets.filter(p => p.statut === 'PLANIFIE').length, icon: Clock, c: '#F59E0B' },
          { l: 'Terminés', v: projets.filter(p => p.statut === 'TERMINE').length, icon: CheckCircle, c: C.green },
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
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', cursor: 'pointer' }}>
          <option value="all">Tous les statuts</option>
          <option value="EN_COURS">En cours</option>
          <option value="PLANIFIE">Planifié</option>
          <option value="TERMINE">Terminé</option>
          <option value="SUSPENDU">Suspendu</option>
        </select>
        <span style={{ fontSize: '11px', color: C.textMuted, marginLeft: 'auto' }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {/* Project Cards */}
      {filtered.length === 0 ? (
        <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: C.textMuted }}>Aucun projet trouvé.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {filtered.map(project => {
            const sc = STATUS[project.statut] || STATUS.EN_COURS;
            const start = parseDate(project.dateDebut);
            const end = parseDate(project.dateFin);
            return (
              <div key={project.id} onClick={() => setSelected(project)}
                style={{ ...cardStyle, cursor: 'pointer', borderTop: `3px solid ${sc.accent}`, transition: 'box-shadow 0.15s, transform 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = S.elevated; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = S.card; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
                <div style={{ padding: '14px 16px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', backgroundColor: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot, display: 'inline-block' }} />{sc.label}
                      </span>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.nom}</p>
                    </div>
                    <ChevronRight style={{ width: '16px', height: '16px', color: C.textMuted, flexShrink: 0, marginTop: '4px' }} />
                  </div>

                  {/* Manager */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingBottom: '10px', borderBottom: `1px solid ${C.borderLight}` }}>
                    <Avatar name={project.chefProjetNomComplet} size={22} color={sc.accent} />
                    <div>
                      <p style={{ fontSize: '10px', color: C.textMuted, lineHeight: 1.2 }}>Chef de projet</p>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, lineHeight: 1.2 }}>{project.chefProjetNomComplet}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '11px', color: C.textMuted }}>
                    <Calendar style={{ width: '12px', height: '12px' }} />
                    {format(start, 'dd MMM', { locale: fr })} → {format(end, 'dd MMM yyyy', { locale: fr })}
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '10px', color: C.textMuted }}>Avancement</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: sc.accent }}>{project.avancement}%</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '2px', backgroundColor: sc.accent, width: `${project.avancement}%` }} />
                    </div>
                  </div>

                  {/* Team */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Users style={{ width: '12px', height: '12px', color: C.textMuted }} />
                      <span style={{ fontSize: '11px', color: C.textMuted }}>{project.equipe.length} collaborateur{project.equipe.length > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                      {project.equipe.slice(0, 4).map((m, i) => (
                        <div key={m.id} style={{ width: '22px', height: '22px', borderRadius: R, backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: '#fff', marginLeft: i > 0 ? '-6px' : 0, border: '2px solid white', boxSizing: 'content-box' }}>
                          {m.prenom.charAt(0)}{m.nom.charAt(0)}
                        </div>
                      ))}
                      {project.equipe.length > 4 && (
                        <div style={{ width: '22px', height: '22px', borderRadius: R, backgroundColor: C.borderLight, border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: C.textMuted, marginLeft: '-6px' }}>
                          +{project.equipe.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}

      {/* Export V2 Modal */}
      {showExport && (
        <Modal onClose={() => setShowExport(false)} maxWidth="520px" accentColor={C.purple}>
          <ModalHeader title="Exporter V2 Consolidé" subtitle="Sélectionnez les projets à inclure dans l'export" onClose={() => setShowExport(false)} />
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Select all / none */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: C.textSecondary }}>{exportSelection.size} projet(s) sélectionné(s)</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setExportSelection(new Set(projets.map(p => p.id)))}
                  style={{ fontSize: '11px', fontWeight: 600, color: C.purple, background: 'none', border: 'none', cursor: 'pointer' }}>Tout sélectionner</button>
                <button onClick={() => setExportSelection(new Set())}
                  style={{ fontSize: '11px', fontWeight: 600, color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>Tout désélectionner</button>
              </div>
            </div>

            {/* Project list with checkboxes */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {projets.filter(p => p.statut === 'EN_COURS' || p.statut === 'TERMINE').map(p => {
                const sc = STATUS[p.statut] || STATUS.EN_COURS;
                const isChecked = exportSelection.has(p.id);
                return (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: R, border: `1px solid ${isChecked ? C.purple : C.border}`, backgroundColor: isChecked ? `${C.purple}06` : '#fff', cursor: 'pointer', transition: 'all 0.12s' }}>
                    <input type="checkbox" checked={isChecked}
                      onChange={() => {
                        const next = new Set(exportSelection);
                        if (isChecked) next.delete(p.id); else next.add(p.id);
                        setExportSelection(next);
                      }}
                      style={{ width: '16px', height: '16px', accentColor: C.purple, cursor: 'pointer' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{p.nom}</p>
                      <p style={{ fontSize: '10px', color: C.textMuted }}>{p.chefProjetNomComplet} · {p.equipe.length} collab(s)</p>
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>{sc.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Export button */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: `1px solid ${C.borderLight}` }}>
              <BtnPrimary disabled={exportSelection.size === 0 || exporting} onClick={async () => {
                setExporting(true);
                try {
                  await exportV2Consolide([...exportSelection]);
                  toast.success('V2 Consolidé exporté avec succès !');
                  setShowExport(false);
                } catch (e: any) {
                  toast.error(e.message || 'Erreur lors de l\'export.');
                } finally {
                  setExporting(false);
                }
              }}>
                {exporting
                  ? <RefreshCw style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
                  : <Download style={{ width: '12px', height: '12px' }} />}
                {exporting ? 'Génération…' : `Exporter ${exportSelection.size} projet(s)`}
              </BtnPrimary>
              <BtnGhost onClick={() => setShowExport(false)}>Annuler</BtnGhost>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
