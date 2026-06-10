import { Bell, BookOpen, Brain, FileSpreadsheet, ShieldCheck, UserCircle, Users } from 'lucide-react';
import { C, PageHeader, R, SectionCard } from '../components/ui/design-system';

const GUIDE_SECTIONS = [
  {
    title: 'Présentation',
    icon: BookOpen,
    accent: C.purple,
    content: 'STAFF2STAFF v2.0 centralise le staffing projet, les prévisions V2, la détection des anomalies et le suivi opérationnel des équipes.',
  },
  {
    title: 'Rôles utilisateurs',
    icon: Users,
    accent: C.blue,
    content: 'Directeur, Resource Manager, Chef de Projet et Collaborateur disposent chacun de vues adaptées à leurs responsabilités de pilotage, affectation, suivi et consultation.',
  },
  {
    title: 'Import V2',
    icon: FileSpreadsheet,
    accent: C.green,
    content: 'Le Chef de Projet importe une prévision mensuelle V2 depuis le détail projet. Le fichier Excel alimente les prévisions, affectations et analyses associées.',
  },
  {
    title: 'Rapports V2',
    icon: ShieldCheck,
    accent: C.orange,
    content: 'Les rapports mensuels PM sont générés à partir des données réelles importées : conflits, surcharges, sous-charges, collaborateurs et projets concernés.',
  },
  {
    title: 'Notifications',
    icon: Bell,
    accent: C.red,
    content: 'Les notifications signalent les événements importants comme les anomalies détectées, les imports traités et les actions nécessitant une attention utilisateur.',
  },
  {
    title: 'Profil',
    icon: UserCircle,
    accent: '#14B8A6',
    content: 'Chaque utilisateur peut consulter et mettre à jour ses informations de profil, avec un avatar par défaut si aucune photo n’est renseignée.',
  },
  {
    title: 'Prévision IA',
    icon: Brain,
    accent: '#7C3AED',
    content: 'Le module de Prévision IA estime le besoin en ressources du mois suivant à partir des rapports V2, des anomalies et des charges observées.',
  },
];

export function Documentation() {
  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <PageHeader
        title="Guide utilisateur STAFF2STAFF v2.0"
        subtitle="Référence rapide des parcours et fonctionnalités principales"
      />

      <SectionCard title="Vue d’ensemble" subtitle="Application de pilotage staffing et prévisions" accent={C.magenta}>
        <p style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.7, maxWidth: '920px' }}>
          STAFF2STAFF aide les équipes à suivre les projets, importer des prévisions V2, détecter les anomalies de staffing,
          consulter les rapports mensuels et anticiper les besoins futurs en ressources.
        </p>
      </SectionCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        {GUIDE_SECTIONS.map(section => (
          <div
            key={section.title}
            style={{
              backgroundColor: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: R,
              padding: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: R, backgroundColor: `${section.accent}14`, color: section.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <section.icon style={{ width: '17px', height: '17px' }} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>{section.title}</p>
              <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.55 }}>{section.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
