import { useState } from 'react';
import { Calendar, Clock, Users, ChevronRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { C, S, R, PageHeader, BtnGhost, BtnPrimary, Avatar, Modal, ModalHeader, SectionLabel, cardStyle } from '../../components/ui/design-system';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const myProjects = [
  { id: 1, name: 'Projet Alpha', client: 'BCP Bank', manager: 'Fatima Zahra Bennis', role: 'Architecte Solution', alloc: 55, completion: 65, status: 'en-cours', start: new Date(2026, 0, 15), end: new Date(2026, 5, 30), color: C.purple, team: 4, desc: "Développement d'une plateforme d'automatisation des processus internes. Réduction des délais de mise en production de 40% grâce aux pipelines CI/CD.", tasks: [{ name: 'Conception architecture microservices', done: true }, { name: 'Revue technique avec l\'équipe', done: true }, { name: 'Documentation API v3', done: false }, { name: 'Tests de performance', done: false }] },
  { id: 2, name: 'Projet Beta', client: 'Attijariwafa Bank', manager: 'Khalid Bennani', role: 'Tech Lead', alloc: 40, completion: 82, status: 'en-cours', start: new Date(2026, 1, 1), end: new Date(2026, 4, 15), color: C.blue, team: 3, desc: "Migration et optimisation de la plateforme analytique. Intégration de modules de reporting en temps réel pour les décideurs.", tasks: [{ name: 'Migration base de données', done: true }, { name: 'Optimisation requêtes SQL', done: true }, { name: 'Dashboard reporting temps réel', done: false }] },
];

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  'en-cours': { label: 'En cours', bg: '#EFF6FF', text: '#1D4ED8', dot: C.blue },
  planifie: { label: 'Planifié', bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' },
  termine: { label: 'Terminé', bg: '#ECFDF5', text: '#065F46', dot: C.green },
};

function ProjectDetailModal({ project, onClose, onViewResources }: { project: typeof myProjects[0]; onClose: () => void; onViewResources: () => void }) {
  const sc = STATUS_CFG[project.status];
  const doneTasks = project.tasks.filter(t => t.done).length;

  return (
    <Modal onClose={onClose} maxWidth="520px" accentColor={project.color}>
      <ModalHeader title={project.name} subtitle={`Client : ${project.client}`} onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Status + meta */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot }} />{sc.label}
          </span>
          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar style={{ width: '12px', height: '12px' }} />{format(project.start, 'dd MMM', { locale: fr })} → {format(project.end, 'dd MMM yyyy', { locale: fr })}</span>
        </div>

        {/* My role card */}
        <div style={{ padding: '10px 14px', borderRadius: R, backgroundColor: `${project.color}08`, border: `1px solid ${project.color}25`, borderLeft: `3px solid ${project.color}` }}>
          <p style={{ fontSize: '10px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Mon rôle</p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{project.role}</p>
          <p style={{ fontSize: '11px', color: project.color, fontWeight: 600 }}>Allocation : {project.alloc}%</p>
        </div>

        {/* Description */}
        <div style={{ padding: '10px 14px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.6 }}>{project.desc}</p>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>Avancement global</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: project.color }}>{project.completion}%</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', backgroundColor: project.color, width: `${project.completion}%` }} />
          </div>
        </div>

        {/* Tasks */}
        <div>
          <SectionLabel>Mes tâches · {doneTasks}/{project.tasks.length} complétées</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {project.tasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: R, border: `1px solid ${C.borderLight}`, backgroundColor: t.done ? '#ECFDF5' : '#fff' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', border: `2px solid ${t.done ? C.green : C.border}`, backgroundColor: t.done ? C.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {t.done && <span style={{ fontSize: '8px', color: '#fff' }}>✓</span>}
                </div>
                <span style={{ fontSize: '12px', fontWeight: t.done ? 500 : 600, color: t.done ? C.textMuted : C.text, textDecoration: t.done ? 'line-through' : 'none' }}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
          <BtnPrimary onClick={onViewResources}>
            <Users style={{ width: '12px', height: '12px' }} />Voir les ressources
          </BtnPrimary>
          <BtnGhost onClick={onClose}>Fermer</BtnGhost>
        </div>
      </div>
    </Modal>
  );
}

export function CollabMyProjects() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<typeof myProjects[0] | null>(null);

  const handleViewResources = (projectName: string) => {
    toast.info(`Ressources filtrées — ${projectName}`);
    navigate('/resources');
  };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <PageHeader title="Mes Projets" subtitle={`${myProjects.length} projets assignés · Youssef El Amrani`} />

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {[
          { l: 'Projets actifs', v: myProjects.filter(p => p.status === 'en-cours').length, c: C.green },
          { l: 'Charge totale', v: `${myProjects.reduce((a, p) => a + p.alloc, 0)}%`, c: '#F59E0B' },
          { l: 'Avancement moyen', v: `${Math.round(myProjects.reduce((a, p) => a + p.completion, 0) / myProjects.length)}%`, c: C.blue },
        ].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.c}`, padding: '12px 16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{s.l}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Project Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: '14px' }}>
        {myProjects.map(p => {
          const sc = STATUS_CFG[p.status];
          const doneTasks = p.tasks.filter(t => t.done).length;
          return (
            <div key={p.id} onClick={() => setSelected(p)}
              style={{ ...cardStyle, cursor: 'pointer', borderLeft: `4px solid ${p.color}`, transition: 'all 0.15s' }}
              onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = S.elevated; d.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = S.card; d.style.transform = 'translateY(0)'; }}
            >
              <div style={{ padding: '16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: C.text, marginBottom: '2px' }}>{p.name}</p>
                    <p style={{ fontSize: '11px', color: C.textMuted }}>{p.client}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: sc.dot }} />{sc.label}
                    </span>
                    <ChevronRight style={{ width: '14px', height: '14px', color: C.textMuted, marginTop: '1px' }} />
                  </div>
                </div>

                {/* My role */}
                <div style={{ padding: '8px 10px', borderRadius: R, backgroundColor: `${p.color}08`, border: `1px solid ${p.color}25`, marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '9px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mon rôle</p>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: C.text }}>{p.role}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '9px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Allocation</p>
                      <p style={{ fontSize: '18px', fontWeight: 800, color: p.color }}>{p.alloc}%</p>
                    </div>
                  </div>
                </div>

                {/* Dates + meta */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar style={{ width: '11px', height: '11px' }} />{format(p.end, 'dd MMM yyyy', { locale: fr })}
                  </span>
                  <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users style={{ width: '11px', height: '11px' }} />{p.team} membres
                  </span>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: C.textMuted }}>Avancement global</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: p.color }}>{p.completion}%</span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: p.color, width: `${p.completion}%` }} />
                  </div>
                </div>

                {/* Tasks preview */}
                <div style={{ padding: '8px 10px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.borderLight}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '10px', color: C.textMuted }}>Mes tâches</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: p.color }}>{doneTasks}/{p.tasks.length} complétées</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: p.color, width: `${(doneTasks / p.tasks.length) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <ProjectDetailModal
          project={selected}
          onClose={() => setSelected(null)}
          onViewResources={() => { handleViewResources(selected.name); setSelected(null); }}
        />
      )}
    </div>
  );
}