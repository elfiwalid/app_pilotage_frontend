import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Loader2, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  C, R, Modal, ModalHeader, BtnPrimary, BtnGhost,
} from '../ui/design-system';
import { importerPrevision } from '../../services/previsionService';

/* ─── TYPES ─────────────────────────────────────── */
interface ImportPrevisionModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly projetId: number;
  readonly onSuccess?: () => void;
}


/* ─── CONSTANTS ─────────────────────────────────── */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_EXTENSIONS = new Set(['xlsx', 'xls']);
const BACKEND_TYPE_PREVISION = 'TRIMESTRIELLE';
const MONTH_LABELS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

/* ─── HELPERS ───────────────────────────────────── */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? (parts.at(-1) ?? '').toLowerCase() : '';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/* ════════════════════════════════════════════════ */
/* ─── IMPORT PREVISION MODAL ────────────────────── */
/* ════════════════════════════════════════════════ */
export function ImportPrevisionModal({ isOpen, onClose, projetId, onSuccess }: ImportPrevisionModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Period selection state — single month/year
  const currentYear = new Date().getFullYear();
  const [mois, setMois] = useState<number>(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState<number>(currentYear);

  if (!isOpen) return null;

  /* ─── File validation ─── */
  const validateFile = (file: File): string | null => {
    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return 'Format invalide. Seuls les fichiers Excel (.xlsx, .xls) sont acceptés.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Taille maximale dépassée (${formatFileSize(file.size)} / 10 Mo max).`;
    }
    if (file.size === 0) {
      return 'Le fichier est vide.';
    }
    return null;
  };

  /* ─── File selection handler ─── */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
    } else {
      setFileError('');
      setSelectedFile(file);
    }
  };

  /* ─── Drop handler ─── */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
    } else {
      setFileError('');
      setSelectedFile(file);
    }
  };

  /* ─── Remove selected file ─── */
  const removeFile = () => {
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* ─── Submit handler ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);

    // Simulate progress increments during upload
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const periodeDebut = `${annee}-${String(mois).padStart(2, '0')}-01`;
      const finDate = new Date(annee, mois, 0);
      const periodeFin = `${finDate.getFullYear()}-${String(finDate.getMonth() + 1).padStart(2, '0')}-${String(finDate.getDate()).padStart(2, '0')}`;

      await importerPrevision(projetId, selectedFile, BACKEND_TYPE_PREVISION, periodeDebut, periodeFin);
      clearInterval(progressInterval);
      setProgress(100);

      toast.success('Prévision importée avec succès !', { duration: 3000 });
      onSuccess?.();

      // Small delay to show 100% before closing
      setTimeout(() => {
        handleClose();
      }, 300);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setProgress(0);

      const message = err instanceof Error ? err.message : 'Une erreur technique est survenue.';

      if (message.toLowerCase().includes('format') || message.toLowerCase().includes('excel')) {
        toast.error('Format de fichier invalide.', { duration: 5000 });
      } else if (message.toLowerCase().includes('taille') || message.toLowerCase().includes('10 mo')) {
        toast.error('La taille maximale est dépassée (10 Mo).', { duration: 5000 });
      } else {
        toast.error(message, { duration: 5000 });
      }
    } finally {
      setUploading(false);
    }
  };

  /* ─── Close and reset ─── */
  const handleClose = () => {
    setSelectedFile(null);
    setFileError('');
    setUploading(false);
    setProgress(0);
    onClose();
  };

  /* ─── Styles ─── */
  const lbl: React.CSSProperties = {
    fontSize: '10px', fontWeight: 700, color: C.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'block', marginBottom: '8px',
  };

  return (
    <Modal onClose={handleClose} maxWidth="520px" accentColor={C.purple}>
      <ModalHeader title="Importer une prévision mensuelle V2" subtitle="Fichier Excel V2 pour le mois sélectionné" onClose={handleClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── Période ── */}
            <div>
              <p style={lbl}>Mois et année *</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={mois}
                  onChange={e => setMois(Number(e.target.value))}
                  disabled={uploading}
                  aria-label="Mois"
                  style={{ flex: 1, padding: '8px 10px', borderRadius: R, border: `1px solid ${C.border}`, fontSize: '12px', fontFamily: 'Inter', color: C.text, backgroundColor: '#fff', cursor: uploading ? 'not-allowed' : 'pointer' }}
                >
                  {MONTH_LABELS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={annee}
                  onChange={e => setAnnee(Number(e.target.value))}
                  disabled={uploading}
                  aria-label="Année"
                  style={{ width: '90px', padding: '8px 10px', borderRadius: R, border: `1px solid ${C.border}`, fontSize: '12px', fontFamily: 'Inter', color: C.text, backgroundColor: '#fff', cursor: uploading ? 'not-allowed' : 'pointer' }}
                >
                  {Array.from({ length: 5 }, (_, i) => currentYear - 1 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '4px' }}>
                La période importée correspond uniquement au mois sélectionné.
              </p>
            </div>

            {/* ── Fichier Excel ── */}
            <div>
              <p style={lbl}>Fichier Excel *</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                aria-label="Sélectionner un fichier Excel"
              />

              {selectedFile ? (
                <div style={{
                  padding: '12px 14px', borderRadius: R,
                  border: `1px solid ${C.green}40`,
                  backgroundColor: `${C.green}06`,
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: R,
                    backgroundColor: `${C.green}14`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FileSpreadsheet style={{ width: '18px', height: '18px', color: C.green }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedFile.name}
                    </p>
                    <p style={{ fontSize: '11px', color: C.textMuted }}>
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={removeFile}
                      aria-label="Supprimer le fichier"
                      style={{
                        width: '24px', height: '24px', borderRadius: R,
                        border: `1px solid ${C.border}`, backgroundColor: '#fff',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.borderLight)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                    >
                      <X style={{ width: '12px', height: '12px', color: C.textMuted }} />
                    </button>
                  )}
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Sélectionner un fichier Excel"
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  onKeyDown={e => { if ((e.key === ' ' || e.key === 'Enter') && !uploading) { e.preventDefault(); fileInputRef.current?.click(); } }}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onDragEnter={e => { e.preventDefault(); (e.currentTarget as HTMLDivElement).style.borderColor = C.purple; (e.currentTarget as HTMLDivElement).style.backgroundColor = `${C.purple}06`; }}
                  onDragLeave={e => { e.preventDefault(); (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.backgroundColor = '#fff'; }}
                  style={{
                    padding: '24px 16px', borderRadius: R,
                    border: `2px dashed ${fileError ? C.red : C.border}`,
                    backgroundColor: fileError ? '#FEF2F2' : '#fff',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                    opacity: uploading ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { if (!uploading && !fileError) { (e.currentTarget as HTMLDivElement).style.borderColor = C.purple; (e.currentTarget as HTMLDivElement).style.backgroundColor = `${C.purple}04`; } }}
                  onMouseLeave={e => { if (!fileError) { (e.currentTarget as HTMLDivElement).style.borderColor = fileError ? C.red : C.border; (e.currentTarget as HTMLDivElement).style.backgroundColor = fileError ? '#FEF2F2' : '#fff'; } }}
                >
                  <Upload style={{ width: '24px', height: '24px', color: fileError ? C.red : C.textMuted, margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '4px' }}>
                    Cliquez ou glissez un fichier ici
                  </p>
                  <p style={{ fontSize: '11px', color: C.textMuted }}>
                    Formats acceptés : .xlsx, .xls · Taille max : 10 Mo
                  </p>
                </div>
              )}

              {/* File error message */}
              {fileError && (
                <p style={{ fontSize: '11px', color: C.red, marginTop: '6px', fontWeight: 500 }}>
                  {fileError}
                </p>
              )}
            </div>

            {/* ── Progress indicator ── */}
            {uploading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: C.purple }}>
                    Import en cours…
                  </p>
                  <p style={{ fontSize: '11px', color: C.textMuted }}>{progress}%</p>
                </div>
                <div style={{
                  width: '100%', height: '6px', borderRadius: '3px',
                  backgroundColor: C.borderLight, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${progress}%`, height: '100%',
                    backgroundColor: C.purple, borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}

            {/* ── Summary ── */}
            {selectedFile && !uploading && (
              <div style={{
                padding: '10px 14px', borderRadius: R,
                backgroundColor: `${C.purple}06`, border: `1px solid ${C.purple}25`,
              }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: C.purple, marginBottom: '3px' }}>
                  Récapitulatif
                </p>
                <p style={{ fontSize: '11px', color: C.textSecondary }}>
                  Prévision mensuelle V2 · Mois : {MONTH_LABELS[mois - 1]} {annee} · Fichier : {selectedFile.name}
                </p>
              </div>
            )}

            {/* ── Actions ── */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
              <BtnPrimary onClick={undefined} disabled={!selectedFile || uploading}>
                {uploading && (
                  <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
                )}
                {!uploading && progress === 100 && (
                  <CheckCircle style={{ width: '12px', height: '12px' }} />
                )}
                {!uploading && progress !== 100 && (
                  <Upload style={{ width: '12px', height: '12px' }} />
                )}
                {uploading ? 'Import en cours…' : 'Importer la prévision mensuelle'}
              </BtnPrimary>
              <BtnGhost onClick={handleClose}>Annuler</BtnGhost>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
