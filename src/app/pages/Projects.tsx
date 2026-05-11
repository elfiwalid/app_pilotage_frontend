import { useState } from 'react';
import { Search, Filter, Users, Calendar, X, Clock, User, Download, CheckCircle, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { C, S, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, Avatar, Modal, ModalHeader, SectionLabel, thStyle, tdStyle, cardStyle } from '../components/ui/design-system';

/* ─── DATA ─────────────────────────────────────── */
const projectsData = [
  { id: 1, name: 'Projet Alpha', manager: 'Fatima Zahra Bennis', status: 'en-cours', start: new Date(2026, 0, 15), end: new Date(2026, 5, 30), team: [{ name: 'Youssef El Amrani', role: 'Architecte Solution', alloc: 55 }, { name: 'Salma Idrissi', role: 'Dev Junior', alloc: 75 }, { name: 'Ahmed Chafik', role: 'Lead Dev', alloc: 60 }, { name: 'Khadija Tazi', role: 'QA Engineer', alloc: 50 }], completion: 65, description: "Développement d'une plateforme innovante pour l'automatisation des processus internes. Réduction des délais de mise en production de 40% grâce aux pipelines CI/CD." },
  { id: 2, name: 'Projet Beta', manager: 'Khalid Bennani', status: 'en-cours', start: new Date(2026, 1, 1), end: new Date(2026, 4, 15), team: [{ name: 'Youssef El Amrani', role: 'Tech Lead', alloc: 40 }, { name: 'Sara Benali', role: 'Data Engineer', alloc: 82 }, { name: 'Karim Nassiri', role: 'Analyste', alloc: 75 }], completion: 82, description: "Migration et optimisation de la plateforme analytique. Intégration de modules de reporting en temps réel." },
  { id: 3, name: 'Projet Gamma', manager: 'Amina Tazi', status: 'planifie', start: new Date(2026, 3, 1), end: new Date(2026, 7, 31), team: [{ name: 'Youssef El Amrani', role: 'Architecte', alloc: 40 }, { name: 'Hamza Lahlou', role: 'Dev Backend', alloc: 40 }, { name: 'Salma Idrissi', role: 'Business Analyst', alloc: 75 }], completion: 15, description: "Refonte complète du système de gestion. Migration vers une architecture microservices cloud-native." },
  { id: 4, name: 'Projet Delta', manager: 'Omar El Alami', status: 'en-cours', start: new Date(2026, 2, 15), end: new Date(2026, 5, 15), team: [{ name: 'Sara Benali', role: 'Data Scientist', alloc: 82 }, { name: 'Imane El Fassi', role: 'ML Engineer', alloc: 65 }, { name: 'Youssef Alami', role: 'Dev Python', alloc: 60 }], completion: 58, description: "R&D sur des modèles d'IA pour la prédiction des comportements clients." },
  { id: 5, name: 'Projet Epsilon', manager: 'Nadia Chraibi', status: 'termine', start: new Date(2025, 10, 1), end: new Date(2026, 2, 31), team: [{ name: 'Sara Benali', role: 'Lead Dev', alloc: 100 }, { name: 'Ahmed Chafik', role: 'Dev Senior', alloc: 55 }, { name: 'Fatima Zahra Berrada', role: 'Testeur', alloc: 80 }], completion: 100, description: "Implémentation du module de paiement instantané conforme aux normes bancaires." },
  { id: 6, name: 'Projet Zeta', manager: 'Houda Lahlou', status: 'planifie', start: new Date(2026, 4, 1), end: new Date(2026, 9, 31), team: [{ name: 'Hamza Lahlou', role: 'Data Analyst', alloc: 40 }, { name: 'Hana El Fassi', role: 'Visualisation', alloc: 80 }], completion: 5, description: "Tableau de bord analytique avancé pour le suivi des performances commerciales en temps réel." },
];

const STATUS: Record<string, { label: string; bg: string; text: string; border: string; dot: string; accent: string }> = {
  'en-cours': { label: 'En cours', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', dot: C.blue, accent: C.purple },
  planifie: { label: 'Planifié', bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', dot: '#F59E0B', accent: '#F59E0B' },
  termine: { label: 'Terminé', bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', dot: C.green, accent: C.green },
};

const ALLOC_COLOR = (v: number) => v >= 100 ? C.red : v >= 80 ? '#F59E0B' : C.green;
const AVATAR_COLORS = [C.purple, C.blue, C.green, C.magenta, '#F59E0B', C.cyan];

/* ─── DETAIL MODAL ──────────────────────────────── */
function ProjectModal({ project, onClose }: { project: typeof projectsData[0]; onClose: () => void }) {
  const sc = STATUS[project.status];
  const duration = Math.ceil((project.end.getTime() - project.start.getTime()) / (1000 * 60 * 60 * 24 * 30));

  return (
    <Modal onClose={onClose} maxWidth="640px" accentColor={sc.accent}>
      <ModalHeader title={project.name} subtitle={`Chef de projet : ${project.manager}`} onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Status + Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '3px', backgroundColor: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sc.dot, display: 'inline-block' }} />
            {sc.label}
          </span>
          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar style={{ width: '12px', height: '12px' }} />{format(project.start, 'dd MMM yyyy', { locale: fr })} → {format(project.end, 'dd MMM yyyy', { locale: fr })}</span>
          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '12px', height: '12px' }} />{duration} mois</span>
          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}><Users style={{ width: '12px', height: '12px' }} />{project.team.length} membres</span>
        </div>

        {/* Description */}
        <div style={{ padding: '10px 14px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.6 }}>{project.description}</p>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>Avancement global</p>
            <p style={{ fontSize: '14px', fontWeight: 800, color: sc.accent }}>{project.completion}%</p>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', backgroundColor: sc.accent, width: `${project.completion}%`, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* Team */}
        <div>
          <SectionLabel>Équipe projet · {project.team.length} collaborateurs</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {project.team.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: R, border: `1px solid ${C.border}`, transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
              >
                <Avatar name={m.name} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} size={26} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
                  <p style={{ fontSize: '10px', color: C.textMuted }}>{m.role}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <div style={{ width: '64px', height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: ALLOC_COLOR(m.alloc), width: `${Math.min(m.alloc, 100)}%` }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: ALLOC_COLOR(m.alloc), minWidth: '30px', textAlign: 'right' }}>{m.alloc}%</span>
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
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<typeof projectsData[0] | null>(null);
  const [exporting, setExporting] = useState(false);

  const doExport = () => {
    setExporting(true);
    toast.loading('Génération du V2 Consolidé…', { id: 'v2' });
    setTimeout(() => { setExporting(false); toast.success('Fichier V2 Consolidé exporté !', { id: 'v2' }); }, 2000);
  };

  const filtered = projectsData.filter(p => {
    const m = p.name.toLowerCase().includes(search.toLowerCase()) || p.manager.toLowerCase().includes(search.toLowerCase());
    return m && (filterStatus === 'all' || p.status === filterStatus);
  });

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Gestion des Projets" subtitle={`${projectsData.length} projets · ${projectsData.filter(p => p.status === 'en-cours').length} en cours`}>
        <BtnPrimary onClick={doExport} disabled={exporting}>
          {exporting ? <RefreshCw style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : <Download style={{ width: '12px', height: '12px' }} />}
          {exporting ? 'Génération…' : 'Exporter le V2 Consolidé'}
        </BtnPrimary>
      </PageHeader>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {[
          { l: 'En cours', v: projectsData.filter(p => p.status === 'en-cours').length, icon: AlertCircle, c: C.blue },
          { l: 'Planifiés', v: projectsData.filter(p => p.status === 'planifie').length, icon: Clock, c: '#F59E0B' },
          { l: 'Terminés', v: projectsData.filter(p => p.status === 'termine').length, icon: CheckCircle, c: C.green },
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
            <SelectItem value="en-cours">En cours</SelectItem>
            <SelectItem value="planifie">Planifié</SelectItem>
            <SelectItem value="termine">Terminé</SelectItem>
          </SelectContent>
        </Select>
        <span style={{ fontSize: '11px', color: C.textMuted, marginLeft: 'auto' }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {/* Project Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {filtered.map(project => {
          const sc = STATUS[project.status];
          return (
            <div key={project.id} onClick={() => setSelected(project)}
              style={{ ...cardStyle, cursor: 'pointer', borderTop: `3px solid ${sc.accent}`, transition: 'box-shadow 0.15s, transform 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = S.elevated; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = S.card; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ padding: '14px 16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', backgroundColor: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot, display: 'inline-block' }} />{sc.label}
                    </span>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</p>
                  </div>
                  <ChevronRight style={{ width: '16px', height: '16px', color: C.textMuted, flexShrink: 0, marginTop: '4px' }} />
                </div>

                {/* Manager */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingBottom: '10px', borderBottom: `1px solid ${C.borderLight}` }}>
                  <Avatar name={project.manager} size={22} color={sc.accent} />
                  <div>
                    <p style={{ fontSize: '10px', color: C.textMuted, lineHeight: 1.2 }}>Chef de projet</p>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, lineHeight: 1.2 }}>{project.manager}</p>
                  </div>
                </div>

                {/* Dates */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '11px', color: C.textMuted }}>
                  <Calendar style={{ width: '12px', height: '12px' }} />
                  {format(project.start, 'dd MMM', { locale: fr })} → {format(project.end, 'dd MMM yyyy', { locale: fr })}
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '10px', color: C.textMuted }}>Avancement</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: sc.accent }}>{project.completion}%</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: sc.accent, width: `${project.completion}%` }} />
                  </div>
                </div>

                {/* Team */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Users style={{ width: '12px', height: '12px', color: C.textMuted }} />
                    <span style={{ fontSize: '11px', color: C.textMuted }}>{project.team.length} collaborateurs</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    {project.team.slice(0, 4).map((m, i) => (
                      <Avatar key={i} name={m.name} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} size={22}
                        // @ts-ignore
                        style={{ marginLeft: i > 0 ? '-6px' : 0, border: '2px solid white', boxSizing: 'content-box' }} />
                    ))}
                    {project.team.length > 4 && (
                      <div style={{ width: '22px', height: '22px', borderRadius: R, backgroundColor: C.borderLight, border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: C.textMuted, marginLeft: '-6px' }}>
                        +{project.team.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
