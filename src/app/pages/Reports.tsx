import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, FileSpreadsheet, FileDown, TrendingUp, Users, FolderKanban, Loader2, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { C, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, Badge } from '../components/ui/design-system';
import { fetchKPISummary, KPISummary } from '../services/kpiService';
import { toast } from 'sonner';

const reportTemplates = [
  { id: 1, name: 'Rapport Staffing Mensuel', description: 'Vue consolidée du taux de staffing et anomalies', icon: Users, color: C.purple, format: 'Excel' },
  { id: 2, name: 'Rapport Performance TNF', description: 'Analyse du taux de non-facturation par équipe', icon: TrendingUp, color: C.blue, format: 'PDF' },
  { id: 3, name: 'Export Ressources', description: 'Liste complète des collaborateurs et utilisation', icon: FileSpreadsheet, color: '#10B981', format: 'Excel' },
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
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader title="Rapports & Analytics" subtitle="Générez vos rapports de pilotage basés sur les données réelles" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
        {reportTemplates.map((template) => (
          <div key={template.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${template.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <template.icon style={{ width: '20px', height: '20px', color: template.color }} />
              </div>
              <Badge>{template.format}</Badge>
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.text }}>{template.name}</h3>
              <p style={{ fontSize: '12px', color: C.textMuted, marginTop: '4px' }}>{template.description}</p>
            </div>
            
            {template.id === 1 && kpis && (
              <div style={{ padding: '8px 12px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '10px', color: C.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Aperçu actuel</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: C.purple }}>Occupation : {kpis.tauxOccupation.toFixed(1)}%</p>
              </div>
            )}

            <button 
              onClick={() => handleGenerate(template.id)}
              disabled={generating !== null}
              style={{ 
                marginTop: 'auto', width: '100%', padding: '10px', borderRadius: R, 
                backgroundColor: template.color, color: '#fff', border: 'none', 
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {generating === template.id ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Download style={{ width: '14px', height: '14px' }} />}
              {generating === template.id ? 'Génération...' : 'Télécharger'}
            </button>
          </div>
        ))}
      </div>

      <SectionCard title="Historique des exports récents" accent={C.blue}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '11px', color: C.textMuted, textTransform: 'uppercase' }}>Fichier</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '11px', color: C.textMuted, textTransform: 'uppercase' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '11px', color: C.textMuted, textTransform: 'uppercase' }}>Statut</th>
                <th style={{ textAlign: 'right', padding: '12px', fontSize: '11px', color: C.textMuted, textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Staffing_Hebdomadaire_S19.xlsx', date: "Aujourd'hui", status: 'Prêt' },
                { name: 'Analyse_TNF_Mensuel.pdf', date: 'Hier', status: 'Expiré' }
              ].map((report, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                  <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600, color: C.text }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText style={{ width: '16px', height: '16px', color: C.textMuted }} />
                      {report.name}
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: C.textSecondary }}>{report.date}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: report.status === 'Prêt' ? '#ECFDF5' : '#F3F4F6', color: report.status === 'Prêt' ? C.green : C.textMuted }}>
                      {report.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button style={{ padding: '6px', borderRadius: '6px', border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer' }}>
                      <FileDown style={{ width: '14px', height: '14px', color: C.textSecondary }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div style={{ backgroundColor: `${C.purple}05`, borderRadius: '12px', border: `1px solid ${C.purple}20`, padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: `${C.purple}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileSpreadsheet style={{ width: '28px', height: '28px', color: C.purple }} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>Export Consolidé Personnalisé</h3>
          <p style={{ fontSize: '13px', color: C.textSecondary, marginTop: '4px' }}>Besoin d'un rapport sur mesure ? Sélectionnez vos paramètres et générez un export complet de votre département.</p>
        </div>
        <BtnPrimary onClick={() => handleGenerate(99)}>Configurer l'export</BtnPrimary>
      </div>
    </div>
  );
}
