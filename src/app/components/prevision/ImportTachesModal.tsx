import { useRef, useState } from 'react';
import { CheckCircle, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { C, R, Modal, ModalHeader, BtnPrimary, BtnGhost } from '../ui/design-system';
import { importerTachesProjet } from '../../services/tacheService';

interface ImportTachesModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly projetId: number;
  readonly projetNom?: string;
  readonly onSuccess?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['xlsx', 'xls']);

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? (parts.at(-1) ?? '').toLowerCase() : '';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function ImportTachesModal({
  isOpen,
  onClose,
  projetId,
  projetNom,
  onSuccess,
}: ImportTachesModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateFile = (file: File): string | null => {
    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return 'Format invalide. Seuls les fichiers Excel (.xlsx, .xls) sont acceptes.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Taille maximale depassee (${formatFileSize(file.size)} / 10 Mo max).`;
    }
    if (file.size === 0) return 'Le fichier est vide.';
    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
      return;
    }
    setFileError('');
    setSelectedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFileError('');
    setUploading(false);
    setProgress(0);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 180);

    try {
      const result = await importerTachesProjet(projetId, selectedFile);
      clearInterval(progressInterval);
      setProgress(100);
      toast.success(
        `Tâches importées : ${result.tachesPlanifiees} jour(s) planifié(s) pour ${result.collaborateursConcernes} collaborateur(s).`
      );
      onSuccess?.();
      setTimeout(handleClose, 300);
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(0);
      toast.error(err.message || "Échec de l'import des tâches.");
    } finally {
      setUploading(false);
    }
  };

  const lbl: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 700,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    display: 'block',
    marginBottom: '8px',
  };

  return (
    <Modal onClose={handleClose} maxWidth="520px" accentColor={C.blue}>
      <ModalHeader
        title="Importer les tâches"
        subtitle={projetNom ? `${projetNom} - fichier Excel des tâches` : 'Fichier Excel des tâches'}
        onClose={handleClose}
      />
      <div style={{ padding: '16px 20px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '10px 12px', borderRadius: R, border: `1px solid ${C.blue}25`, backgroundColor: `${C.blue}06` }}>
              <p style={{ fontSize: '11px', color: C.textSecondary, lineHeight: 1.5 }}>
                Colonnes attendues : <strong>matricule</strong> ou <strong>nomCollaborateur</strong> + <strong>prenomCollaborateur</strong>, puis <strong>tache</strong>, <strong>nombreJours</strong>, <strong>dateDebutV2</strong>, <strong>dateFinV2</strong>.
              </p>
            </div>

            <div>
              <p style={lbl}>Fichier Excel *</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {selectedFile ? (
                <div style={{ padding: '12px 14px', borderRadius: R, border: `1px solid ${C.green}40`, backgroundColor: `${C.green}06`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: R, backgroundColor: `${C.green}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileSpreadsheet style={{ width: '18px', height: '18px', color: C.green }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedFile.name}
                    </p>
                    <p style={{ fontSize: '11px', color: C.textMuted }}>{formatFileSize(selectedFile.size)}</p>
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={removeFile}
                      aria-label="Supprimer le fichier"
                      style={{ width: '24px', height: '24px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      <X style={{ width: '12px', height: '12px', color: C.textMuted }} />
                    </button>
                  )}
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  onKeyDown={e => {
                    if ((e.key === ' ' || e.key === 'Enter') && !uploading) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  style={{ padding: '24px 16px', borderRadius: R, border: `2px dashed ${fileError ? C.red : C.border}`, backgroundColor: fileError ? '#FEF2F2' : '#fff', cursor: uploading ? 'not-allowed' : 'pointer', textAlign: 'center', transition: 'all 0.15s', opacity: uploading ? 0.6 : 1 }}
                >
                  <Upload style={{ width: '24px', height: '24px', color: fileError ? C.red : C.textMuted, margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '4px' }}>
                    Cliquez ou glissez un fichier ici
                  </p>
                  <p style={{ fontSize: '11px', color: C.textMuted }}>
                    Formats acceptes : .xlsx, .xls - Taille max : 10 Mo
                  </p>
                </div>
              )}

              {fileError && (
                <p style={{ fontSize: '11px', color: C.red, marginTop: '6px', fontWeight: 500 }}>{fileError}</p>
              )}
            </div>

            {uploading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: C.blue }}>Import en cours...</p>
                  <p style={{ fontSize: '11px', color: C.textMuted }}>{progress}%</p>
                </div>
                <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', backgroundColor: C.blue, borderRadius: '3px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
              <BtnPrimary onClick={undefined} disabled={!selectedFile || uploading}>
                {uploading && <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />}
                {!uploading && progress === 100 && <CheckCircle style={{ width: '12px', height: '12px' }} />}
                {!uploading && progress !== 100 && <Upload style={{ width: '12px', height: '12px' }} />}
                {uploading ? 'Import en cours...' : 'Importer les tâches'}
              </BtnPrimary>
              <BtnGhost onClick={handleClose}>Annuler</BtnGhost>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
