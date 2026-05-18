import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { C, R, PageHeader, SectionCard, BtnPrimary, BtnGhost } from '../components/ui/design-system';
import { apiPost } from '../services/api';

export function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('s2s_token');
      const response = await fetch('/api/import/excel', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
          // Note: On ne met PAS de Content-Type ici, le navigateur le fera 
          // automatiquement pour le FormData avec la bonne boundary.
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de l'import");
      }

      toast.success("Fichier importé avec succès ! Les affectations ont été mises à jour.");
      setTimeout(() => {
        setSuccess(true);
        setFile(null);
      }, 100);
    } catch (err: any) {
      console.error(err);
      toast.error(`Erreur: ${err.message || "Échec de l'importation"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <PageHeader title="Import de Données" subtitle="Chargement des fichiers de forecasting V2 (Excel)" />

      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <SectionCard title="Importer un fichier de Staffing" accent={C.purple}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Info Box */}
            <div style={{ display: 'flex', gap: '12px', padding: '12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: R }}>
              <Info style={{ width: '18px', height: '18px', color: C.blue, flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: '#1E40AF', lineHeight: 1.5 }}>
                Veuillez utiliser le format standard <strong>Staffing_V2</strong>. Le système identifiera automatiquement les collaborateurs, les projets et détectera les conflits de charge après l'import.
              </p>
            </div>

            {/* Drop Zone */}
            <div 
              onClick={() => document.getElementById('file-upload')?.click()}
              style={{ 
                border: `2px dashed ${file ? C.purple : C.border}`, 
                borderRadius: '12px', 
                padding: '40px 20px', 
                textAlign: 'center', 
                cursor: 'pointer',
                backgroundColor: file ? `${C.purple}05` : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <input id="file-upload" type="file" hidden accept=".xlsx, .xls, .xlsm" onChange={handleFileChange} />
              
              {!file ? (
                <>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: `${C.purple}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Upload style={{ width: '24px', height: '24px', color: C.purple }} />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Cliquez pour uploader ou glissez le fichier ici</p>
                  <p style={{ fontSize: '12px', color: C.textMuted }}>Formats acceptés : .xlsx, .xls, .xlsm (Max 10Mo)</p>
                </>
              ) : (
                <>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: `${C.green}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <FileText style={{ width: '24px', height: '24px', color: C.green }} />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>{file.name}</p>
                  <p style={{ fontSize: '12px', color: C.textMuted }}>{(file.size / 1024).toFixed(1)} KB · Prêt pour l'import</p>
                </>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <BtnPrimary 
                onClick={handleUpload} 
                disabled={!file || uploading} 
                style={{ minWidth: '200px' }}
              >
                {uploading ? (
                  <>
                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                    Traitement en cours…
                  </>
                ) : (
                  <>Lancer l'importation</>
                )}
              </BtnPrimary>
              {file && <BtnGhost onClick={() => setFile(null)}>Annuler</BtnGhost>}
            </div>

            {/* Success State */}
            {success && (
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#ECFDF5', borderRadius: R, border: '1px solid #A7F3D0' }}>
                <CheckCircle style={{ width: '32px', height: '32px', color: C.green, margin: '0 auto 10px' }} />
                <p style={{ fontSize: '14px', fontWeight: 700, color: C.green }}>Importation terminée avec succès !</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  style={{ marginTop: '10px', fontSize: '12px', fontWeight: 600, color: C.green, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', margin: '10px auto 0' }}
                >
                  Voir le Dashboard mis à jour <ArrowRight style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
