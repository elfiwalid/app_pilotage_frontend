import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, FileSpreadsheet, FileDown, TrendingUp, Users, FolderKanban, Loader2, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { C, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, Badge, cardStyle } from '../components/ui/design-system';
import { fetchKPISummary, KPISummary } from '../services/kpiService';
import { toast } from 'sonner';

const reportTemplates = [
  { id: 1, name: 'Rapport Staffing Mensuel', description: 'Vue consolidée du taux de staffing et anomalies', icon: Users, color: '#7B61FF', format: 'Excel' },
  { id: 2, name: 'Rapport Projets', description: 'Performance et avancement des projets', icon: FolderKanban, color: '#2D9CDB', format: 'PDF' },
  { id: 3, name: 'Analyse Conflits', description: 'Détection et résolution des conflits', icon: TrendingUp, color: '#F59E0B', format: 'Excel' },
  { id: 4, name: 'Export Ressources', description: 'Liste complète des collaborateurs et utilisation', icon: FileSpreadsheet, color: '#10B981', format: 'Excel' },
];

const recentReports = [
  { id: 1, name: 'Staffing_Mars_2026.xlsx', type: 'Staffing Mensuel', date: '2026-04-01', size: '2.4 MB', user: 'Marie Dubois' },
  { id: 2, name: 'Projets_Q1_2026.pdf', type: 'Rapport Projets', date: '2026-04-05', size: '1.8 MB', user: 'Pierre Laurent' },
  { id: 3, name: 'Conflits_Avril_2026.xlsx', type: 'Analyse Conflits', date: '2026-04-09', size: '1.2 MB', user: 'Marie Dubois' },
];

export function Reports() {
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await fetchKPISummary();
      setKpis(data);
    } catch (err) {
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  }

  const handleGenerate = (id: number) => {
    setGenerating(id);
    toast.loading("Génération du rapport en cours...", { id: 'gen' });
    
    setTimeout(() => {
      setGenerating(null);
      toast.success("Le rapport a été généré avec succès !", { id: 'gen' });
    }, 2000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: C.bg }}>
        <Loader2 style={{ width: '40px', height: '40px', color: C.purple, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader title="Rapports & Exportations" subtitle="Générez et téléchargez vos rapports consolidés" />

      {/* Templates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '24px' }}>
        {reportTemplates.map((template) => (
          <div key={template.id} style={{ ...cardStyle, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: `1px solid ${C.borderLight}`, transition: 'all 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = template.color; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.borderLight; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '8px', backgroundColor: `${template.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <template.icon style={{ width: '28px', height: '28px', color: template.color }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 500, padding: '4px 8px', backgroundColor: '#F5F7FA', color: '#4B5563', borderRadius: '4px' }}>
                {template.format}
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>{template.name}</h3>
              <p style={{ fontSize: '14px', color: '#4B5563' }}>{template.description}</p>
            </div>
            
            <button 
              onClick={() => handleGenerate(template.id)}
              disabled={generating !== null}
              style={{ 
                marginTop: 'auto', width: '100%', padding: '10px', borderRadius: '8px', 
                backgroundColor: template.color, color: '#fff', border: 'none', 
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background-color 0.2s'
              }}
            >
              {generating === template.id ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Download style={{ width: '16px', height: '16px' }} />}
              {generating === template.id ? 'Génération...' : 'Générer le rapport'}
            </button>
          </div>
        ))}
      </div>

      {/* Recent Reports Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: `1px solid ${C.border}` }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>Rapports Récents</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Select defaultValue="7">
              <SelectTrigger style={{ width: '192px', height: '36px', borderRadius: R, border: `1px solid ${C.border}`, fontSize: '14px' }}>
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 derniers jours</SelectItem>
                <SelectItem value="30">30 derniers jours</SelectItem>
                <SelectItem value="90">90 derniers jours</SelectItem>
              </SelectContent>
            </Select>
            <button style={{ padding: '8px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F7FA')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}>
              <Filter style={{ width: '20px', height: '20px', color: '#4B5563' }} />
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#F5F7FA' }}>
              <tr>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Nom du fichier</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Type</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Date de création</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Taille</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Créé par</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>Action</th>
              </tr>
            </thead>
            <tbody style={{ divideY: `1px solid ${C.border}` }}>
              {recentReports.map((report) => (
                <tr key={report.id} style={{ borderBottom: `1px solid ${C.borderLight}` }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F7FA')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {report.name.endsWith('.xlsx') ? (
                        <FileSpreadsheet style={{ width: '20px', height: '20px', color: '#16A34A' }} />
                      ) : (
                        <FileText style={{ width: '20px', height: '20px', color: '#DC2626' }} />
                      )}
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>{report.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '14px', color: '#4B5563' }}>{report.type}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar style={{ width: '16px', height: '16px', color: '#9CA3AF' }} />
                      <span style={{ fontSize: '14px', color: '#4B5563' }}>
                        {new Date(report.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '14px', color: '#4B5563' }}>{report.size}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '14px', color: '#4B5563' }}>{report.user}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseEnter={e => { (e.currentTarget.style.backgroundColor = '#F3F4F6'); (e.currentTarget.firstChild as HTMLElement).style.color = '#7B61FF'; }} 
                      onMouseLeave={e => { (e.currentTarget.style.backgroundColor = 'transparent'); (e.currentTarget.firstChild as HTMLElement).style.color = '#4B5563'; }}>
                      <FileDown style={{ width: '16px', height: '16px', color: '#4B5563', transition: 'color 0.2s' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Export */}
      <div style={{ background: 'linear-gradient(to bottom right, rgba(123, 97, 255, 0.1), rgba(45, 156, 219, 0.1))', borderRadius: '8px', padding: '24px', border: '1px solid rgba(123, 97, 255, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>Export Consolidé Personnalisé</h3>
            <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '16px' }}>Créez un rapport sur mesure en sélectionnant les données et la période de votre choix</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Données à inclure</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4B5563' }}>
                    <input type="checkbox" defaultChecked style={{ borderRadius: '4px', accentColor: C.purple }} /> Ressources et utilisation
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4B5563' }}>
                    <input type="checkbox" defaultChecked style={{ borderRadius: '4px', accentColor: C.purple }} /> Projets et avancement
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4B5563' }}>
                    <input type="checkbox" style={{ borderRadius: '4px', accentColor: C.purple }} /> Historique des conflits
                  </label>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Période d'analyse</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="date" style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: `1px solid ${C.border}`, fontSize: '14px', outline: 'none' }} onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
                  <input type="date" style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: `1px solid ${C.border}`, fontSize: '14px', outline: 'none' }} onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ alignSelf: 'flex-end', paddingBottom: '16px' }}>
            <button style={{ padding: '10px 24px', backgroundColor: '#1F2937', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'background-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#111827')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1F2937')}
            >
              Générer l'export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
